'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ── Types (exported so page.tsx can reuse them) ──────────────────────────────

export type FragranceHouse = {
  id: string;
  name: string;
  description: string | null;
  rating: number | null;
  logo_url?: string | null;
  created_at?: string;
};

export type Fragrance = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rating: number | null;
  size_ml: number | null;
  house_id: string;
  review_post_id: string | null;
  created_at?: string;
};

export type HouseWithFragrances = FragranceHouse & { fragrances: Fragrance[] };
export type FragranceWithHouseName = Fragrance & { houseName: string };

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  houses: HouseWithFragrances[];
  recentFragrances: FragranceWithHouseName[];
  availableLetters: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── Main component ───────────────────────────────────────────────────────────

export default function ScentLibraryClient({ houses, recentFragrances, availableLetters }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const availableLetterSet = useMemo(() => new Set(availableLetters), [availableLetters]);

  const isSearching = searchQuery.trim().length > 0;
  const showRecent = !isSearching && selectedFilter === 'recent';

  const filteredHouses = useMemo<HouseWithFragrances[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      return houses
        .map((house) => {
          if (house.name.toLowerCase().includes(q)) return house;
          const matching = house.fragrances.filter((f) =>
            f.name.toLowerCase().includes(q)
          );
          if (matching.length > 0) return { ...house, fragrances: matching };
          return null;
        })
        .filter(Boolean) as HouseWithFragrances[];
    }

    if (selectedFilter === 'recent') return [];
    if (selectedFilter) {
      return houses.filter((h) => h.name.charAt(0).toUpperCase() === selectedFilter);
    }
    return houses;
  }, [houses, searchQuery, selectedFilter]);

  const isEmpty = showRecent ? recentFragrances.length === 0 : filteredHouses.length === 0;

  return (
    <div className="min-h-screen bg-tertiary/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Radial depth gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(244,191,219,0.22) 0%, transparent 68%)'}} aria-hidden="true" />
        <div className="hidden sm:contents">
          <StarSticker className="absolute top-12 left-[8%] w-6 h-6" />
          <StarSticker className="absolute top-20 left-[12%] w-4 h-4" />
          <StarSticker className="absolute top-16 right-[10%] w-5 h-5" />
          <StarSticker className="absolute top-28 right-[15%] w-3 h-3" />
          <FloralAccent className="absolute top-4 right-[5%] w-24 h-24 opacity-50" />
          <FloralAccent className="absolute bottom-0 left-[3%] w-20 h-20 opacity-30 -rotate-12" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-10 sm:py-16 text-center">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-primary leading-tight mb-6">
            Scent <span className="text-secondary">Library</span>
          </h1>
          <p className="text-primary/60 max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
            Explore our curated collection of fragrance houses and their finest creations.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setSelectedFilter(null);
              }}
              placeholder="Search houses or fragrances..."
              className="w-full pl-10 pr-10 py-3 bg-white/70 border border-secondary/20 rounded-full text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 text-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary/60 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Alphabet Filter — hidden while searching */}
      {!isSearching && (
        <section className="sticky top-0 z-40 bg-tertiary/80 backdrop-blur-sm border-y border-secondary/10 filter-bar-shadow">
          <div className="max-w-6xl mx-auto px-3 py-2 sm:px-4 sm:py-4">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter(selectedFilter === 'recent' ? null : 'recent')}
                className={`
                  w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full
                  transition-all duration-300 text-sm
                  ${selectedFilter === 'recent'
                    ? 'bg-secondary text-white scale-110'
                    : 'bg-tertiary/50 text-secondary hover:bg-secondary/20'
                  }
                `}
                title="Recently added"
              >
                <RecentStarIcon className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="w-px h-6 bg-secondary/20 mx-1 md:mx-2" />

              {ALPHABET.map((letter) => {
                const isAvailable = availableLetterSet.has(letter);
                const isSelected = selectedFilter === letter;

                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && setSelectedFilter(isSelected ? null : letter)}
                    disabled={!isAvailable}
                    className={`
                      w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full
                      font-display text-xs sm:text-sm md:text-base font-medium
                      transition-all duration-300
                      ${isSelected
                        ? 'bg-primary text-white scale-110'
                        : isAvailable
                          ? 'bg-tertiary/50 text-primary hover:bg-primary/10'
                          : 'bg-transparent text-primary/20 cursor-not-allowed'
                      }
                    `}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {selectedFilter && (
              <div className="flex items-center justify-center mt-3 gap-2">
                <span className="text-xs text-primary/50">
                  {selectedFilter === 'recent'
                    ? 'Showing 5 most recently added'
                    : `Showing houses starting with "${selectedFilter}"`}
                </span>
                <button
                  onClick={() => setSelectedFilter(null)}
                  className="text-xs text-secondary hover:text-primary transition-colors underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {isEmpty ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary/50 rounded-full mb-6">
              <BottleIcon className="w-10 h-10 text-secondary/40" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-2">
              {isSearching ? 'No results found' : selectedFilter ? 'No houses found' : 'No fragrance houses yet'}
            </h2>
            <p className="text-primary/60">
              {isSearching
                ? `No houses or fragrances match "${searchQuery}".`
                : selectedFilter
                  ? 'Try a different filter or clear your selection.'
                  : 'Check back soon as we add more houses.'}
            </p>
          </div>
        ) : showRecent ? (
          <>
            <h2 className="font-display text-xl font-medium text-primary/70 mb-6">Recently Added</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentFragrances.map((fragrance) => (
                <FragranceCard key={fragrance.id} fragrance={fragrance} />
              ))}
            </div>
          </>
        ) : (
          <>
            {isSearching && (
              <p className="text-sm text-primary/50 mb-8">
                {filteredHouses.length} house{filteredHouses.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            <div className="space-y-16">
              {filteredHouses.map((house, index) => (
                <HouseRow key={house.id} house={house} isReversed={index % 2 === 1} index={index} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ── House Row ─────────────────────────────────────────────────────────────────

interface HouseRowProps {
  house: HouseWithFragrances;
  isReversed: boolean;
  index: number;
}

function HouseRow({ house, isReversed, index }: HouseRowProps) {
  const reviewedCount = house.fragrances.filter((f) => f.review_post_id).length;

  const brandContent = (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="w-32 h-32 md:w-40 md:h-40 bg-tertiary/50 rounded-full flex items-center justify-center mb-6 border-2 border-secondary/20 overflow-hidden avatar-depth">
        {house.logo_url ? (
          <img src={house.logo_url} alt={house.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-4xl md:text-5xl text-secondary/30">
            {house.name.charAt(0)}
          </span>
        )}
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-2">
        {house.name}
      </h2>

      {house.rating && (
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`w-4 h-4 ${i < house.rating! ? 'text-secondary' : 'text-secondary/20'}`}
              filled={i < house.rating!}
            />
          ))}
        </div>
      )}

      {house.description && (
        <p className="text-sm text-primary/60 leading-relaxed max-w-xs">
          {house.description.length > 120
            ? house.description.slice(0, 120) + '...'
            : house.description}
        </p>
      )}

      <p className="text-xs text-primary/40 mt-3">
        {house.fragrances.length} fragrance{house.fragrances.length !== 1 ? 's' : ''}
        {reviewedCount > 0 && ` · ${reviewedCount} reviewed`}
      </p>
    </div>
  );

  const fragrancesContent = (
    <div className="flex-1">
      {house.fragrances.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-medium text-primary/70 mb-4">Fragrances</h3>
          {house.fragrances.slice(0, 3).map((fragrance) => (
            <Link
              key={fragrance.id}
              href={`/fragrances/${fragrance.slug}`}
              className="group block bg-white/50 hover:bg-tertiary/60 border border-secondary/10 hover:border-secondary/30 rounded-lg p-4 transition-all duration-300 card-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-display text-lg font-semibold text-primary group-hover:text-secondary transition-colors">
                    {fragrance.name}
                  </h4>
                  {(fragrance.size_ml || fragrance.review_post_id) && (
                    <div className="flex items-center gap-2 mt-1">
                      {fragrance.size_ml && (
                        <span className="text-xs text-primary/40">{fragrance.size_ml} ml</span>
                      )}
                      {fragrance.review_post_id && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                          Reviewed
                        </span>
                      )}
                    </div>
                  )}
                  {fragrance.description && (
                    <p className="text-sm text-primary/50 mt-1 line-clamp-2">
                      {fragrance.description}
                    </p>
                  )}
                </div>
                {fragrance.rating && (
                  <div className="flex items-center gap-1 shrink-0">
                    <StarIcon className="w-4 h-4 text-secondary" filled />
                    <span className="text-sm font-medium text-primary">{fragrance.rating}</span>
                  </div>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-secondary mt-3 group-hover:gap-2 transition-all">
                View Fragrance
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
          {house.fragrances.length > 3 && (
            <p className="text-xs text-primary/40 text-center pt-2">
              +{house.fragrances.length - 3} more fragrance{house.fragrances.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-tertiary/30 rounded-lg p-8 text-center border border-dashed border-secondary/20">
          <BottleIcon className="w-12 h-12 text-secondary/20 mx-auto mb-3" />
          <p className="text-primary/40 text-sm">No fragrances yet for this house</p>
          <p className="text-primary/30 text-xs mt-1">Check back soon!</p>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start py-8 border-b border-secondary/10 last:border-b-0"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isReversed ? (
        <>
          <div className="order-2 md:order-1">{fragrancesContent}</div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">{brandContent}</div>
        </>
      ) : (
        <>
          <div className="flex justify-center md:justify-start">{brandContent}</div>
          <div>{fragrancesContent}</div>
        </>
      )}
    </div>
  );
}

// ── Fragrance Card ────────────────────────────────────────────────────────────

function FragranceCard({ fragrance }: { fragrance: FragranceWithHouseName }) {
  return (
    <Link
      href={`/fragrances/${fragrance.slug}`}
      className="group flex flex-col bg-white/60 hover:bg-white border border-secondary/10 hover:border-secondary/30 rounded-xl p-5 transition-all duration-300 card-shadow"
    >
      <p className="text-xs text-secondary font-medium tracking-widest uppercase mb-2">
        {fragrance.houseName}
      </p>

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-lg font-semibold text-primary group-hover:text-secondary transition-colors leading-tight">
          {fragrance.name}
        </h3>
        {fragrance.rating != null && (
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <StarIcon className="w-3.5 h-3.5 text-secondary" filled />
            <span className="text-xs font-medium text-primary/70">{fragrance.rating}</span>
          </div>
        )}
      </div>

      {(fragrance.size_ml || fragrance.review_post_id) && (
        <div className="flex items-center gap-2 mb-3">
          {fragrance.size_ml && (
            <span className="text-xs bg-tertiary/60 text-primary/60 px-2 py-0.5 rounded-full">
              {fragrance.size_ml} ml
            </span>
          )}
          {fragrance.review_post_id && (
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              Reviewed
            </span>
          )}
        </div>
      )}

      {fragrance.description && (
        <p className="text-sm text-primary/50 line-clamp-2 leading-relaxed flex-1">
          {fragrance.description}
        </p>
      )}

      <span className="inline-flex items-center gap-1 text-xs text-secondary mt-4 group-hover:gap-2 transition-all duration-200">
        View Fragrance
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </span>
    </Link>
  );
}

// ── SVG Components ────────────────────────────────────────────────────────────

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

const RecentStarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
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

const SearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
