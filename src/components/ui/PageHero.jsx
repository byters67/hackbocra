/**
 * PageHero — Reusable hero banner component for consistent page headers.
 * 
 * Usage:
 *   <PageHero
 *     category="ABOUT"          // uppercase label above title
 *     title="Board of Directors" // main heading
 *     description="..."         // subtitle text
 *     color="cyan"              // bocra dot colour: cyan | magenta | yellow | green | blue (default)
 *   />
 * 
 * Colour mapping matches the 4 BOCRA dots:
 *   cyan    (#00A6CE) — Services, Technical
 *   magenta (#C8237B) — Media, Complaints
 *   yellow  (#F7B731) — Documents, Resources
 *   green   (#6BBE4E) — Licensing, Verification
 *   blue    (#00458B) — About, General (default)
 */

const COLOR_MAP = {
  blue:    { dot: '#00A6CE', label: '#00A6CE', from: '#00458B', to: '#001A3A' },
  cyan:    { dot: '#00A6CE', label: '#00A6CE', from: '#00458B', to: '#001A3A' },
  magenta: { dot: '#C8237B', label: '#C8237B', from: '#00458B', to: '#001A3A' },
  yellow:  { dot: '#F7B731', label: '#F7B731', from: '#00458B', to: '#001A3A' },
  green:   { dot: '#6BBE4E', label: '#6BBE4E', from: '#00458B', to: '#001A3A' },
};

export default function PageHero({ category, title, description, color = 'blue' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
      <div
        className="relative py-12 sm:py-16 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${c.from}, ${c.to})` }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-3xl mx-auto text-center">
          {category && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-6 rounded-full" style={{ background: c.dot }} />
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: c.label }}>
                {category}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {title}
          </h1>
          {description && (
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
