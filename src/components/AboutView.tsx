import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ScrollStudioStatement } from './ScrollStudioStatement';

interface AboutViewProps {
  onGoToWork: () => void;
  onGoToContact?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onGoToWork }) => {
  return (
    <div className="w-full text-white">
      {/* 
        Scroll-Linked Studio Statement:
        - Full-width text-led layout with responsive side margins
        - "About Nzy" header (smaller so main statement is focal point)
        - "We edit stories, frame by frame." (Archivo Black, natural wrap, white/orange)
        - Two supporting paragraphs side by side on desktop, stacked on mobile
        - Sequential word-by-word reveal (Headline -> Paragraph 1 -> Paragraph 2)
      */}
      <ScrollStudioStatement />

      {/* 
        Closing Section:
        - Studio process line
        - Direct call to action linking to portfolio
      */}
      <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-16 py-20 sm:py-28 text-left border-t border-white/10">
        <p className="text-base sm:text-lg md:text-xl text-white/75 leading-relaxed max-w-[54ch] text-left">
          From the first cut to the final frame, we shape the edit, sound, and color.
        </p>

        <div className="mt-8 sm:mt-10">
          <button
            type="button"
            onClick={onGoToWork}
            className="depth-btn-active inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm sm:text-base font-extrabold text-black bg-gradient-to-b from-[#FF7A1A] to-[#FF6A00] border border-[#FF8A33] border-t-white/40 shadow-[0_4px_14px_rgba(255,106,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,106,0,0.55)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]"
          >
            <span>View our work</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
};
