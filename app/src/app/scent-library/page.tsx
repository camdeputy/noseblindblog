'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Types
type FragranceHouse = {
  id: string;
  name: string;
  description: string | null;
  rating: number | null;
  logo_url?: string | null;
  created_at?: string;
};

type Fragrance = {
  id: string;
  name: string;
  description: string | null;
  rating: number | null;
  house_id: string;
  review_post_id: string | null;
  created_at?: string;
};

type HouseWithFragrances = FragranceHouse & {
  fragrances: Fragrance[];
};

// Supabase client for client-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ScentLibraryPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [houses, setHouses] = useState<HouseWithFragrances[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableLetters, setAvailableLetters] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all houses
        const { data: housesData, error: housesError } = await supabase
          .from('fragrance_houses')
          .select('*')
          .order('name', { ascending: true });

        if (housesError) throw housesError;

        // Fetch all fragrances with reviews
        const { data: fragrancesData, error: fragrancesError } = await supabase
          .from('fragrances')
          .select('*')
          .order('created_at', { ascending: false });

        if (fragrancesError) throw fragrancesError;

        // Build available letters set
        const letters = new Set<string>();
        (housesData || []).forEach((house: FragranceHouse) => {
          const firstLetter = house.name.charAt(0).toUpperCase();
          if (ALPHABET.includes(firstLetter)) {
            letters.add(firstLetter);
          }
        });
        setAvailableLetters(letters);

        // Group fragrances by house
        const fragrancesByHouse = new Map<string, Fragrance[]>();
        (fragrancesData || []).forEach((fragrance: Fragrance) => {
          const existing = fragrancesByHouse.get(fragrance.house_id) || [];
          existing.push(fragrance);
          fragrancesByHouse.set(fragrance.house_id, existing);
        });

        // Combine houses with their fragrances
        const combined: HouseWithFragrances[] = (housesData || []).map((house: FragranceHouse) => ({
          ...house,
          fragrances: fragrancesByHouse.get(house.id) || [],
        }));

        setHouses(combined);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scent library');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter houses based on selected filter
  const filteredHouses = houses.filter((house) => {
    if (!selectedFilter) return true;

    if (selectedFilter === 'recent') {
      // Show houses that have fragrances with reviews, sorted by recent
      return house.fragrances.some((f) => f.review_post_id);
    }

    // Filter by first letter
    return house.name.charAt(0).toUpperCase() === selectedFilter;
  });

  // Sort by recent if that filter is active
  const sortedHouses = selectedFilter === 'recent'
    ? [...filteredHouses].sort((a, b) => {
        const aRecent = a.fragrances.find((f) => f.review_post_id)?.created_at || '';
        const bRecent = b.fragrances.find((f) => f.review_post_id)?.created_at || '';
        return bRecent.localeCompare(aRecent);
      })
    : filteredHouses;

  return (
    <div className="min-h-screen bg-tertiary/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <StarSticker className="absolute top-12 left-[8%] w-6 h-6" />
        <StarSticker className="absolute top-20 left-[12%] w-4 h-4" />
        <StarSticker className="absolute top-16 right-[10%] w-5 h-5" />
        <StarSticker className="absolute top-28 right-[15%] w-3 h-3" />
        <FloralAccent className="absolute top-4 right-[5%] w-24 h-24 opacity-50" />
        <FloralAccent className="absolute bottom-0 left-[3%] w-20 h-20 opacity-30 -rotate-12" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <p className="text-sm tracking-widest text-secondary mb-4 uppercase">
            Browse by House
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-primary leading-tight mb-6">
            Scent <span className="text-secondary">Library</span>
          </h1>
          <p className="text-primary/60 max-w-xl mx-auto text-lg leading-relaxed">
            Explore our curated collection of fragrance houses and their finest creations.
          </p>
        </div>
      </section>

      {/* Alphabet Filter */}
      <section className="sticky top-0 z-40 bg-tertiary/80 backdrop-blur-sm border-y border-secondary/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {/* Star filter for recent reviews */}
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'recent' ? null : 'recent')}
              className={`
                w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full
                transition-all duration-300 text-sm
                ${selectedFilter === 'recent'
                  ? 'bg-secondary text-white scale-110'
                  : 'bg-tertiary/50 text-secondary hover:bg-secondary/20'
                }
              `}
              title="Recently reviewed"
            >
              <RecentStarIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="w-px h-6 bg-secondary/20 mx-1 md:mx-2" />

            {/* Alphabet letters */}
            {ALPHABET.map((letter) => {
              const isAvailable = availableLetters.has(letter);
              const isSelected = selectedFilter === letter;

              return (
                <button
                  key={letter}
                  onClick={() => isAvailable && setSelectedFilter(isSelected ? null : letter)}
                  disabled={!isAvailable}
                  className={`
                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full
                    font-display text-sm md:text-base font-medium
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

          {/* Active filter indicator */}
          {selectedFilter && (
            <div className="flex items-center justify-center mt-3 gap-2">
              <span className="text-xs text-primary/50">
                {selectedFilter === 'recent' ? 'Showing recently reviewed' : `Showing houses starting with "${selectedFilter}"`}
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

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary/50 rounded-full mb-4 animate-pulse">
              <BottleIcon className="w-8 h-8 text-secondary/50" />
            </div>
            <p className="text-primary/50 font-display text-lg">Loading scent library...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary rounded-full mb-6">
              <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-2">
              Unable to load library
            </h2>
            <p className="text-primary/60">{error}</p>
          </div>
        ) : sortedHouses.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary/50 rounded-full mb-6">
              <BottleIcon className="w-10 h-10 text-secondary/40" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-primary mb-2">
              {selectedFilter ? 'No houses found' : 'No fragrance houses yet'}
            </h2>
            <p className="text-primary/60">
              {selectedFilter ? 'Try a different filter or clear your selection.' : 'Check back soon as we add more houses.'}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedHouses.map((house, index) => (
              <HouseRow
                key={house.id}
                house={house}
                isReversed={index % 2 === 1}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom decorative section */}
      <section className="bg-tertiary/50 py-16 mt-8">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-display text-2xl text-primary/80 italic">
            "A fragrance is like a signature, a statement of who you are."
          </p>
          <p className="text-sm text-primary/50 mt-4">— The Noseblind Collection</p>
        </div>
      </section>
    </div>
  );
}

/* House Row Component */
interface HouseRowProps {
  house: HouseWithFragrances;
  isReversed: boolean;
  index: number;
}

function HouseRow({ house, isReversed, index }: HouseRowProps) {
  const reviewedFragrances = house.fragrances.filter((f) => f.review_post_id);
  const hasReviews = reviewedFragrances.length > 0;

  const brandContent = (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      {/* Brand Image/Placeholder */}
      <div className="w-32 h-32 md:w-40 md:h-40 bg-tertiary/50 rounded-full flex items-center justify-center mb-6 border-2 border-secondary/20 overflow-hidden">
        {house.logo_url ? (
          <img
            src={house.logo_url}
            alt={house.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-display text-4xl md:text-5xl text-secondary/30">
            {house.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Brand Info */}
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
        {hasReviews && ` · ${reviewedFragrances.length} reviewed`}
      </p>
    </div>
  );

  const reviewsContent = (
    <div className="flex-1">
      {hasReviews ? (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-medium text-primary/70 mb-4">
            Featured Reviews
          </h3>
          {reviewedFragrances.slice(0, 3).map((fragrance) => (
            <Link
              key={fragrance.id}
              href={`/fragrances/${fragrance.id}`}
              className="group block bg-white/50 hover:bg-tertiary/60 border border-secondary/10 hover:border-secondary/30 rounded-lg p-4 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-display text-lg font-semibold text-primary group-hover:text-secondary transition-colors">
                    {fragrance.name}
                  </h4>
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
                Read Review
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
          {reviewedFragrances.length > 3 && (
            <p className="text-xs text-primary/40 text-center pt-2">
              +{reviewedFragrances.length - 3} more reviews
            </p>
          )}
        </div>
      ) : (
        <div className="bg-tertiary/30 rounded-lg p-8 text-center border border-dashed border-secondary/20">
          <BottleIcon className="w-12 h-12 text-secondary/20 mx-auto mb-3" />
          <p className="text-primary/40 text-sm">
            No reviews yet for this house
          </p>
          <p className="text-primary/30 text-xs mt-1">
            Check back soon!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start py-8 border-b border-secondary/10 last:border-b-0"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isReversed ? (
        <>
          <div className="order-2 md:order-1">{reviewsContent}</div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">{brandContent}</div>
        </>
      ) : (
        <>
          <div className="flex justify-center md:justify-start">{brandContent}</div>
          <div>{reviewsContent}</div>
        </>
      )}
    </div>
  );
}

/* SVG Icon Components */

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
