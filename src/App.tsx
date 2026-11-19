/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { localPortfolioRepository } from './data/portfolioRepository';
import type {
  ContactEnquiryPrefill,
  NavSection,
  PortfolioData,
  Project,
} from './types/portfolio';
import { Header } from './components/Header';
import { WorkView } from './components/WorkView';
import { CategoriesView } from './components/CategoriesView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { AdminDashboard } from './components/AdminDashboard';
import { VideoProjectModal } from './components/VideoProjectModal';
import { DesignGalleryModal } from './components/DesignGalleryModal';
import { Footer } from './components/Footer';
import { useSmoothScroll, scrollToTarget } from './hooks/useSmoothScroll';

function parseSectionFromLocation(): NavSection {
  if (typeof window === 'undefined') {
    return 'work';
  }
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (path === '/admin') {
    return 'admin';
  }
  if (path === '/services') {
    return 'services';
  }
  if (path === '/categories') {
    return 'categories';
  }
  if (path === '/about') {
    return 'about';
  }
  if (path === '/contact') {
    return 'contact';
  }
  return 'work';
}

function sectionToPath(section: NavSection): string {
  switch (section) {
    case 'admin':
      return '/admin';
    case 'services':
      return '/services';
    case 'categories':
      return '/categories';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    default:
      return '/';
  }
}

