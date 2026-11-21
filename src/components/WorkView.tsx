import React from 'react';
import type { Category, Project } from '../types/portfolio';
import { ShowreelHero } from './ShowreelHero';
import { RollerGallery } from './RollerGallery';
import { ServicesSection } from './ServicesSection';
import { PlayCursor } from './PlayCursor';
import { scrollToTarget } from '../hooks/useSmoothScroll';

interface WorkViewProps {
  categories: Category[];
  projects: Project[];
  isOtherVideoPlaying?: boolean;
  onOpenProject: (project: Project, triggerEl: HTMLElement | null) => void;
  onEnquireService?: (serviceName: string) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  categories,
  projects,
  isOtherVideoPlaying = false,
  onOpenProject,
  onEnquireService,
}) => {
  const scrollToPortfolio = () => {
    scrollToTarget('#portfolio-section');
  };

  return (
    <div className="w-full">
      {/* Shared Custom Play Cursor for Video Project Thumbnails */}
      <PlayCursor isModalOpen={isOtherVideoPlaying} />

      {/* 1. Large Autoplay Showreel Hero */}
      <ShowreelHero
        onExploreClick={scrollToPortfolio}
        isOtherVideoPlaying={isOtherVideoPlaying}
      />

      {/* 2. Vertical Scroll-Driven Roller Gallery (Complete video collection immediately after hero) */}
      <RollerGallery
        projects={projects}
        categories={categories}
        isOtherVideoPlaying={isOtherVideoPlaying}
        onOpenProject={onOpenProject}
      />

      {/* 3. Services Section */}
      <ServicesSection
        onSelectCategory={() => {
          scrollToPortfolio();
        }}
        onEnquireService={onEnquireService ?? (() => {})}
      />
    </div>
  );
};
