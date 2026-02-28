import { getPosts } from '@/lib/api';
import { Post } from '@/types/post';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    posts = await getPosts();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load posts';
  }

  const latestPosts = posts.slice(0, 3);

  return (
    <div className="bg-tertiary/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Radial depth gradient — warms the center behind headings */}
        <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(244,191,219,0.22) 0%, transparent 68%)'}} aria-hidden="true" />
        <div className="relative min-h-[85vh] flex flex-col items-center justify-center py-12 sm:py-20 px-6 sm:px-8">

          {/* ── Individual stickers placed around the hero — hidden on mobile ── */}
          <div className="hidden sm:contents">
            <RoseSticker className="absolute top-12 left-[8%] w-20 h-20" />
            <LavenderSticker className="absolute top-[45%] left-[6%] w-10 h-24" />
            <StarSticker className="absolute top-[22%] left-[30%] w-5 h-5" color="#B27092" />
            <StarSticker className="absolute top-[18%] left-[34%] w-3 h-3" color="#B27092" />
            <JasmineSticker className="absolute top-10 right-[6%] w-24 h-24" />
            <StarSticker className="absolute top-[20%] right-[32%] w-4 h-4" color="#B27092" />
            <StarSticker className="absolute top-[24%] right-[30%] w-6 h-6" color="#B27092" />
            <VanillaSticker className="absolute top-[50%] right-[5%] w-28 h-28" />
            <MoleculeSticker className="absolute top-[65%] right-[10%] w-12 h-12" />
            <CitrusSticker className="absolute bottom-[8%] left-[8%] w-28 h-28" />
            <StarSticker className="absolute bottom-[28%] left-[18%] w-4 h-4" color="#B27092" />
          </div>

          {/* ── Content ── */}
          <p className="text-sm tracking-widest text-secondary mb-4 uppercase relative z-10">
            Est. 2026 &middot; Fragrance Library
          </p>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-primary text-center leading-tight mb-6 relative z-10">
            Noseblind
          </h1>
          <p className="text-primary/70 text-center max-w-3xl text-base sm:text-lg relative z-10">
            The state of being desensitized to a scent after prolonged exposure. A frustrating occurence, but one that keeps us coming back for more.
          </p>

          <div className="mt-12 mb-8 relative z-10">
            <PerfumeBottle className="w-28 h-28 sm:w-48 sm:h-48 text-primary/30" />
          </div>
        </div>
      </section>

      {/* Curating Section */}
      <section className="bg-tertiary/50">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Illustration side */}
          <div className="flex flex-col items-center justify-center relative py-16 px-8 illustration-depth">
            <div className="relative w-56 h-56">
              <CitrusSticker className="absolute top-2 left-6 w-32 h-32" />
              <RoseSticker className="absolute top-24 -left-2 w-24 h-24" />
              <MoleculeSticker className="absolute top-0 right-2 w-12 h-12" />
              <LavenderSticker className="absolute bottom-2 left-16 w-8 h-20" />
              <StarSticker className="absolute top-6 left-2 w-5 h-5" color="#B27092" />
              <StarSticker className="absolute bottom-8 right-8 w-4 h-4" color="#B27092" />
              <JasmineSticker className="absolute top-10 right-0 w-14 h-14" />
              <VanillaSticker className="absolute bottom-0 right-2 w-14 h-14 opacity-80" />
            </div>
          </div>

          {/* Text side */}
          <div className="py-16 px-8 md:px-12 flex flex-col justify-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-primary mb-2">
              Let's get <span className="text-secondary">Anosmic</span>
            </h2>
            <p className="text-primary/70 leading-relaxed mb-4">
              Noseblind is more than a fragrance blog; it is a digital journal primarily dedicated to 
              olfactory arts. I believe it is the most intimate form of expression, announcing our presence and 
              lingering in our absence. Join me on my fragrance journey as I sniff through and review my fragrance TBS (To Be Smelled). 
              Together we will discover new favorites, and overwhelm our senses (but on a real note, sniff responsibly). Let's get to smelling!
            </p>
            <p className="text-primary/70 leading-relaxed mb-8">
              - Anosmic
            </p>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors w-fit group"
            >
              Read the Journal
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-primary">Latest Posts</h2>
          <Link href="/posts" className="text-sm font-medium text-primary/70 hover:text-primary transition-colors">
            Show All
          </Link>
        </div>

        {error ? (
          <p className="text-red-600 text-center py-12">{error}</p>
        ) : latestPosts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {placeholderCards.map((card, i) => (
              <PlaceholderCard key={i} {...card} index={i + 1} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="bg-tertiary/30 hover:bg-tertiary/60 transition-colors group card-shadow border border-secondary/10"
              >
                <div className="aspect-4/3 bg-tertiary/50 flex items-center justify-center card-image-depth">
                  <span className="font-display text-6xl text-secondary/30">{i + 1}</span>
                </div>
                <div className="py-4 px-4">
                  <div className="flex items-center gap-3 text-xs text-primary/60 mb-2">
                    <span className="uppercase tracking-wider font-medium">
                      {post.tags?.[0] || 'Journal'}
                    </span>
                    <span>&middot;</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* Placeholder data for when no posts exist */
const placeholderCards = [
  { category: 'Trend Report', date: 'Oct 12', title: 'The Resurgence of Chypre' },
  { category: 'Reviews', date: 'Oct 08', title: 'Santal 33: A Decade Later' },
  { category: 'Education', date: 'Oct 01', title: 'Synthetic vs. Natural' },
];

function PlaceholderCard({ category, date, title, index }: { category: string; date: string; title: string; index: number }) {
  return (
    <div className="bg-tertiary/30 card-shadow border border-secondary/10">
      <div className="aspect-4/3 bg-tertiary/50 flex items-center justify-center card-image-depth">
        <span className="font-display text-6xl text-secondary/30">{index}</span>
      </div>
      <div className="py-4 px-4">
        <div className="flex items-center gap-3 text-xs text-primary/60 mb-2">
          <span className="uppercase tracking-wider font-medium">{category}</span>
          <span>&middot;</span>
          <span>{date}</span>
        </div>
        <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>
      </div>
    </div>
  );
}

/* SVG Sticker components */

const RoseSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20C30 20 20 40 20 50C20 70 40 80 50 80C60 80 80 70 80 50C80 40 70 20 50 20Z" fill="#FFE9F3" stroke="#B27092" strokeWidth="2" />
    <path d="M50 20C40 30 30 40 35 60" stroke="#B27092" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 20C60 30 70 40 65 60" stroke="#B27092" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M35 50C40 60 60 60 65 50" stroke="#B27092" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M45 80V95" stroke="#C9CBA3" strokeWidth="3" strokeLinecap="round" />
    <path d="M45 88H30" stroke="#C9CBA3" strokeWidth="2" strokeLinecap="round" />
    <path d="M45 92H60" stroke="#C9CBA3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LavenderSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 110V20" stroke="#C9CBA3" strokeWidth="2" strokeLinecap="round" />
    <circle cx="30" cy="20" r="4" fill="#B27092" fillOpacity="0.8" />
    <circle cx="22" cy="30" r="4" fill="#B27092" fillOpacity="0.8" />
    <circle cx="38" cy="35" r="4" fill="#B27092" fillOpacity="0.8" />
    <circle cx="25" cy="45" r="4" fill="#B27092" fillOpacity="0.8" />
    <circle cx="35" cy="55" r="4" fill="#B27092" fillOpacity="0.8" />
    <circle cx="28" cy="65" r="4" fill="#B27092" fillOpacity="0.8" />
    <path d="M30 80C20 80 10 70 10 60" stroke="#C9CBA3" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 90C40 90 50 80 50 70" stroke="#C9CBA3" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CitrusSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#FFE9F3" stroke="#C9CBA3" strokeWidth="2" />
    <circle cx="50" cy="50" r="40" stroke="#C9CBA3" strokeWidth="1" strokeDasharray="4 4" />
    <path d="M50 50L50 10" stroke="#C9CBA3" strokeWidth="1" />
    <path d="M50 50L85 30" stroke="#C9CBA3" strokeWidth="1" />
    <path d="M50 50L85 70" stroke="#C9CBA3" strokeWidth="1" />
    <path d="M50 50L50 90" stroke="#C9CBA3" strokeWidth="1" />
    <path d="M50 50L15 70" stroke="#C9CBA3" strokeWidth="1" />
    <path d="M50 50L15 30" stroke="#C9CBA3" strokeWidth="1" />
    <circle cx="50" cy="50" r="35" stroke="#B27092" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

const JasmineSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 50L50 20C50 20 60 40 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L80 50C80 50 60 60 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L50 80C50 80 40 60 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L20 50C20 50 40 40 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L70 30C70 30 60 50 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L70 70C70 70 50 60 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L30 70C30 70 40 50 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <path d="M50 50L30 30C30 30 50 40 50 50Z" fill="#fff" stroke="#2d2d2d" strokeWidth="1" />
    <circle cx="50" cy="50" r="5" fill="#C9CBA3" />
  </svg>
);

const VanillaSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 80C20 80 40 50 80 20" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
    <path d="M25 85C25 85 45 55 85 25" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
    <circle cx="80" cy="20" r="2" fill="#5D4037" />
    <circle cx="85" cy="25" r="2" fill="#5D4037" />
  </svg>
);

const MoleculeSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 10L47.32 20V40L30 50L12.68 40V20L30 10Z" stroke="#2d2d2d" strokeWidth="1.5" opacity="0.4" />
    <circle cx="30" cy="10" r="3" fill="#B27092" />
    <circle cx="47.32" cy="20" r="3" fill="#2d2d2d" />
    <circle cx="47.32" cy="40" r="3" fill="#2d2d2d" />
    <circle cx="30" cy="50" r="3" fill="#2d2d2d" />
    <circle cx="12.68" cy="40" r="3" fill="#2d2d2d" />
    <circle cx="12.68" cy="20" r="3" fill="#2d2d2d" />
  </svg>
);

const StarSticker = ({ className, color = '#B27092' }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill={color} opacity="0.6" />
  </svg>
);

function PerfumeBottle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="60" y="70" width="80" height="100" rx="4" />
      <rect x="80" y="45" width="40" height="25" rx="2" />
      <rect x="75" y="30" width="50" height="15" rx="3" />
      <rect x="70" y="90" width="60" height="40" rx="2" strokeDasharray="4 4" />
      <line x1="65" y1="130" x2="135" y2="130" opacity="0.5" />
      <line x1="100" y1="20" x2="100" y2="8" opacity="0.4" />
      <line x1="90" y1="22" x2="85" y2="12" opacity="0.4" />
      <line x1="110" y1="22" x2="115" y2="12" opacity="0.4" />
    </svg>
  );
}