export default function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() =>
    localPortfolioRepository.load()
  );
  const [storageError, setStorageError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>(() =>
    parseSectionFromLocation()
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contactPrefill, setContactPrefill] =
    useState<ContactEnquiryPrefill | null>(null);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [modalTriggerEl, setModalTriggerEl] = useState<HTMLElement | null>(null);

  // Initialize smooth scrolling with gentle inertia and subtle velocity-driven stretch
  useSmoothScroll({ isModalOpen: Boolean(activeProject) });

  // Smoothly fade out the initial preloader once the app is mounted
  useEffect(() => {
    const preloader = document.getElementById('site-preloader');
    if (!preloader) return;

    const timer = setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 500);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextSection = parseSectionFromLocation();
      setActiveSection(nextSection);
      if (nextSection === 'services') {
        setTimeout(() => {
          scrollToTarget('#services-section');
        }, 80);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If visitor lands directly on /services, smoothly scroll to services section after initial render
  useEffect(() => {
    if (activeSection === 'services') {
      const timer = setTimeout(() => {
        scrollToTarget('#services-section');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const navigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    const targetPath = sectionToPath(section);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    if (section === 'services') {
      setTimeout(() => {
        scrollToTarget('#services-section');
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  const handleSaveData = useCallback((nextData: PortfolioData): boolean => {
    const result = localPortfolioRepository.save(nextData);
    if (!result.ok) {
      setStorageError(result.error ?? 'Failed to save changes.');
      return false;
    }
    setStorageError(null);
    setPortfolioData(nextData);
    return true;
  }, []);

  const handleResetDemoData = useCallback(() => {
    const restored = localPortfolioRepository.reset();
    setStorageError(null);
    setPortfolioData(restored);
    setSelectedCategoryId('all');
    setSearchQuery('');
  }, []);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    portfolioData.categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [portfolioData.categories]);

  // Keep selected category valid if admin deletes an empty category
  useEffect(() => {
    if (
      selectedCategoryId !== 'all' &&
      !portfolioData.categories.some((c) => c.id === selectedCategoryId)
    ) {
      setSelectedCategoryId('all');
    }
  }, [portfolioData.categories, selectedCategoryId]);

  const handleOpenProject = useCallback(
    (project: Project, triggerEl: HTMLElement | null) => {
      setModalTriggerEl(triggerEl);
      setActiveProject(project);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setActiveProject(null);
  }, []);

  const handleDiscussSimilar = useCallback(
    (project: Project) => {
      const catName = categoryNameMap.get(project.categoryId) ?? '';
      let suggestedService = 'Video Editing';
      if (project.type === 'design' || catName.toLowerCase().includes('design')) {
        suggestedService = 'Graphic Design';
      } else if (catName.toLowerCase().includes('commercial')) {
        suggestedService = 'Commercial / Brand Film';
      } else if (catName.toLowerCase().includes('reel')) {
        suggestedService = 'Social Media Reels';
      } else if (catName.toLowerCase().includes('music')) {
        suggestedService = 'Music Video';
      } else if (catName.toLowerCase().includes('corporate')) {
        suggestedService = 'Corporate Video';
      } else if (catName.toLowerCase().includes('motion')) {
        suggestedService = 'Motion Graphics';
      }

      setContactPrefill({
        projectTitle: project.title,
        suggestedService,
      });
      navigate('contact');
    },
    [categoryNameMap, navigate]
  );

  const activeCategoryName = activeProject
    ? categoryNameMap.get(activeProject.categoryId) ?? 'Uncategorized'
    : '';

  const handleSearchSubmit = useCallback(() => {
    if (activeSection !== 'work') {
      navigate('work');
    }
    setTimeout(() => {
      scrollToTarget('#portfolio-section');
    }, 60);
  }, [activeSection, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white selection:bg-[#FF6A00] selection:text-black">
      {/* Ambient Background Gradient Meshes */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Glow Orb 1: Upper right warm vibrant orange glow */}
        <div className="absolute -top-32 -right-24 h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] rounded-full bg-gradient-to-br from-[#FF6A00]/18 via-[#FF4500]/9 to-transparent blur-[110px] transform-gpu" />

        {/* Glow Orb 2: Mid left deep ember & amber glow */}
        <div className="absolute top-[35%] -left-36 h-[600px] w-[600px] sm:h-[800px] sm:w-[800px] rounded-full bg-gradient-to-tr from-[#FF5500]/13 via-[#B83000]/8 to-transparent blur-[130px] transform-gpu" />

        {/* Glow Orb 3: Lower right rich crimson / dusk aura */}
        <div className="absolute top-[68%] -right-28 h-[550px] w-[550px] sm:h-[720px] sm:w-[720px] rounded-full bg-gradient-to-bl from-[#FF7A1A]/14 via-[#7A1540]/8 to-transparent blur-[125px] transform-gpu" />

        {/* Glow Orb 4: Bottom left warm deep amber glow */}
        <div className="absolute -bottom-28 left-[12%] h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] rounded-full bg-gradient-to-t from-[#FF6A00]/14 via-[#E64A00]/7 to-transparent blur-[120px] transform-gpu" />

        {/* Subtle decorative radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,10,0.14),rgba(0,0,0,0))]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          activeSection={activeSection}
          searchQuery={searchQuery}
          onNavigate={navigate}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="flex-1">
          {(activeSection === 'work' || activeSection === 'services') && (
            <WorkView
              categories={portfolioData.categories}
              projects={portfolioData.projects}
              selectedCategoryId={selectedCategoryId}
              searchQuery={searchQuery}
              isOtherVideoPlaying={Boolean(activeProject)}
              onSelectCategory={setSelectedCategoryId}
              onClearFilters={() => {
                setSelectedCategoryId('all');
                setSearchQuery('');
              }}
              onOpenProject={handleOpenProject}
              onEnquireService={(serviceName) => {
                setContactPrefill({
                  suggestedService: serviceName,
                });
                navigate('contact');
              }}
            />
          )}

          {activeSection === 'categories' && (
            <CategoriesView
              categories={portfolioData.categories}
              projects={portfolioData.projects}
              onSelectCategory={(categoryId) => {
                setSelectedCategoryId(categoryId);
                navigate('work');
                setTimeout(() => {
                  scrollToTarget('#portfolio-section');
                }, 60);
              }}
            />
          )}

          {activeSection === 'about' && (
            <AboutView onGoToContact={() => navigate('contact')} />
          )}

          {activeSection === 'contact' && (
            <ContactView
              prefill={contactPrefill}
              onClearPrefill={() => setContactPrefill(null)}
            />
          )}

          {activeSection === 'admin' && (
            <AdminDashboard
              data={portfolioData}
              storageError={storageError}
              onSaveData={handleSaveData}
              onResetDemoData={handleResetDemoData}
              onExitAdmin={() => navigate('work')}
            />
          )}
        </main>

        <Footer onNavigate={navigate} />
      </div>

      <VideoProjectModal
        project={activeProject?.type === 'video' ? activeProject : null}
        categoryName={activeCategoryName}
        returnFocusTo={modalTriggerEl}
        onClose={handleCloseModal}
        onDiscussSimilar={handleDiscussSimilar}
      />

      <DesignGalleryModal
        project={activeProject?.type === 'design' ? activeProject : null}
        categoryName={activeCategoryName}
        returnFocusTo={modalTriggerEl}
        onClose={handleCloseModal}
        onDiscussSimilar={handleDiscussSimilar}
      />
    </div>
  );
}
