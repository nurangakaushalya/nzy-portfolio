import React from 'react';
import {
  Boxes,
  Building2,
  Clapperboard,
  Layers,
  Music,
  Palette,
  Smartphone,
  Tv,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import type { Category } from '../types/portfolio';
import { sortCategories } from '../utils/portfolioFilters';

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategoryId: string;
  categoryCounts?: Record<string, number>;
  onSelectCategory: (categoryId: string) => void;
}

const WhatsAppIcon = ({ className = 'h-4.5 w-4.5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('commercial')) return Tv;
  if (lower.includes('reel') || lower.includes('social')) return Smartphone;
  if (lower.includes('music')) return Music;
  if (lower.includes('corporate')) return Building2;
  if (lower.includes('motion')) return Boxes;
  if (lower.includes('design')) return Palette;
  return Clapperboard;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategoryId,
  categoryCounts,
  onSelectCategory,
}) => {
  const ordered = sortCategories(categories);

  return (
    <nav
      aria-label="Categories"
      className="w-full bg-transparent border-0 p-0 shadow-none md:rounded-2xl md:border md:border-white/10 md:border-t-white/20 md:bg-[#131313]/95 md:p-3 sm:md:p-3.5 md:backdrop-blur-xl md:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.85),0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
    >
      {/* Sidebar Header (Desktop only) */}
      <div className="hidden md:flex items-center justify-between px-2.5 py-2 text-xs font-extrabold uppercase tracking-wider text-white border-b border-white/10 mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-[#FF6A00]" aria-hidden="true" />
          <span
            style={{
              fontFamily: "'Archivo Black', system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            <span className="text-white">Our </span>
            <span className="text-[#FF6A00]">Categories</span>
          </span>
        </div>
        <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#1C1C1C] text-[#FF6A00] border border-[#FF6A00]/30 shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]">
          {ordered.length + 1}
        </span>
      </div>

      <div
        role="group"
        data-lenis-prevent
        aria-label="Project category filters"
        className="no-scrollbar flex md:flex-col items-center md:items-stretch gap-2 md:gap-1.5 overflow-x-auto py-1 px-0.5 md:p-0"
      >
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          aria-pressed={selectedCategoryId === 'all'}
          className={`group flex items-center justify-center md:justify-start gap-2.5 md:gap-3 rounded-lg md:rounded-xl px-4 py-2 md:px-3.5 md:py-2.5 text-sm font-bold md:font-extrabold whitespace-nowrap transition-all duration-180 shrink-0 md:shrink md:w-full will-change-transform ${
            selectedCategoryId === 'all'
              ? 'bg-white text-black shadow-none border-0 md:bg-gradient-to-b md:from-[#FF7A1A] md:to-[#FF6A00] md:text-black md:border md:border-[#FF8A33] md:border-t-white/45 md:shadow-[0_3px_10px_rgba(255,106,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] md:hover:-translate-y-0.5 md:hover:shadow-[0_5px_14px_rgba(255,106,0,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] md:active:translate-y-0 md:active:shadow-[0_1px_4px_rgba(255,106,0,0.3)]'
              : 'bg-[#202020] text-white hover:bg-[#2A2A2A] border-0 md:bg-gradient-to-b md:from-[#222222] md:to-[#151515] md:text-white md:border md:border-white/5 md:border-t-white/15 md:shadow-[0_2px_5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] md:hover:-translate-y-0.5 md:hover:border-white/15 md:hover:shadow-[0_5px_12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)] md:active:translate-y-0 md:active:shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
          }`}
        >
          <span
            className={`hidden md:flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-180 shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-black/20 text-black shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]'
                : 'bg-white/5 text-[#FF6A00] group-hover:bg-white/10'
            }`}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>All</span>
          {categoryCounts && categoryCounts['all'] !== undefined && (
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ml-auto hidden md:inline-block ${
                selectedCategoryId === 'all'
                  ? 'bg-black/25 text-black font-extrabold'
                  : 'text-white/40 group-hover:text-white/70'
              }`}
            >
              {categoryCounts['all']}
            </span>
          )}
        </button>

        {ordered.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const Icon = getCategoryIcon(category.name);
          const count = categoryCounts ? categoryCounts[category.id] : undefined;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              aria-pressed={isSelected}
              className={`group flex items-center justify-center md:justify-start gap-2.5 md:gap-3 rounded-lg md:rounded-xl px-4 py-2 md:px-3.5 md:py-2.5 text-sm font-bold md:font-extrabold whitespace-nowrap transition-all duration-180 shrink-0 md:shrink md:w-full will-change-transform ${
                isSelected
                  ? 'bg-white text-black shadow-none border-0 md:bg-gradient-to-b md:from-[#FF7A1A] md:to-[#FF6A00] md:text-black md:border md:border-[#FF8A33] md:border-t-white/45 md:shadow-[0_3px_10px_rgba(255,106,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] md:hover:-translate-y-0.5 md:hover:shadow-[0_5px_14px_rgba(255,106,0,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] md:active:translate-y-0 md:active:shadow-[0_1px_4px_rgba(255,106,0,0.3)]'
                  : 'bg-[#202020] text-white hover:bg-[#2A2A2A] border-0 md:bg-gradient-to-b md:from-[#222222] md:to-[#151515] md:text-white md:border md:border-white/5 md:border-t-white/15 md:shadow-[0_2px_5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] md:hover:-translate-y-0.5 md:hover:border-white/15 md:hover:shadow-[0_5px_12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)] md:active:translate-y-0 md:active:shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
              }`}
            >
              <span
                className={`hidden md:flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-180 shrink-0 ${
                  isSelected
                    ? 'bg-black/20 text-black shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]'
                    : 'bg-white/5 text-[#FF6A00] group-hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>{category.name}</span>
              {count !== undefined && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ml-auto hidden md:inline-block ${
                    isSelected
                      ? 'bg-black/25 text-black font-extrabold'
                      : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Mobile WhatsApp Button in horizontal row */}
        <a
          href={`https://wa.me/${BRAND_CONFIG.whatsappBusinessNumber}?text=${encodeURIComponent(
            "Hello Nzy, I'd like to discuss a project!"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold whitespace-nowrap transition-all duration-180 shrink-0 bg-[#202020] text-[#25D366] hover:bg-[#25D366] hover:text-black"
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Desktop WhatsApp Button at bottom of the Left Bar */}
      <div className="hidden md:block border-t border-white/10 pt-3 mt-3">
        <a
          href={`https://wa.me/${BRAND_CONFIG.whatsappBusinessNumber}?text=${encodeURIComponent(
            "Hello Nzy, I'd like to discuss a project!"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between w-full rounded-xl p-3 text-sm font-extrabold transition-all duration-180 border border-[#25D366]/30 border-t-[#25D366]/60 bg-gradient-to-b from-[#1C2C20] to-[#111C14] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(37,211,102,0.3)] hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-black hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:border-[#25D366] active:translate-y-0"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-black shadow-md group-hover:bg-black group-hover:text-[#25D366] transition-colors">
              <WhatsAppIcon className="h-4.5 w-4.5" />
            </span>
            <div className="text-left">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/60 group-hover:text-black/80">
                Direct Chat
              </div>
              <div className="text-sm font-extrabold">WhatsApp</div>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#25D366] group-hover:bg-black animate-pulse shadow-[0_0_8px_#25D366]" />
        </a>
      </div>
    </nav>
  );
};
