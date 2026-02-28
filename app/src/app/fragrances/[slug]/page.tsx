import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { getPosts } from '@/lib/api';

// Cache each fragrance page for 5 minutes; rebuild on next request after expiry
export const revalidate = 300;

// Pre-build all known fragrance slugs at deploy time for instant first loads
export async function generateStaticParams() {
  const supabase = createServerSupabase();
  const { data } = await supabase.from('fragrances').select('slug');
  return (data ?? []).map((f) => ({ slug: f.slug }));
}

// Types
type NoteAssignment = {
  note_id: string;
  note_name: string;
  position: 'top' | 'middle' | 'base';
  sort_order: number;
};

type FragranceImage = {
  url: string;
  alt_text: string | null;
  sort_order: number;
};

type FragranceDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rating: number | null;
  price_cents: number | null;
  currency: string | null;
  size_ml: number | null;
  house_url: string | null;
  fragrance_url: string | null;
  review_post_id: string | null;
  fragrance_houses: {
    name: string;
    description: string | null;
  } | null;
};

async function getFragranceBySlug(slug: string): Promise<FragranceDetail | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('fragrances')
    .select('*, fragrance_houses(name, description)')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    if (error) console.error('[fragrance page] getFragranceBySlug error:', error.message);
    return null;
  }
  return data as FragranceDetail;
}

async function getFragranceNotes(fragranceId: string): Promise<NoteAssignment[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('fragrance_note_map')
    .select('note_id, position, sort_order, fragrance_notes(name)')
    .eq('fragrance_id', fragranceId)
    .order('sort_order', { ascending: true });

  return (data ?? []).map((m: Record<string, unknown>) => ({
    note_id: m.note_id as string,
    note_name: (m.fragrance_notes as { name: string } | null)?.name ?? '',
    position: m.position as 'top' | 'middle' | 'base',
    sort_order: m.sort_order as number,
  }));
}

async function getFragranceImages(fragranceId: string): Promise<FragranceImage[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('fragrance_images')
    .select('url, alt_text, sort_order')
    .eq('fragrance_id', fragranceId)
    .order('sort_order', { ascending: true });

  return (data ?? []) as FragranceImage[];
}

function safeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function FragrancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const fragrance = await getFragranceBySlug(slug);
  if (!fragrance) notFound();

  const [notes, images] = await Promise.all([
    getFragranceNotes(fragrance.id),
    getFragranceImages(fragrance.id),
  ]);

  const notesByPosition = {
    top: notes.filter((n) => n.position === 'top'),
    middle: notes.filter((n) => n.position === 'middle'),
    base: notes.filter((n) => n.position === 'base'),
  };

  const primaryImage = images[0] ?? null;

  // Fetch linked review post if exists
  let reviewPost: { slug: string; title: string } | null = null;

  if (fragrance.review_post_id) {
    try {
      const posts = await getPosts();
      const match = posts.find((p) => p.id === fragrance.review_post_id);
      if (match) {
        reviewPost = { slug: match.slug, title: match.title };
      }
    } catch {
      // Review fetch failure is non-fatal
    }
  }

  const hasNotes = notes.length > 0;

  return (
    <div className="min-h-screen bg-tertiary/30">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Radial depth gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(244,191,219,0.22) 0%, transparent 68%)'}} aria-hidden="true" />
        {/* Decorative — right side only, leaves left clear for text */}
        <div className="hidden sm:contents">
          <FloralAccent className="absolute top-4 right-[5%] w-28 h-28 opacity-35" />
          <FloralAccent className="absolute bottom-0 right-[20%] w-16 h-16 opacity-20 rotate-45" />
          <StarSticker className="absolute top-16 right-[10%] w-5 h-5" />
          <StarSticker className="absolute top-28 right-[17%] w-3 h-3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
          {/* Breadcrumb */}
          <Link
            href="/scent-library"
            className="inline-flex items-center gap-1.5 text-xs text-secondary/70 hover:text-secondary transition-colors tracking-wide"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Scent Library
          </Link>

          {/* Editorial header block */}
          <div className="mt-8 max-w-4xl">
            {/* One typographic line: italic house · bold fragrance, all Cormorant Garamond */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
              {fragrance.fragrance_houses?.name && (
                <>
                  <span className="italic font-normal text-secondary/75">
                    {fragrance.fragrance_houses.name}
                  </span>
                  <span className="text-secondary/30 font-light mx-3 not-italic">·</span>
                </>
              )}
              <span className="font-semibold text-primary not-italic">
                {fragrance.name}
              </span>
            </h1>

            {/* Decorative rule: short solid → star dot → long gradient fade */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px w-10 bg-secondary/50" />
              <svg viewBox="0 0 10 10" className="w-2 h-2 text-secondary/50 shrink-0" fill="currentColor">
                <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" />
              </svg>
              <div className="h-px flex-1 max-w-50" style={{background: 'linear-gradient(to right, rgba(178,112,146,0.30), transparent)'}} />
            </div>

            {/* Rating — left-aligned */}
            {fragrance.rating != null && (
              <div className="flex items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${i < fragrance.rating! ? 'text-secondary' : 'text-secondary/20'}`}
                    filled={i < fragrance.rating!}
                  />
                ))}
                <span className="text-sm text-primary/45 ml-2">{fragrance.rating} / 5</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main content: image left, details right */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start">

          {/* Left: Image */}
          <div className="flex flex-col gap-4">
            <div className="aspect-3/4 bg-white/60 border border-secondary/10 rounded-2xl overflow-hidden flex items-center justify-center panel-depth">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt_text ?? fragrance.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Elegant placeholder */
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <FloralAccent className="w-32 h-32 opacity-30" />
                  <p className="text-primary/30 text-sm font-display italic">No image yet</p>
                </div>
              )}
            </div>

            {/* Additional images row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.slice(1).map((img, i) => (
                  <div key={i} className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-secondary/10">
                    <img src={img.url} alt={img.alt_text ?? ''} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Price + size + links */}
            <div className="bg-white/50 border border-secondary/10 rounded-xl p-5 space-y-3 card-shadow">
              {(fragrance.price_cents || fragrance.size_ml) && (
                <div className="flex items-center gap-4 flex-wrap">
                  {fragrance.price_cents && (
                    <div>
                      <p className="text-xs text-primary/40 uppercase tracking-widest mb-0.5">Price</p>
                      <p className="font-display text-xl font-medium text-primary">
                        {formatPrice(fragrance.price_cents, fragrance.currency ?? 'USD')}
                      </p>
                    </div>
                  )}
                  {fragrance.size_ml && (
                    <div>
                      <p className="text-xs text-primary/40 uppercase tracking-widest mb-0.5">Size</p>
                      <p className="font-display text-xl font-medium text-primary">{fragrance.size_ml} ml</p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {safeUrl(fragrance.fragrance_url) && (
                  <a
                    href={safeUrl(fragrance.fragrance_url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-secondary text-white px-3 py-1.5 rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    Shop Fragrance
                    <ExternalIcon className="w-3 h-3" />
                  </a>
                )}
                {safeUrl(fragrance.house_url) && (
                  <a
                    href={safeUrl(fragrance.house_url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs border border-secondary/30 text-secondary px-3 py-1.5 rounded-full hover:bg-secondary/10 transition-colors"
                  >
                    Visit House
                    <ExternalIcon className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            {/* Description */}
            {fragrance.description && (
              <div>
                <SectionLabel>About</SectionLabel>
                <p className="text-primary/70 leading-relaxed text-base">
                  {fragrance.description}
                </p>
              </div>
            )}

            {/* House info */}
            {fragrance.fragrance_houses && (
              <div>
                <SectionLabel>Fragrance House</SectionLabel>
                <p className="font-display text-lg font-semibold text-primary mb-1">
                  {fragrance.fragrance_houses.name}
                </p>
                {fragrance.fragrance_houses.description && (
                  <p className="text-sm text-primary/60 leading-relaxed">
                    {fragrance.fragrance_houses.description}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {hasNotes && (
              <div>
                <SectionLabel>Fragrance Notes</SectionLabel>
                <div className="space-y-4">
                  {notesByPosition.top.length > 0 && (
                    <NoteGroup label="Top" notes={notesByPosition.top} color="bg-secondary/10 text-secondary" />
                  )}
                  {notesByPosition.middle.length > 0 && (
                    <NoteGroup label="Heart" notes={notesByPosition.middle} color="bg-primary/8 text-primary/70" />
                  )}
                  {notesByPosition.base.length > 0 && (
                    <NoteGroup label="Base" notes={notesByPosition.base} color="bg-tertiary text-primary/60" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Review section */}
      {reviewPost && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="border-t border-secondary/10 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div>
                <SectionLabel>Our Review</SectionLabel>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary">
                  {reviewPost.title}
                </h2>
              </div>
              <Link
                href={`/posts/${reviewPost.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors shrink-0"
              >
                Read Full Review
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="bg-white/60 border border-secondary/10 rounded-2xl p-8 text-center card-shadow">
              <BottleIcon className="w-10 h-10 text-secondary/30 mx-auto mb-4" />
              <p className="text-primary/60 font-display text-lg italic mb-4">
                We&apos;ve reviewed this fragrance in depth.
              </p>
              <Link
                href={`/posts/${reviewPost.slug}`}
                className="inline-flex items-center gap-2 bg-secondary text-white text-sm px-5 py-2.5 rounded-full hover:bg-secondary/80 transition-colors"
              >
                Read the Review
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* Small helpers */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-widest text-secondary uppercase font-medium mb-2">{children}</p>
  );
}

function NoteGroup({
  label,
  notes,
  color,
}: {
  label: string;
  notes: NoteAssignment[];
  color: string;
}) {
  return (
    <div>
      <p className="text-xs text-primary/40 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {notes.map((n) => (
          <span key={n.note_id} className={`text-xs px-3 py-1 rounded-full font-medium note-pill-depth ${color}`}>
            {n.note_name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* SVG Icons */

const StarSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill="#B27092" opacity="0.5" />
  </svg>
);

const FloralAccent = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="#C9CBA3" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
    <circle cx="50" cy="50" r="30" stroke="#B27092" strokeWidth="1" opacity="0.4" />
    <path d="M50 20V80" stroke="#C9CBA3" strokeWidth="1" opacity="0.3" />
    <path d="M20 50H80" stroke="#C9CBA3" strokeWidth="1" opacity="0.3" />
  </svg>
);

const StarIcon = ({ className, filled = false }: { className?: string; filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

const BottleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="7" y="10" width="10" height="12" rx="1" />
    <rect x="9" y="6" width="6" height="4" rx="0.5" />
    <rect x="10" y="3" width="4" height="3" rx="0.5" />
    <line x1="9" y1="14" x2="15" y2="14" opacity="0.5" />
  </svg>
);

const ExternalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14L21 3" />
  </svg>
);
