import React, { useMemo } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import type { Category, Project } from '../types/portfolio';
import { getCategoryCounts } from '../utils/portfolioFilters';
import { ThumbnailImage } from './ThumbnailImage';
import { AnimatedHeading } from './AnimatedHeading';

interface CategoriesViewProps {
  categories: Category[];
  projects: Project[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  projects,
  onSelectCategory,
}) => {
  const categoryItems = useMemo(
    () => getCategoryCounts(projects, categories),
    [projects, categories]
  );

  return (
    <div className="w-full text-white min-h-[calc(100vh-var(--header-height,4rem)-8rem)]">
      <section
        aria-labelledby="categories-heading"
        className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 text-left"
      >
        {/* Header block with Editorial Typography and Color Mix */}
        <div className="mb-8 sm:mb-12 border-b border-white/10 pb-8 sm:pb-12 text-left">
          {/* Eyebrow Badge (Matching ServicesSection) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3.5 py-1 text-xs font-extrabold text-[#FF6A00] shadow-[0_0_12px_rgba(255,106,0,0.2)] mb-4 sm:mb-6">
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="uppercase tracking-wider">Disciplines & Formats</span>
          </div>

          {/* Editorial Headline: Archivo Black, weight 400, editorial scale */}
          <AnimatedHeading
            as="h1"
            id="categories-heading"
            words={[{ text: 'Categories', className: 'text-white' }]}
            style={{
              fontFamily: "'Archivo Black', system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(2.5rem, 6.5vw, 6rem)',
              letterSpacing: '-0.035em',
            }}
            className="text-left tracking-[-0.035em] select-none text-balance"
          />

          {/* Prominent Body Text with Color Mix */}
          <p className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl font-medium leading-snug sm:leading-tight max-w-[48ch] text-left text-white text-balance">
            Browse Nzy work by <span className="text-[#FF6A00]">production discipline</span> or{' '}
            <span className="text-[#FF6A00]">design format</span>.
          </p>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/70 leading-relaxed max-w-xl text-left">
            Select any discipline below to view all published projects in that format.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryItems.map(({ category, publishedCount, coverThumbnail }) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className="depth-card group flex flex-col text-left rounded-2xl p-3 sm:p-3.5 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-[#141414] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                <ThumbnailImage
                  src={coverThumbnail ?? ''}
                  alt={`${category.name} preview`}
                  fallbackTitle={category.name}
                  projectType={category.name.toLowerCase().includes('design') ? 'design' : 'video'}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-3.5 pb-1 px-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#FF6A00]" aria-hidden="true">
                      //
                    </span>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white transition-colors duration-180 group-hover:text-[#FF6A00]">
                      {category.name}
                    </h2>
                  </div>
                  <p className="font-mono tabular-nums mt-1 text-xs text-white/60">
                    {publishedCount} {publishedCount === 1 ? 'project' : 'projects'}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#252525] to-[#161616] border border-white/10 border-t-white/20 text-[#F1F1F1] shadow-[0_2px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-180 group-hover:bg-gradient-to-b group-hover:from-[#FF7A1A] group-hover:to-[#FF6A00] group-hover:border-[#FF8A33] group-hover:text-black group-hover:shadow-[0_4px_12px_rgba(255,106,0,0.4)]"
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
