import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'The nose behind Noseblind — a fragrance blog and catalog.',
};

const FAVORITE_NOTES = [
  'Rose', 'Peach', 'Musk', 'Tea', 'Lychee', 'Mango'
];

const DISLIKED_NOTES = [
  'Jasmine', 'Raspberry', 'Lavendar', 'Marshmallow',
  'Patchouli'
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-tertiary/30">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(244,191,219,0.22) 0%, transparent 68%)' }}
          aria-hidden="true"
        />

        <RoseSticker    className="absolute top-12 left-[8%] w-16 h-16" />
        <LavenderSticker className="absolute top-[42%] left-[5%] w-8 h-20" />
        <StarSticker    className="absolute top-[22%] left-[28%] w-5 h-5" />
        <StarSticker    className="absolute top-[17%] left-[33%] w-3 h-3" />
        <JasmineSticker className="absolute top-10 right-[7%] w-20 h-20" />
        <StarSticker    className="absolute top-[20%] right-[30%] w-4 h-4" />
        <StarSticker    className="absolute top-[26%] right-[27%] w-3 h-3" />
        <VanillaSticker className="absolute top-[48%] right-[5%] w-24 h-24" />
        <MoleculeSticker className="absolute bottom-[18%] right-[10%] w-10 h-10" />
        <CitrusSticker  className="absolute bottom-[8%] left-[7%] w-24 h-24" />

        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="font-display text-6xl md:text-7xl font-semibold text-primary leading-tight mb-3">
            Welcome to Noseblind
          </h1>
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px w-16 bg-secondary/30" />
            <DiamondIcon className="w-2.5 h-2.5 text-secondary/50" />
            <div className="h-px w-16 bg-secondary/30" />
          </div>
          <p className="text-primary/60 max-w-xlg mx-auto text-lg leading-relaxed">
            I'm Anosmic. I began working on Noseblind in 2026 as a way to engage with my hobby of perfume collecting 
            in a more mindful way. Fragrance is such a wonderful storytelling medium, but collecting can be expensive and in some cases wasteful.
          </p>
        </div>
      </section>

      {/* ── Bio Section ── */}
      <section className="bg-tertiary/50">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Illustration cluster */}
          <div className="flex flex-col items-center justify-center relative py-16 px-8 illustration-depth">
            <div className="relative w-56 h-56">
              <CitrusSticker   className="absolute top-2 left-6 w-32 h-32" />
              <RoseSticker     className="absolute top-24 -left-2 w-24 h-24" />
              <MoleculeSticker className="absolute top-0 right-2 w-12 h-12" />
              <LavenderSticker className="absolute bottom-2 left-16 w-8 h-20" />
              <StarSticker     className="absolute top-6 left-2 w-5 h-5" />
              <StarSticker     className="absolute bottom-8 right-8 w-4 h-4" />
              <JasmineSticker  className="absolute top-10 right-0 w-14 h-14" />
              <VanillaSticker  className="absolute bottom-0 right-2 w-14 h-14 opacity-80" />
            </div>
          </div>

          {/* Bio text */}
          <div className="py-16 px-8 md:px-12 flex flex-col justify-center">
            <h2 className="font-display text-3xl font-semibold text-primary mb-2">The Mission</h2>
            <div className="h-px w-10 bg-secondary/40 mb-8" />
            <p className="text-primary/70 leading-relaxed mb-5">
              Noseblind will function primarily as a scent library and review blog, but I may pop in the occasional unscented take or educational material. This is a creative space,
              a journal of sorts, and I want to share it with any who are along for the ride.
            </p>
            <p className="text-primary/70 leading-relaxed mb-5">
              Noseblind's ethics will reflect those of its author. As a result, brands with anti-black,
              homophobic, or otherwise harmful rhetoric will not be reviewed or given a spotlight.
            </p>
            <p className="text-primary/70 leading-relaxed">
              This is a personal project, but if you'd like to make recommendations or suggest a brand,
              feel free to{' '}
              <a href="mailto:anosmic@noseblindblog.com" className="text-secondary underline hover:text-primary transition-colors">
                reach out
              </a>
              . Please keep it kind and respectful.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <Divider />

      {/* ── Philosophy Section ── */}
      <section className="max-w-2xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-semibold text-primary">About Anosmic</h2>
        </div>
        <div className="space-y-5">
          <p className="text-primary/70 leading-relaxed mb-5">
            Now while I will continue writing under the name Anosmic, I would like you to know a bit more about me. Our opinions and perspectives are shaped by our experiences, I think it's only fair 
            for you to know a bit of mine. Maybe you'll find some commanility:
          </p>
          <p className="text-primary/70 leading-relaxed">
            <span className="text-primary font-semibold">Location: </span>San Francisco Bay Area
          </p>
          <p className="text-primary/70 leading-relaxed">
            <span className="text-primary font-semibold">Pronouns: </span>She/Her/Hers
          </p>
          <p className="text-primary/70 leading-relaxed">
            <span className="text-primary font-semibold">Sexuality: </span>Bisexual
          </p>
          <p className="text-primary/70 leading-relaxed">
            <span className="text-primary font-semibold">Zodiac: </span>Cancer
          </p>
          <p className="font-display text-lg text-primary/60 italic">
              — Anosmic
          </p>
        </div>
      </section>

      {/* ── Notes Section ── */}
      <section className="bg-tertiary/50 py-16 quote-section">
        <div className="max-w-4xl mx-auto px-6">

          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-sm tracking-widest text-secondary uppercase mb-3">Olfactory Profile</p>
            <h2 className="font-display text-3xl font-semibold text-primary mb-2">My Scent Preferences</h2>
            <p className="text-sm text-primary/50 max-w-sm mx-auto">
              The notes that define my taste — and the ones I tend to avoid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

            {/* Favorite Notes */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-xl font-semibold text-primary whitespace-nowrap">Notes I Love</h3>
                <div className="h-px flex-1 bg-secondary/25" />
              </div>
              <p className="text-xs text-primary/45 mb-5 leading-relaxed">
                The ingredients that make me reach for a bottle again and again.
              </p>
              <div className="flex flex-wrap gap-2">
                {FAVORITE_NOTES.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 text-sm bg-secondary/10 text-secondary border border-secondary/20 rounded-full note-pill-depth"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Disliked Notes */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-xl font-semibold text-primary whitespace-nowrap">Notes I Avoid</h3>
                <div className="h-px flex-1 bg-primary/12" />
              </div>
              <p className="text-xs text-primary/45 mb-5 leading-relaxed">
                Accords that rarely work on my skin or simply aren't for me.
              </p>
              <div className="flex flex-wrap gap-2">
                {DISLIKED_NOTES.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 text-sm bg-primary/5 text-primary/40 border border-primary/10 rounded-full"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-secondary/30" />
          <DiamondIcon className="w-2 h-2 text-secondary/40" />
          <div className="h-px w-12 bg-secondary/30" />
        </div>
        <div className="flex items-center justify-center gap-8">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors group"
          >
            Read the Journal
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="text-primary/20">·</span>
          <Link
            href="/scent-library"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors group"
          >
            Browse the Scent Library
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

    </div>
  );
}

/* ── Shared components ── */

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <div className="h-px w-16 bg-secondary/30" />
      <DiamondIcon className="w-3 h-3 text-secondary/50" />
      <div className="h-px w-16 bg-secondary/30" />
    </div>
  );
}

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 10 10" className={className} fill="currentColor">
    <path d="M5 0L10 5L5 10L0 5L5 0Z" />
  </svg>
);

/* ── SVG Stickers ── */

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

const StarSticker = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill="#B27092" opacity="0.5" />
  </svg>
);
