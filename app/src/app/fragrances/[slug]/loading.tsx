export default function FragranceLoading() {
  return (
    <div className="min-h-screen bg-tertiary/30">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
          {/* Breadcrumb */}
          <div className="h-3 w-24 bg-tertiary/60 rounded animate-pulse" />

          {/* Title block */}
          <div className="mt-8 max-w-4xl">
            <div className="h-12 sm:h-16 md:h-20 w-3/4 bg-tertiary/60 rounded-lg animate-pulse mb-5" />

            {/* Decorative rule */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px w-10 bg-secondary/20" />
              <div className="w-2 h-2 rounded-full bg-secondary/20" />
              <div className="h-px w-40 bg-secondary/10" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mt-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-4 h-4 rounded-sm bg-tertiary/60 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-start">

          {/* Left: image + price card */}
          <div className="flex flex-col gap-4">
            <div className="aspect-3/4 bg-tertiary/50 rounded-2xl animate-pulse" />
            <div className="bg-white/50 border border-secondary/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-8 w-20 bg-tertiary/50 rounded animate-pulse" />
                <div className="h-8 w-16 bg-tertiary/50 rounded animate-pulse" />
              </div>
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-28 bg-tertiary/60 rounded-full animate-pulse" />
                <div className="h-7 w-24 bg-tertiary/40 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right: about + house + notes */}
          <div className="space-y-8">
            {/* About */}
            <div>
              <div className="h-3 w-12 bg-secondary/30 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-tertiary/50 rounded animate-pulse" />
                <div className="h-4 w-full bg-tertiary/50 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-tertiary/50 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-tertiary/40 rounded animate-pulse" />
              </div>
            </div>

            {/* House */}
            <div>
              <div className="h-3 w-28 bg-secondary/30 rounded animate-pulse mb-3" />
              <div className="h-6 w-40 bg-tertiary/60 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-tertiary/40 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-tertiary/40 rounded animate-pulse mt-1" />
            </div>

            {/* Notes */}
            <div>
              <div className="h-3 w-32 bg-secondary/30 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {['Top', 'Heart', 'Base'].map((label) => (
                  <div key={label}>
                    <div className="h-3 w-8 bg-tertiary/40 rounded animate-pulse mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {[64, 80, 56, 72].map((w, i) => (
                        <div key={i} className="h-6 rounded-full bg-tertiary/50 animate-pulse" style={{ width: w, animationDelay: `${i * 50}ms` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
