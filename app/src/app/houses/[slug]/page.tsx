import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/siteConfig';

export const revalidate = 300;

type HouseDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  house_url: string | null;
  price: number | null;
  rating: number | null;
};

type HouseFragrance = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rating: number | null;
  price_cents: number | null;
  currency: string | null;
  size_ml: number | null;
  fragrance_url: string | null;
  primary_image_url?: string | null;
};

export async function generateStaticParams() {
  const supabase = createServerSupabase();
  const { data } = await supabase.from('fragrance_houses').select('slug');
  return (data ?? []).map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('fragrance_houses')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'House Not Found' };

  const title = data.name;
  const description = data.description ?? `Explore fragrances from ${data.name} on Noseblind.`;
  const url = `${siteUrl}/houses/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PriceTier({ price }: { price: number | null }) {
  if (!price) return null;
  const tier = Math.min(Math.max(Math.round(price), 1), 4);
  return (
    <div className="flex items-center gap-px" aria-label={`Price tier: ${tier} out of 4`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className={`font-display text-2xl tracking-tighter leading-none ${
            i < tier ? 'text-secondary' : 'text-primary/20'
          }`}
        >
          $
        </span>
      ))}
    </div>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number | null; size?: 'sm' | 'xs' }) {
  if (rating === null) return null;
  const dim = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`${dim} ${i < rating ? 'text-secondary' : 'text-secondary/20'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 0l1.5 3.5 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10l.5-3.5L1 4l3.5-.5z" />
        </svg>
      ))}
    </div>
  );
}

