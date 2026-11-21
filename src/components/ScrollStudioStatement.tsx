import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AnimatedHeading } from './AnimatedHeading';
import {
  calculateBlockProgress,
  getWordFactor,
  interpolateColor,
  MUTED_GRAY,
  WHITE,
  ORANGE,
  type RGB,
} from '../utils/textReveal';

interface StatementWord {
  text: string;
  color: string;
  targetRgb: RGB;
  section: 'headline' | 'paragraph1' | 'paragraph2';
}

const HEADLINE_WORDS: StatementWord[] = [
  // Headline (Main Statement): "We edit stories, frame by frame."
  // "We edit stories," reveals in white, "frame by frame." reveals in Nzy orange (#FF6A00)
  { text: 'We', color: '#FFFFFF', targetRgb: WHITE, section: 'headline' },
  { text: 'edit', color: '#FFFFFF', targetRgb: WHITE, section: 'headline' },
  { text: 'stories,', color: '#FFFFFF', targetRgb: WHITE, section: 'headline' },
  { text: 'frame', color: '#FF6A00', targetRgb: ORANGE, section: 'headline' },
  { text: 'by', color: '#FF6A00', targetRgb: ORANGE, section: 'headline' },
  { text: 'frame.', color: '#FF6A00', targetRgb: ORANGE, section: 'headline' },
];

