export default function HouseLoading() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden bg-tertiary/30">
        <div className="relative mx-auto max-w-2xl px-6 py-20 sm:py-28 text-center">
          {/* Eyebrow */}
          <div className="h-3 w-32 bg-tertiary/50 rounded animate-pulse mx-auto mb-8" />

          {/* House name */}
          <div className="h-16 sm:h-24 md:h-28 w-3/4 bg-tertiary/60 rounded-lg animate-pulse mx-auto mb-6" />

          {/* Rule */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-14 bg-secondary/20" />
            <div className="w-1 h-1 rounded-full bg-secondary/30" />
            <div className="h-px w-14 bg-secondary/20" />
          </div>

          {/* Description lines */}
          <div className="space-y-2 max-w-lg mx-auto mb-8">
            <div className="h-4 w-full bg-tertiary/50 rounded animate-pulse" style={{ animationDelay: '60ms' }} />
            <div className="h-4 w-5/6 bg-tertiary/50 rounded animate-pulse mx-auto" style={{ animationDelay: '120ms' }} />
            <div className="h-4 w-4/6 bg-tertiary/40 rounded animate-pulse mx-auto" style={{ animationDelay: '180ms' }} />
          </div>

          {/* Details strip */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-4 w-16 bg-tertiary/50 rounded animate-pulse" />
            <div className="w-px h-4 bg-secondary/20" />
            <div className="h-4 w-24 bg-tertiary/40 rounded animate-pulse" />
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10 pb-5 border-b border-secondary/15">
            <div>
              <div className="h-3 w-16 bg-tertiary/40 rounded animate-pulse mb-2" />
              <div className="h-9 w-44 bg-tertiary/60 rounded animate-pulse" />
            </div>
          </div>

          {/* Fragrance card grid — matches grid-cols-2 md:grid-cols-3 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-tertiary/30 border border-secondary/10 overflow-hidden"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Image placeholder */}
                <div className="aspect-4/3 bg-tertiary/50 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />

                {/* Body */}
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-tertiary/60 rounded animate-pulse" style={{ animationDelay: `${i * 40 + 20}ms` }} />
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <div key={s} className="w-2.5 h-2.5 rounded-sm bg-tertiary/50 animate-pulse" style={{ animationDelay: `${i * 40 + s * 30}ms` }} />
                    ))}
                  </div>
                  <div className="h-3 w-20 bg-tertiary/40 rounded animate-pulse" style={{ animationDelay: `${i * 40 + 40}ms` }} />
                  <div className="h-3 w-full bg-tertiary/30 rounded animate-pulse" style={{ animationDelay: `${i * 40 + 60}ms` }} />
                  <div className="h-3 w-4/5 bg-tertiary/30 rounded animate-pulse" style={{ animationDelay: `${i * 40 + 80}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
