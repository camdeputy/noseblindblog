// Shown while ScentLibraryData resolves — the hero heading is already
// visible above this (streamed immediately from the server), so we only
// need to skeleton the search bar, filter bar, and house rows.
export default function ScentLibraryLoading() {
  return (
    <>
      {/* Search bar skeleton */}
      <div className="max-w-5xl mx-auto px-6 pb-10 sm:pb-12 text-center">
        <div className="max-w-md mx-auto h-12 bg-tertiary/40 rounded-full animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <section className="border-y border-secondary/10 bg-tertiary/80">
        <div className="max-w-6xl mx-auto px-3 py-2 sm:px-4 sm:py-4">
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
            {Array.from({ length: 27 }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-tertiary/50 animate-pulse"
                style={{ animationDelay: `${i * 15}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* House row skeletons */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-16">
          {[false, true, false].map((isReversed, i) => (
            <HouseRowSkeleton key={i} isReversed={isReversed} />
          ))}
        </div>
      </section>
    </>
  );
}

export function HouseRowSkeleton({ isReversed }: { isReversed: boolean }) {
  const brandSkeleton = (
    <div className="flex flex-col items-center md:items-start">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-tertiary/60 animate-pulse mb-6" />
      <div className="h-8 w-44 bg-tertiary/60 rounded animate-pulse mb-3" />
      <div className="h-4 w-56 bg-tertiary/40 rounded animate-pulse mb-2" />
      <div className="h-4 w-44 bg-tertiary/40 rounded animate-pulse mb-2" />
      <div className="h-3 w-24 bg-tertiary/30 rounded animate-pulse mt-1" />
    </div>
  );

  const fragrancesSkeleton = (
    <div className="flex-1">
      <div className="h-6 w-32 bg-tertiary/40 rounded animate-pulse mb-4" />
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white/50 border border-secondary/10 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="h-5 w-40 bg-tertiary/60 rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-tertiary/30 rounded animate-pulse" />
              </div>
              <div className="h-5 w-8 bg-tertiary/40 rounded animate-pulse shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start py-8 border-b border-secondary/10 last:border-b-0">
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
