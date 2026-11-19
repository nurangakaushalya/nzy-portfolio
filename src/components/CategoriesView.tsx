import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Category, Project } from '../types/portfolio';
import { getCategoryCounts } from '../utils/portfolioFilters';
import { ThumbnailImage } from './ThumbnailImage';

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
    <section
      aria-labelledby="categories-heading"
      className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-7 border-b border-white/10 pb-5">
        <h1
          id="categories-heading"
          className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Categories
        </h1>
        <p className="mt-1.5 text-sm text-white/65">
          Browse Nzy work by production discipline or design format.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categoryItems.map(({ category, publishedCount, coverThumbnail }) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className="depth-card group flex flex-col text-left rounded-2xl p-2.5 sm:p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 pb-1 px-1.5">
              <div>
                <h2 className="font-display text-lg font-medium text-white transition-colors duration-180 group-hover:text-[#FF6A00]">
                  {category.name}
                </h2>
                <p className="font-mono tabular-nums mt-0.5 text-xs text-white/60">
                  {publishedCount} {publishedCount === 1 ? 'project' : 'projects'}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#252525] to-[#161616] border border-white/10 border-t-white/20 text-[#F1F1F1] shadow-[0_2px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-180 group-hover:bg-[#FF6A00] group-hover:border-[#FF7A1A] group-hover:text-black group-hover:shadow-[0_4px_12px_rgba(255,106,0,0.3)]"
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
