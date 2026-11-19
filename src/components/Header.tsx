import React, { useState } from 'react';
import { Film, LayoutGrid, Mail, Menu, Search, Sparkles, User, X } from 'lucide-react';
import type { NavSection } from '../types/portfolio';
import { BRAND_CONFIG } from '../config/brand';

interface HeaderProps {
  activeSection: NavSection;
  searchQuery: string;
  onNavigate: (section: NavSection) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
}

const NAV_ITEMS: {
  id: Exclude<NavSection, 'admin'>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'work', label: 'Work', icon: Film },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'categories', label: 'Categories', icon: LayoutGrid },
  { id: 'about', label: 'About Us', icon: User },
  { id: 'contact', label: 'Contact Us', icon: Mail },
];

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  searchQuery,
  onNavigate,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [mobileMenuOpen, mobileSearchOpen]);

  const handleNavClick = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  const handleSearchInput = (value: string) => {
    onSearchChange(value);
    if (activeSection !== 'work') {
      onNavigate('work');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit?.();
    }
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Logo */}
        <div className="flex items-center shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('work');
            }}
            className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap transition-transform duration-200 hover:scale-105"
            aria-label={`${BRAND_CONFIG.name} home`}
          >
            <img
              src="logo.png"
              alt={BRAND_CONFIG.name}
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </a>
        </div>

        {/* Zone 2: Primary navigation links with gently raised 3D appearance */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex h-full items-center gap-2 lg:gap-3"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-180 will-change-transform ${
                  isActive
                    ? 'bg-gradient-to-b from-[#262626] to-[#181818] text-white border border-[#FF6A00]/40 border-t-white/30 shadow-[0_3px_12px_rgba(255,106,0,0.22),inset_0_1px_0_rgba(255,255,255,0.22)] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(255,106,0,0.3),inset_0_1px_0_rgba(255,255,255,0.28)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(255,106,0,0.18)]'
                    : 'bg-gradient-to-b from-[#202020] to-[#141414] text-white/90 border border-white/10 border-t-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:text-white hover:border-white/20 hover:shadow-[0_5px_12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(0,0,0,0.4)]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-180 ${
                    isActive
                      ? 'bg-[#FF6A00] text-black shadow-[0_0_10px_rgba(255,106,0,0.5)]'
                      : 'bg-white/10 text-white group-hover:bg-white/15'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Inset search field + mobile quick search & menu toggles */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative hidden sm:block w-52 lg:w-64">
            <label htmlFor="header-project-search" className="sr-only">
              Search projects
            </label>
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-white/60">
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="header-project-search"
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search projects..."
              className="h-9.5 w-full rounded-xl border border-white/12 border-t-black/70 bg-[#0C0C0C] pl-9 pr-8 text-sm font-medium text-white placeholder:text-white/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.05)] transition-all duration-180 focus:bg-[#111111] focus:border-[#FF6A00]/80 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_0_14px_rgba(255,106,0,0.28)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchInput('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setMobileMenuOpen(false);
            }}
            aria-expanded={mobileSearchOpen}
            aria-label={mobileSearchOpen ? 'Close project search' : 'Search projects'}
            className={`inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border transition-all duration-180 sm:hidden ${
              mobileSearchOpen
                ? 'bg-gradient-to-b from-[#262626] to-[#181818] border-[#FF6A00]/40 border-t-white/30 text-white shadow-[0_2px_8px_rgba(255,106,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-gradient-to-b from-[#202020] to-[#141414] border-white/10 border-t-white/20 text-white hover:border-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]'
            }`}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setMobileSearchOpen(false);
            }}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-panel"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border transition-all duration-180 md:hidden ${
              mobileMenuOpen
                ? 'bg-gradient-to-b from-[#262626] to-[#181818] border-[#FF6A00]/40 border-t-white/30 text-white shadow-[0_2px_8px_rgba(255,106,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-gradient-to-b from-[#202020] to-[#141414] border-white/10 border-t-white/20 text-white hover:border-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Quick Search Bar */}
      {mobileSearchOpen && (
        <div className="border-t border-white/10 bg-[#0A0A0A] px-4 py-3 sm:hidden">
          <label htmlFor="mobile-quick-search" className="sr-only">
            Search projects
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
            />
            <input
              id="mobile-quick-search"
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search projects..."
              className="h-10 w-full rounded-xl border border-white/12 border-t-black/70 bg-[#0C0C0C] pl-9 pr-9 text-sm text-white placeholder:text-white/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.05)] focus:border-[#FF6A00] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_0_12px_rgba(255,106,0,0.25)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchInput('')}
                aria-label="Clear mobile search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Compact Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-panel"
          className="border-t border-white/10 bg-[#0A0A0A] px-4 py-4 md:hidden"
        >
          <div className="mb-4 sm:hidden">
            <label htmlFor="mobile-project-search" className="sr-only">
              Search projects
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
              />
              <input
                id="mobile-project-search"
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search projects..."
                className="h-10 w-full rounded-xl border border-white/12 border-t-black/70 bg-[#0C0C0C] pl-9 pr-9 text-sm text-white placeholder:text-white/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.05)] focus:border-[#FF6A00] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_0_12px_rgba(255,106,0,0.25)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchInput('')}
                  aria-label="Clear mobile search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-12 items-center justify-between rounded-xl px-4 text-left text-sm font-bold text-white transition-all duration-180 ${
                    isActive
                      ? 'bg-gradient-to-b from-[#262626] to-[#181818] border border-[#FF6A00]/40 border-t-white/30 shadow-[0_2px_10px_rgba(255,106,0,0.22),inset_0_1px_0_rgba(255,255,255,0.22)]'
                      : 'bg-gradient-to-b from-[#202020] to-[#141414] border border-white/10 border-t-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#FF6A00] text-black shadow-[0_0_10px_rgba(255,106,0,0.6)]'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-bold text-white">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold text-[#FF6A00]">Active</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
