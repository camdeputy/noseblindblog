'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ── Types (exported so page.tsx can reuse them) ──────────────────────────────

export type FragranceHouse = {
  id: string;
  name: string;
  slug?: string | null;
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
  concentration: string | null;
  house_id: string;
  review_post_id: string | null;
  created_at?: string;
  primary_image_url?: string | null;
};

export type HouseWithFragrances = FragranceHouse & { fragrances: Fragrance[] };
export type FragranceWithHouseName = Fragrance & { houseName: string };

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialHouses: HouseWithFragrances[];
  hasMore: boolean;
  recentFragrances: FragranceWithHouseName[];
  availableLetters: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SEARCH_MAX_LENGTH = 100;

function normalizeSearchInput(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .replace(/\s+/g, ' ')                                // collapse whitespace
    .replace(/[%_]/g, '')                                // strip LIKE metacharacters
    .slice(0, SEARCH_MAX_LENGTH);
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ScentLibraryClient({ initialHouses, hasMore: initialHasMore, recentFragrances, availableLetters }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HouseWithFragrances[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Adaptive debounce: shorter delay when the user pauses, longer when typing fast.
  // Keystroke interval → delay: 0 ms apart → DEBOUNCE_MAX, ≥ DEBOUNCE_MAX apart → DEBOUNCE_MIN.
  const DEBOUNCE_MIN_MS = 150;
  const DEBOUNCE_MAX_MS = 500;
  const lastKeystrokeRef = useRef<number>(Date.now());
  const debounceDelayRef = useRef<number>(DEBOUNCE_MAX_MS);

  // Infinite scroll state
  const [houses, setHouses] = useState<HouseWithFragrances[]>(initialHouses);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchMore = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const res = await fetch(`/api/scent-library?page=${page + 1}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setHouses((prev) => [...prev, ...data.houses]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch (err) {
      console.error('[scent-library] infinite scroll fetch error:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, page]);

  // Adaptive debounce: fires with the delay computed at the last keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), debounceDelayRef.current);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results from the API when the debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }
    setIsSearchLoading(true);
    fetch(`/api/scent-library?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setSearchResults(data.houses ?? []))
      .catch((err) => console.error('[scent-library] search error:', err))
      .finally(() => setIsSearchLoading(false));
  }, [debouncedQuery]);

  // Keep a stable ref so the observer callback always calls the latest fetchMore
  // without needing to recreate the IntersectionObserver on every render.
  const fetchMoreRef = useRef(fetchMore);
  fetchMoreRef.current = fetchMore;

  // Callback ref: wires/unwires the IntersectionObserver each time the sentinel
  // mounts or unmounts (e.g. toggling search mode). A plain useEffect with []
  // only ran once — if the sentinel unmounted and remounted, the observer was
  // left watching a detached node and would never fire again.
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMoreRef.current(); },
      { rootMargin: '300px' },
    );
    observerRef.current.observe(node);
  }, []);

  const availableLetterSet = useMemo(() => new Set(availableLetters), [availableLetters]);

  const isSearching = searchQuery.trim().length > 0;
  const showRecent = !isSearching && selectedFilter === 'recent';

  // Letter-filter applied to loaded paginated houses (only used when not searching)
  const filteredHouses = useMemo<HouseWithFragrances[]>(() => {
    if (selectedFilter === 'recent' || isSearching) return [];
    if (selectedFilter) {
      return houses.filter((h) => h.name.charAt(0).toUpperCase() === selectedFilter);
    }
    return houses;
  }, [houses, selectedFilter, isSearching]);

  // What actually renders in the house list
  const displayedHouses = isSearching ? searchResults : filteredHouses;

  const isEmpty = showRecent
    ? recentFragrances.length === 0
    : !isSearchLoading && displayedHouses.length === 0;

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-6 pb-10 sm:pb-12 text-center">
        <div className="max-w-md mx-auto relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const now = Date.now();
              const interval = now - lastKeystrokeRef.current;
              lastKeystrokeRef.current = now;
              // Fast typing (small interval) → long delay; slow / deliberate pause → short delay
              debounceDelayRef.current = Math.max(
                DEBOUNCE_MIN_MS,
                Math.min(DEBOUNCE_MAX_MS, DEBOUNCE_MAX_MS - interval),
              );
              const value = normalizeSearchInput(e.target.value);
              setSearchQuery(value);
              if (value.trim()) setSelectedFilter(null);
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
        ) : isSearchLoading ? (
          <div className="space-y-16">
            <InlineHouseRowSkeleton isReversed={false} />
            <InlineHouseRowSkeleton isReversed={true} />
          </div>
        ) : (
          <>
            {isSearching && (
              <p className="text-sm text-primary/50 mb-8">
                {displayedHouses.length} house{displayedHouses.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            <div className="space-y-16">
              {displayedHouses.map((house, index) => (
                <HouseRow key={house.id} house={house} isReversed={index % 2 === 1} index={index} />
              ))}
            </div>

            {/* Inline skeleton while fetching next page (browse mode only) */}
            {!isSearching && isFetchingMore && (
              <div className="space-y-16 mt-16">
                <InlineHouseRowSkeleton isReversed={displayedHouses.length % 2 === 1} />
              </div>
            )}

            {/* Sentinel — only active in browse mode so infinite scroll doesn't trigger during search */}
            {!isSearching && hasMore && <div ref={sentinelCallbackRef} className="h-2" aria-hidden="true" />}
          </>
        )}
      </section>
    </>
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
      <div className="relative w-32 h-32 md:w-40 md:h-40 bg-tertiary/50 rounded-full flex items-center justify-center mb-6 border-2 border-secondary/20 overflow-hidden avatar-depth">
        {house.logo_url ? (
          <Image src={house.logo_url} alt={house.name} fill className="object-cover" sizes="160px" />
        ) : (
          <span className="font-display text-4xl md:text-5xl text-secondary/30">
            {house.name.charAt(0)}
          </span>
        )}
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-2">
        {house.slug ? (
          <Link href={`/houses/${house.slug}`} className="hover:text-secondary transition-colors">
            {house.name}
          </Link>
        ) : (
          house.name
        )}
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
        <div>
          <h3 className="font-display text-lg font-medium text-primary/70 mb-4">Fragrances</h3>
          <div className={`space-y-4${house.fragrances.length > 3 ? ' overflow-y-auto max-h-104 pr-1' : ''}`}>
            {house.fragrances.map((fragrance) => (
              <Link
                key={fragrance.id}
                href={`/fragrances/${fragrance.slug}`}
                className="group block bg-white/50 hover:bg-tertiary/60 border border-secondary/10 hover:border-secondary/30 rounded-lg p-4 transition-all duration-300 card-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden bg-tertiary/40">
                    {fragrance.primary_image_url ? (
                      <Image src={fragrance.primary_image_url} alt={fragrance.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BottleIcon className="w-5 h-7 text-secondary/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-display text-lg font-semibold text-primary group-hover:text-secondary transition-colors">
                        {fragrance.name}
                      </h4>
                      {(fragrance.concentration || fragrance.size_ml || fragrance.review_post_id) && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {fragrance.concentration && (
                            <span className="text-xs text-secondary/70 font-medium">{fragrance.concentration}</span>
                          )}
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
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-secondary mt-3 group-hover:gap-2 transition-all">
                  View Fragrance
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
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
      className="group flex flex-col bg-white/60 hover:bg-white border border-secondary/10 hover:border-secondary/30 rounded-xl overflow-hidden transition-all duration-300 card-shadow"
    >
      <div className="relative aspect-[4/3] bg-tertiary/40">
        {fragrance.primary_image_url ? (
          <Image src={fragrance.primary_image_url} alt={fragrance.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BottleIcon className="w-10 h-14 text-secondary/15" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
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

      {(fragrance.concentration || fragrance.size_ml || fragrance.review_post_id) && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {fragrance.concentration && (
            <span className="text-xs bg-secondary/8 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full font-medium">
              {fragrance.concentration}
            </span>
          )}
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
      </div>
    </Link>
  );
}

// ── Inline loading skeleton (used while fetching next page) ──────────────────

function InlineHouseRowSkeleton({ isReversed }: { isReversed: boolean }) {
  const brandSkeleton = (
    <div className="flex flex-col items-center md:items-start">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-tertiary/60 animate-pulse mb-6" />
      <div className="h-8 w-44 bg-tertiary/60 rounded animate-pulse mb-3" />
      <div className="h-4 w-56 bg-tertiary/40 rounded animate-pulse mb-2" />
      <div className="h-3 w-24 bg-tertiary/30 rounded animate-pulse mt-1" />
    </div>
  );

  const fragrancesSkeleton = (
    <div className="flex-1">
      <div className="h-6 w-32 bg-tertiary/40 rounded animate-pulse mb-4" />
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white/50 border border-secondary/10 rounded-lg p-4">
            <div className="h-5 w-40 bg-tertiary/60 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-tertiary/30 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start py-8 border-b border-secondary/10">
      {isReversed ? (
        <>
          <div className="order-2 md:order-1">{fragrancesSkeleton}</div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">{brandSkeleton}</div>
        </>
      ) : (
        <>
          <div className="flex justify-center md:justify-start">{brandSkeleton}</div>
          <div>{fragrancesSkeleton}</div>
        </>
      )}
    </div>
  );
}

// ── SVG Components ────────────────────────────────────────────────────────────


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
