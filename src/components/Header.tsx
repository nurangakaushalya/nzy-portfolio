import React, { useState } from 'react';
import { Film, Mail, Menu, Sparkles, User, X } from 'lucide-react';
import type { NavSection } from '../types/portfolio';
import { BRAND_CONFIG } from '../config/brand';
import { scrollToTarget } from '../hooks/useSmoothScroll';

interface HeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

export const NAV_ITEMS: {
  id: Exclude<NavSection, 'admin' | 'categories'>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'work', label: 'Work', icon: Film },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'about', label: 'About Us', icon: User },
  { id: 'contact', label: 'Contact Us', icon: Mail },
];

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const navBarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const updateHeaderHeight = () => {
      const el = navBarRef.current || headerRef.current;
      if (el) {
        const height = el.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const handleNavClick = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    if (section === 'work') {
      setTimeout(() => {
        scrollToTarget('#portfolio-section');
      }, 50);
    }
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 will-change-[background-color,backdrop-filter,border-color,box-shadow] ${
        mobileMenuOpen
          ? 'bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl'
          : isScrolled
          ? 'bg-black/35 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.06)]'
          : 'bg-black/20 backdrop-blur-md border-b border-white/5 shadow-none'
      }`}
    >
      <div
        ref={navBarRef}
        className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8"
      >
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

        {/* Zone 3: CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold text-black bg-gradient-to-b from-[#FF7A1A] to-[#FF6A00] border border-[#FF8A33] border-t-white/40 shadow-[0_3px_10px_rgba(255,106,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(255,106,0,0.5)] transition-all"
          >
            <span>Start a project</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-panel"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-[#202020] to-[#141414] text-white hover:border-white/20 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-panel"
          className="border-t border-white/10 bg-[#0C0C0C]/98 backdrop-blur-2xl px-4 py-4 md:hidden shadow-2xl"
        >
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
