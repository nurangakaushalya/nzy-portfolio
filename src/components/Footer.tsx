import React from 'react';
import type { NavSection } from '../types/portfolio';
import { NAV_ITEMS } from './Header';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;

    const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const lenis = window.__lenis;

    if (lenis && !isReducedMotion) {
      lenis.scrollTo(0, { duration: 0.85 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: isReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <footer className="mt-auto relative w-full border-t border-white/10 bg-black/40 backdrop-blur-md overflow-hidden text-white">
      {/* Large Decorative Background Logo (Dark Charcoal Silhouette with Bottom Fade Mask) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[45%] flex items-center justify-center overflow-hidden z-0 select-none"
      >
        <img
          src="/logo.png"
          alt=""
          className="w-[300px] sm:w-[480px] md:w-[640px] lg:w-[780px] max-w-[90vw] h-auto object-contain select-none"
          style={{
            filter: 'brightness(0) invert(0.18)',
            opacity: 0.35,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 95%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-12 sm:pt-16 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* 1. Original Nzy Logo (Top Center) */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('work');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-block transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] rounded-lg p-1"
          aria-label="Nzy home"
        >
          <img
            src="/logo.png"
            alt="Nzy"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </a>

        {/* 2. Studio Description (One centered line) */}
        <p className="mt-3.5 sm:mt-4 text-center text-sm sm:text-base text-white/70 font-normal max-w-lg mx-auto">
          Video editing and graphic design by Nzy.
        </p>

        {/* 3. Navigation Links (Directly below description, matching navbar) */}
        <nav
          aria-label="Footer navigation"
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-9 gap-y-3 text-sm"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="font-medium text-white/75 transition-colors duration-200 hover:text-[#FF6A00] focus-visible:outline-none focus-visible:text-[#FF6A00] focus-visible:ring-1 focus-visible:ring-[#FF6A00] rounded px-1.5 py-0.5"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 4. Thin Divider */}
        <div className="mt-12 sm:mt-16 w-full border-t border-white/10" />

        {/* 5. Bottom Copyright & Back to Top Row */}
        <div className="w-full py-6 sm:py-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-white/50">
          <p>© {currentYear} Nzy. All rights reserved.</p>
          <button
            type="button"
            onClick={handleBackToTop}
            className="inline-flex items-center gap-1.5 font-medium text-white/60 transition-colors duration-200 hover:text-[#FF6A00] focus-visible:outline-none focus-visible:text-[#FF6A00] focus-visible:ring-1 focus-visible:ring-[#FF6A00] rounded px-1.5 py-0.5 self-start sm:self-auto"
          >
            <span>Back to top</span>
            <span aria-hidden="true" className="text-[#FF6A00]">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
