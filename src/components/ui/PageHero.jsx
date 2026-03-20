/**
 * PageHero — Reusable hero banner with bilingual support.
 * 
 * Usage:
 *   <PageHero
 *     category="ABOUT" categoryTn="KA GA RONA"
 *     title="Board of Directors" titleTn="Lekgotla la Batlhankedi"
 *     description="..." descriptionTn="..."
 *     color="cyan"
 *   />
 */
import { useLanguage } from '../../lib/language';

const COLOR_MAP = {
  blue:    { dot: '#00A6CE', label: '#00A6CE', from: '#00458B', to: '#001A3A' },
  cyan:    { dot: '#00A6CE', label: '#00A6CE', from: '#00458B', to: '#001A3A' },
  magenta: { dot: '#C8237B', label: '#C8237B', from: '#00458B', to: '#001A3A' },
  yellow:  { dot: '#F7B731', label: '#F7B731', from: '#00458B', to: '#001A3A' },
  green:   { dot: '#6BBE4E', label: '#6BBE4E', from: '#00458B', to: '#001A3A' },
};

export default function PageHero({ category, categoryTn, title, titleTn, description, descriptionTn, color = 'blue' }) {
  const { lang } = useLanguage();
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  const displayCategory = lang === 'tn' && categoryTn ? categoryTn : category;
  const displayTitle = lang === 'tn' && titleTn ? titleTn : title;
  const displayDesc = lang === 'tn' && descriptionTn ? descriptionTn : description;

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
      <div
        className="relative py-12 sm:py-16 px-5 sm:px-8 lg:px-10 rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${c.from}, ${c.to})` }}
      >
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-3xl mx-auto text-center">
          {displayCategory && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-6 rounded-full" style={{ background: c.dot }} />
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: c.label }}>
                {displayCategory}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {displayTitle}
          </h1>
          {displayDesc && (
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              {displayDesc}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
