import React, { useMemo, useState, useCallback, useRef } from 'react';
import { SearchX } from 'lucide-react';
import type { Category, Project } from '../types/portfolio';
import { filterPublicProjects } from '../utils/portfolioFilters';
import { CategoryFilterBar } from './CategoryFilterBar';
import { ProjectCard } from './ProjectCard';
import { ShowreelHero } from './ShowreelHero';
import { ServicesSection } from './ServicesSection';
import { scrollToTarget } from '../hooks/useSmoothScroll';

interface WorkViewProps {
  categories: Category[];
  projects: Project[];
  selectedCategoryId: string;
  searchQuery: string;
  isOtherVideoPlaying?: boolean;
  onSelectCategory: (categoryId: string) => void;
  onClearFilters: () => void;
  onOpenProject: (project: Project, triggerEl: HTMLElement | null) => void;
  onEnquireService?: (serviceName: string) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  categories,
  projects,
  selectedCategoryId,
  searchQuery,
  isOtherVideoPlaying = false,
  onSelectCategory,
  onClearFilters,
  onOpenProject,
  onEnquireService,
}) => {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const portfolioSectionRef = useRef<HTMLElement>(null);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const published = projects.filter((p) => p.status === 'published');
    const counts: Record<string, number> = { all: published.length };
    categories.forEach((cat) => {
      counts[cat.id] = published.filter((p) => p.categoryId === cat.id).length;
    });
    return counts;
  }, [projects, categories]);

  const filteredProjects = useMemo(
    () => filterPublicProjects(projects, selectedCategoryId, searchQuery),
    [projects, selectedCategoryId, searchQuery]
  );

  const hasActiveFilters = selectedCategoryId !== 'all' || searchQuery.trim().length > 0;

  const scrollToPortfolio = useCallback(() => {
    scrollToTarget(portfolioSectionRef.current ?? '#portfolio-section');
  }, []);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      setActivePreviewId(null);
      onSelectCategory(categoryId);

      // If the visitor is currently looking above or below the portfolio section,
      // smoothly scroll down/up into the portfolio section
      if (portfolioSectionRef.current) {
        const rect = portfolioSectionRef.current.getBoundingClientRect();
        if (rect.top > 120 || rect.bottom < 120) {
          scrollToPortfolio();
        }
      }
    },
    [onSelectCategory, scrollToPortfolio]
  );

  return (
    <div className="w-full">
      {/* 1. Large Autoplay Showreel Hero */}
      <ShowreelHero
        onExploreClick={scrollToPortfolio}
        isOtherVideoPlaying={isOtherVideoPlaying}
      />

      {/* 2. Portfolio Section: Left Sidebar & Right Project Gallery */}
      <section
        ref={portfolioSectionRef}
        id="portfolio-section"
        aria-label="Portfolio projects"
        className="portfolio-enter mx-auto max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8 scroll-mt-[calc(var(--header-height,4rem)+1rem)]"
      >
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Sidebar Section: Sticky beneath header with internal scroll preserved */}
          <aside
            data-lenis-prevent
            className="w-full md:w-60 lg:w-68 shrink-0 md:sticky md:top-[calc(var(--header-height,4rem)+1rem)] md:max-h-[calc(100vh-var(--header-height,4rem)-2rem)] md:overflow-y-auto no-scrollbar z-20"
          >
            <CategoryFilterBar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              categoryCounts={categoryCounts}
              onSelectCategory={handleCategoryClick}
            />
          </aside>

          {/* Right Main Projects Area */}
          <div className="flex-1 min-w-0 w-full">
            <h1 className="sr-only">Nzy Selected Projects</h1>

            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B0B0B] px-6 py-16 text-center">
                <SearchX className="mb-3 h-8 w-8 text-white/45" aria-hidden="true" />
                <h2 className="font-display text-lg font-medium text-white">
                  No projects match your filters
                </h2>
                <p className="mt-1.5 max-w-md text-sm text-white/60">
                  {searchQuery.trim()
                    ? `No published projects matched “${searchQuery.trim()}”.`
                    : 'There are currently no published projects in this category.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#F1F1F1] px-5 text-sm font-semibold text-[#0F0F0F] transition-colors hover:bg-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div
                data-testid="project-grid"
                className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    categoryName={categoryNameMap.get(project.categoryId) ?? 'Uncategorized'}
                    isPreviewActive={activePreviewId === project.id}
                    onRequestPreview={setActivePreviewId}
                    onSelect={onOpenProject}
                    eagerImage={index < 4}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Our Services Section */}
      <ServicesSection
        onSelectCategory={handleCategoryClick}
        onEnquireService={onEnquireService ?? (() => {})}
      />
    </div>
  );
};