const PARAGRAPH_1_WORDS: StatementWord[] = [
  // Paragraph 1: How Nzy edits
  // "A glance held longer. A cut that lands on the beat. At Nzy, we shape footage, sound, and graphics around the moments you want people to remember."
  { text: 'A', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'glance', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'held', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'longer.', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'A', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'cut', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'that', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'lands', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'on', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'the', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'beat.', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'At', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'Nzy,', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'we', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'shape', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'footage,', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'sound,', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'and', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'graphics', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'around', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'the', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'moments', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'you', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'want', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'people', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'to', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
  { text: 'remember.', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph1' },
];

const PARAGRAPH_2_WORDS: StatementWord[] = [
  // Paragraph 2: What the studio makes
  // "We cut music videos to the rhythm of a track, shape brand films around a product, and design the artwork that goes with each release."
  { text: 'We', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'cut', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'music', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'videos', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'to', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'the', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'rhythm', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'of', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'a', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'track,', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'shape', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'brand', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'films', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'around', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'a', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'product,', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'and', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'design', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'the', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'artwork', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'that', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'goes', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'with', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'each', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
  { text: 'release.', color: '#FFFFFF', targetRgb: WHITE, section: 'paragraph2' },
];

export const ScrollStudioStatement: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphsContainerRef = useRef<HTMLDivElement | null>(null);
  const p1ColRef = useRef<HTMLDivElement | null>(null);
  const p2ColRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /**
   * Graphix-style Word-by-Word Scroll Reveal:
   * - Starts revealing each text block when its first line reaches roughly 75% of viewport height (0.75 * vh)
   * - Smoothly brightens words in reading order:
   *   "We edit stories," -> white
   *   "frame by frame." -> Nzy orange (#FF6A00)
   *   Supporting paragraphs -> white
   * - Directly tied to scroll position so stopping halfway holds color and scrolling up reverses it
   * - Reduced motion immediately displays full bright colors
   */
  const updateColors = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (prefersReducedMotion) {
      for (let i = 0; i < HEADLINE_WORDS.length; i++) {
        const span = wordRefs.current[i];
        if (span) span.style.color = HEADLINE_WORDS[i].color;
      }
      for (let i = 0; i < PARAGRAPH_1_WORDS.length; i++) {
        const span = wordRefs.current[6 + i];
        if (span) span.style.color = '#FFFFFF';
      }
      for (let i = 0; i < PARAGRAPH_2_WORDS.length; i++) {
        const span = wordRefs.current[33 + i];
        if (span) span.style.color = '#FFFFFF';
      }
      return;
    }

    const vh = window.innerHeight;
    const isWide = window.innerWidth >= 768;

    // 1. Headline Reveal: begins when top reaches roughly 75% of viewport height
    const headline = headlineRef.current;
    if (headline) {
      const hTop = headline.getBoundingClientRect().top;
      const hProgress = calculateBlockProgress(hTop, vh, 0.75, 0.30);

      for (let i = 0; i < HEADLINE_WORDS.length; i++) {
        const span = wordRefs.current[i];
        if (span) {
          const factor = getWordFactor(hProgress, i, HEADLINE_WORDS.length);
          span.style.color = interpolateColor(MUTED_GRAY, HEADLINE_WORDS[i].targetRgb, factor);
        }
      }
    }

    // 2. Supporting Copy Reveal
    if (isWide) {
      // Desktop (side-by-side): sequential reveal in reading order (P1 first, P2 second)
      const pContainer = paragraphsContainerRef.current;
      if (pContainer) {
        const pTop = pContainer.getBoundingClientRect().top;
        // Phase 1 (Paragraph 1): enters at 0.75 * vh, finishes at 0.60 * vh
        const p1Progress = calculateBlockProgress(pTop, vh, 0.75, 0.15);
        // Phase 2 (Paragraph 2): enters at 0.60 * vh, finishes at 0.45 * vh
        const p2Progress = calculateBlockProgress(pTop, vh, 0.60, 0.15);

        for (let i = 0; i < PARAGRAPH_1_WORDS.length; i++) {
          const span = wordRefs.current[6 + i];
          if (span) {
            const factor = getWordFactor(p1Progress, i, PARAGRAPH_1_WORDS.length);
            span.style.color = interpolateColor(MUTED_GRAY, WHITE, factor);
          }
        }

        for (let i = 0; i < PARAGRAPH_2_WORDS.length; i++) {
          const span = wordRefs.current[33 + i];
          if (span) {
            const factor = getWordFactor(p2Progress, i, PARAGRAPH_2_WORDS.length);
            span.style.color = interpolateColor(MUTED_GRAY, WHITE, factor);
          }
        }
      }
    } else {
      // Mobile (stacked): each paragraph reveals when its own first line reaches roughly 75% of viewport height
      const p1Col = p1ColRef.current;
      const p2Col = p2ColRef.current;

      if (p1Col) {
        const p1Top = p1Col.getBoundingClientRect().top;
        const p1Progress = calculateBlockProgress(p1Top, vh, 0.75, 0.30);

        for (let i = 0; i < PARAGRAPH_1_WORDS.length; i++) {
          const span = wordRefs.current[6 + i];
          if (span) {
            const factor = getWordFactor(p1Progress, i, PARAGRAPH_1_WORDS.length);
            span.style.color = interpolateColor(MUTED_GRAY, WHITE, factor);
          }
        }
      }

      if (p2Col) {
        const p2Top = p2Col.getBoundingClientRect().top;
        const p2Progress = calculateBlockProgress(p2Top, vh, 0.75, 0.30);

        for (let i = 0; i < PARAGRAPH_2_WORDS.length; i++) {
          const span = wordRefs.current[33 + i];
          if (span) {
            const factor = getWordFactor(p2Progress, i, PARAGRAPH_2_WORDS.length);
            span.style.color = interpolateColor(MUTED_GRAY, WHITE, factor);
          }
        }
      }
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Run calculation immediately on mount
    updateColors();

    // Re-verify once custom webfonts (Archivo Black) finish downloading
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        updateColors();
      });
    }

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateColors();
      });
    };

    window.addEventListener('resize', updateColors, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const lenis = (
      window as unknown as {
        __lenis?: {
          on: (event: string, cb: () => void) => void;
          off: (event: string, cb: () => void) => void;
        };
      }
    ).__lenis;

    if (lenis && typeof lenis.on === 'function') {
      lenis.on('scroll', onScroll);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateColors);
      window.removeEventListener('scroll', onScroll);
      if (lenis && typeof lenis.off === 'function') {
        lenis.off('scroll', onScroll);
      }
    };
  }, [updateColors]);

  const headlineWords = useMemo(() => HEADLINE_WORDS, []);
  const paragraph1Words = useMemo(() => PARAGRAPH_1_WORDS, []);
  const paragraph2Words = useMemo(() => PARAGRAPH_2_WORDS, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full text-white pt-12 sm:pt-16 pb-20 sm:pb-28 lg:pb-36"
    >
      <div className="w-full flex flex-col justify-start px-5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto text-left">
        {/* Screen Reader Announcements */}
        <div className="sr-only">
          <h1>About Nzy</h1>
          <p>We edit stories, frame by frame.</p>
          <p>
            A glance held longer. A cut that lands on the beat. At Nzy, we shape
            footage, sound, and graphics around the moments you want people to
            remember.
          </p>
          <p>
            We cut music videos to the rhythm of a track, shape brand films around a
            product, and design the artwork that goes with each release.
          </p>
        </div>

        {/* 
          1. "About Nzy" Heading:
          - Reuses typography, white-and-orange color treatment, and kinetic shutter entrance of "Our Services"
          - "About" styled as "Our" (white), "Nzy" styled as "Services" (orange #FF6A00)
          - Height budgeted so the first line of the copy below begins in the lower part of the screen (around 78% of viewport)
        */}
        <div
          className="w-full flex flex-col justify-center text-left"
          style={{
            minHeight: 'max(360px, calc(78vh - var(--header-height, 4rem)))',
          }}
        >
          <AnimatedHeading
            as="h1"
            id="about-heading"
            words={[
              { text: 'About', className: 'text-white' },
              { text: 'Nzy', className: 'text-[#FF6A00]' },
            ]}
            style={{
              fontFamily: "'Archivo Black', system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(3rem, 8.5vw, 8rem)',
              letterSpacing: '-0.035em',
            }}
            className="text-left tracking-[-0.035em] select-none text-balance"
          />
        </div>

        {/* 2. Visual Word-by-Word Scroll Reveal Stage */}
        <div aria-hidden="true" className="w-full text-left">
          {/* Main Statement in Archivo Black - spans full content width with natural wrapping */}
          <h2
            id="about-main-statement"
            ref={headlineRef}
            style={{
              fontFamily: "'Archivo Black', system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(2.75rem, 6.2vw, 6.5rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
            }}
            className="w-full text-left select-none tracking-[-0.035em] break-words text-balance"
          >
            {headlineWords.map((word, i) => (
              <React.Fragment key={`hl-${word.text}-${i}`}>
                <span
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                  style={{
                    color: prefersReducedMotion ? word.color : 'rgb(90, 90, 90)',
                  }}
                  className="inline-block will-change-[color]"
                >
                  {word.text}
                </span>
                {i < headlineWords.length - 1 && ' '}
              </React.Fragment>
            ))}
          </h2>

          {/* 3. Two Supporting Paragraphs: Side by side on desktop, stacked on mobile */}
          <div
            ref={paragraphsContainerRef}
            className="mt-12 sm:mt-16 lg:mt-20 w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 text-left"
          >
            {/* Paragraph 1: How Nzy edits */}
            <div ref={p1ColRef} className="w-full max-w-xl text-left">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-left select-none break-words">
                {paragraph1Words.map((word, i) => {
                  const globalIndex = 6 + i;
                  return (
                    <React.Fragment key={`p1-${word.text}-${i}`}>
                      <span
                        ref={(el) => {
                          wordRefs.current[globalIndex] = el;
                        }}
                        style={{
                          color: prefersReducedMotion ? word.color : 'rgb(90, 90, 90)',
                        }}
                        className="inline-block will-change-[color]"
                      >
                        {word.text}
                      </span>
                      {i < paragraph1Words.length - 1 && ' '}
                    </React.Fragment>
                  );
                })}
              </p>
            </div>

            {/* Paragraph 2: What the studio makes */}
            <div ref={p2ColRef} className="w-full max-w-xl text-left">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-left select-none break-words">
                {paragraph2Words.map((word, i) => {
                  const globalIndex = 33 + i;
                  return (
                    <React.Fragment key={`p2-${word.text}-${i}`}>
                      <span
                        ref={(el) => {
                          wordRefs.current[globalIndex] = el;
                        }}
                        style={{
                          color: prefersReducedMotion ? word.color : 'rgb(90, 90, 90)',
                        }}
                        className="inline-block will-change-[color]"
                      >
                        {word.text}
                      </span>
                      {i < paragraph2Words.length - 1 && ' '}
                    </React.Fragment>
                  );
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