function formatPrice(priceCents: number | null, currency: string | null): string | null {
  if (priceCents === null) return null;
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const symbol = symbols[currency ?? 'USD'] ?? (currency ?? '$');
  const amount = priceCents / 100;
  return `${symbol}${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

function BotanicalSpray({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 220"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Central stem */}
      <path
        d="M80 210 Q76 172 80 138 Q84 104 79 68 Q78 48 80 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Left branches */}
      <path d="M80 158 Q60 142 42 148" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M42 148 Q30 138 27 124" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M80 130 Q58 116 48 100" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Right branches */}
      <path d="M80 145 Q100 130 118 136" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M118 136 Q130 126 134 112" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M80 118 Q102 104 112 90" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Leaves — left */}
      <path d="M80 92 Q62 76 46 82 Q58 94 80 92Z" fill="currentColor" opacity="0.2" />
      <path d="M80 92 Q62 76 46 82" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M48 100 Q34 90 30 76 Q44 80 48 100Z" fill="currentColor" opacity="0.15" />
      {/* Leaves — right */}
      <path d="M80 84 Q96 66 112 72 Q100 86 80 84Z" fill="currentColor" opacity="0.2" />
      <path d="M80 84 Q96 66 112 72" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M112 90 Q126 80 130 66 Q116 72 112 90Z" fill="currentColor" opacity="0.15" />
      {/* Bloom — top */}
      <circle cx="80" cy="20" r="12" fill="currentColor" opacity="0.08" />
      <circle cx="80" cy="20" r="7" fill="currentColor" opacity="0.14" />
      <circle cx="80" cy="20" r="3.5" fill="currentColor" opacity="0.35" />
      {[0, 51, 102, 153, 204, 255, 306].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 80 + 14 * Math.cos(rad);
        const cy = 20 + 14 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="4" fill="currentColor" opacity="0.18" />;
      })}
      {/* Small accent dots */}
      <circle cx="27" cy="123" r="2.5" fill="currentColor" opacity="0.35" />
      <circle cx="134" cy="111" r="2.5" fill="currentColor" opacity="0.35" />
      <circle cx="42" cy="147" r="2" fill="currentColor" opacity="0.28" />
      <circle cx="118" cy="135" r="2" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HousePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerSupabase();

  const { data: houseRaw } = await supabase
    .from('fragrance_houses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!houseRaw) notFound();
  const house = houseRaw as HouseDetail;

  const { data: fragrancesRaw } = await supabase
    .from('fragrances')
    .select('id, name, slug, description, rating, price_cents, currency, size_ml, fragrance_url')
    .eq('house_id', house.id)
    .order('name', { ascending: true });

  const fragrancesBase = fragrancesRaw ?? [];
  const fragIds = fragrancesBase.map((f) => f.id);

  // Fetch primary images for house and fragrances in parallel
  const [{ data: houseImgData }, { data: fragImgData }] = await Promise.all([
    supabase.from('house_images').select('url').eq('house_id', house.id).eq('is_primary', true).maybeSingle(),
    fragIds.length > 0
      ? supabase.from('fragrance_images').select('fragrance_id, url').in('fragrance_id', fragIds).eq('is_primary', true)
      : Promise.resolve({ data: [] }),
  ]);

  const housePrimaryImage = houseImgData?.url ?? null;
  const fragImageMap = new Map((fragImgData ?? []).map((i) => [i.fragrance_id, i.url]));

  const fragrances: HouseFragrance[] = fragrancesBase.map((f) => ({
    ...f,
    primary_image_url: fragImageMap.get(f.id) ?? null,
  }));

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-tertiary/30">

        {/* Radial wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 110%, rgba(178,112,146,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Botanical — left */}
        <BotanicalSpray className="absolute left-4 xl:left-16 top-1/2 -translate-y-[45%] h-60 sm:h-80 text-secondary/20 hidden md:block" />

        {/* Botanical — right, mirrored */}
        <BotanicalSpray className="absolute right-4 xl:right-16 top-1/2 -translate-y-[45%] h-60 sm:h-80 text-secondary/20 hidden md:block scale-x-[-1]" />

        <div className="relative mx-auto max-w-2xl px-6 py-20 sm:py-28 text-center">

          {/* Eyebrow */}
          <p className="text-xs tracking-[0.35em] uppercase text-primary/60 mb-8 font-medium">
            Fragrance House
          </p>

          {/* House image */}
          {housePrimaryImage && (
            <div className="relative w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden border-2 border-secondary/20">
              <Image src={housePrimaryImage} alt={house.name} fill className="object-cover" sizes="96px" />
            </div>
          )}

          {/* Name */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-semibold text-primary leading-none tracking-tight mb-6">
            {house.name}
          </h1>

          {/* Rule */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-14 bg-secondary/25" />
            <div className="w-1 h-1 rounded-full bg-secondary/40" />
            <div className="h-px w-14 bg-secondary/25" />
          </div>

          {/* Description */}
          {house.description && (
            <p className="text-primary/80 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-8 font-light">
              {house.description}
            </p>
          )}

          {/* Details strip */}
          <div className="flex items-center justify-center gap-4 text-sm text-primary/60">
            {house.price !== null && (
              <>
                <PriceTier price={house.price} />
                <span className="text-secondary/40">·</span>
              </>
            )}
            <span>{fragrances.length} {fragrances.length === 1 ? 'fragrance' : 'fragrances'}</span>
          </div>
        </div>
      </section>

      {/* ── The Collection ───────────────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10 pb-5 border-b border-secondary/15">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-primary/50 mb-1.5 font-medium">
                Explore
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-primary">
                The Collection
              </h2>
            </div>
          </div>

          {fragrances.length === 0 ? (

            /* Empty state */
            <div className="py-24 text-center">
              <div className="w-12 h-px bg-secondary/30 mx-auto mb-10" />
              <p className="font-display text-3xl text-primary/40 italic mb-3">
                No fragrances yet
              </p>
              <p className="text-sm text-primary/50">
                The collection is being curated — check back soon.
              </p>
              <div className="w-12 h-px bg-secondary/30 mx-auto mt-10" />
            </div>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {fragrances.map((fragrance) => {
                const price = formatPrice(fragrance.price_cents, fragrance.currency);
                return (
                  <div
                    key={fragrance.id}
                    className="bg-tertiary/30 card-shadow border border-secondary/10 overflow-hidden group"
                  >
                    {/* Image */}
                    <Link href={`/fragrances/${fragrance.slug}`} tabIndex={-1} aria-hidden="true">
                      <div className="aspect-4/3 bg-tertiary/50 flex items-center justify-center card-image-depth relative overflow-hidden">
                        {fragrance.primary_image_url ? (
                          <Image
                            src={fragrance.primary_image_url}
                            alt={fragrance.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          <svg
                            viewBox="0 0 60 80"
                            className="w-9 h-12 text-secondary/20 group-hover:text-secondary/30 transition-colors"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <rect x="22" y="0" width="16" height="7" rx="2" />
                            <rect x="10" y="7" width="40" height="62" rx="3" />
                            <rect x="17" y="18" width="26" height="1.5" fill="white" opacity="0.3" />
                            <rect x="17" y="24" width="18" height="1" fill="white" opacity="0.2" />
                          </svg>
                        )}
                      </div>
                    </Link>

                    {/* Body */}
                    <div className="p-4">
                      <Link href={`/fragrances/${fragrance.slug}`}>
                        <h3 className="font-display text-base sm:text-lg font-semibold text-primary leading-tight mb-2 hover:text-secondary transition-colors">
                          {fragrance.name}
                        </h3>
                      </Link>

                      {fragrance.rating !== null && (
                        <div className="mb-3">
                          <StarRating rating={fragrance.rating} size="xs" />
                        </div>
                      )}

                      {/* Price + size */}
                      <div className="flex items-center gap-1.5 text-xs text-primary/75">
                        {price && <span className="font-medium">{price}</span>}
                        {price && fragrance.size_ml && (
                          <span className="text-primary/30">·</span>
                        )}
                        {fragrance.size_ml && <span>{fragrance.size_ml} ml</span>}
                      </div>

                      {fragrance.description && (
                        <p className="mt-2.5 text-xs text-primary/60 line-clamp-2 leading-relaxed">
                          {fragrance.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Back link ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-16 max-w-6xl mx-auto">
        <Link
          href="/scent-library"
          className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary transition-colors"
        >
          <svg
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 8H4M4 8l4-4M4 8l4 4" />
          </svg>
          Back to Scent Library
        </Link>
      </div>

    </div>
  );
}
