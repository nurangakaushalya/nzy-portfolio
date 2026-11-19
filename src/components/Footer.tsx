import React from 'react';
import { BRAND_CONFIG } from '../config/brand';
import type { NavSection } from '../types/portfolio';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            {BRAND_CONFIG.name}
          </span>
          <p className="mt-1 text-xs text-white/60">
            {BRAND_CONFIG.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-5 text-sm">
            <button
              type="button"
              onClick={() => onNavigate('work')}
              className="text-white/75 transition-colors hover:text-[#FF6A00]"
            >
              Work
            </button>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="text-white/75 transition-colors hover:text-[#FF6A00]"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="text-white/75 transition-colors hover:text-[#FF6A00]"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="text-white/75 transition-colors hover:text-[#FF6A00]"
            >
              Contact Us
            </button>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('admin');
              }}
              className="text-xs text-white/45 transition-colors hover:text-white/80"
            >
              Demo Admin
            </a>
          </nav>

          <p className="text-xs text-white/45">
            © {BRAND_CONFIG.copyrightYear} {BRAND_CONFIG.name}. Demonstration portfolio prototype.
          </p>
        </div>
      </div>
    </footer>
  );
};
