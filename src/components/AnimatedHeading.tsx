import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface AnimatedHeadingWord {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface AnimatedHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  words: (string | AnimatedHeadingWord)[];
  className?: string;
  style?: React.CSSProperties;
  /** Custom rootMargin for IntersectionObserver, default '0px 0px -50% 0px' (middle of screen) */
  rootMargin?: string;
}

interface SplitCharacter {
  char: string;
  globalIndex: number;
}

interface SplitWord {
  text: string;
  color: string;
  style?: React.CSSProperties;
  chars: SplitCharacter[];
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  as: Component = 'h1',
  id,
  words,
  className = '',
  style = {},
  rootMargin = '0px 0px -50% 0px',
}) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Normalize words into structured words and individual characters with global left-to-right indexing
  const { splitWords, fullPhrase, totalChars } = useMemo(() => {
    let charCounter = 0;
    const splitWordsList: SplitWord[] = [];
    const textPieces: string[] = [];

    words.forEach((item) => {
      const text = typeof item === 'string' ? item : item.text;
      textPieces.push(text);

      const isOrange = Boolean(
        typeof item !== 'string' &&
          (item.className?.includes('#FF6A00') ||
            item.style?.color === '#FF6A00' ||
            item.text.toLowerCase() === 'nzy' ||
            (id === 'services-heading' && item.text.toLowerCase() === 'services') ||
            (id === 'contact-heading' && item.text.toLowerCase() === 'us'))
      );
      const color = isOrange ? '#FF6A00' : '#FFFFFF';

      const chars: SplitCharacter[] = [];
      for (let i = 0; i < text.length; i++) {
        chars.push({
          char: text[i],
          globalIndex: charCounter++,
        });
      }

      splitWordsList.push({
        text,
        color,
        style: typeof item !== 'string' ? item.style : undefined,
        chars,
      });
    });

    return {
      splitWords: splitWordsList,
      fullPhrase: textPieces.join(' '),
      totalChars: charCounter,
    };
  }, [words, id]);

  // Per-character stagger delay calibrated to a smooth, perceptible pace
  const staggerMs = useMemo(() => {
    if (totalChars <= 1) return 0;
    return 55;
  }, [totalChars]);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsAnimated(true);
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Trigger reveal once visible at the middle of the screen (on route mount if already at/above middle, or when scrolled to middle)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prefersReducedMotion) {
      setIsAnimated(true);
      return;
    }

    const el = headingRef.current;
    if (!el) return;

    let timer: number | null = null;

    // Check if heading has reached the middle of the screen
    const checkMiddleOfScreen = (): boolean => {
      const rect = el.getBoundingClientRect();
      const middleThreshold = window.innerHeight * 0.5;
      if (rect.top <= middleThreshold && rect.bottom > 0) {
        setIsAnimated(true);
        return true;
      }
      return false;
    };

    // If heading is already at or above the middle of the screen on mount (e.g. About Us, Contact Us at top of route)
    const initialRect = el.getBoundingClientRect();
    if (initialRect.top <= window.innerHeight * 0.5 && initialRect.bottom > 0) {
      timer = window.setTimeout(() => {
        setIsAnimated(true);
      }, 60);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    // IntersectionObserver set to trigger at the middle of the screen (rootMargin: '0px 0px -50% 0px')
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsAnimated(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(el);

    // Also listen to window and Lenis scroll events to ensure immediate trigger at middle of screen
    const onScroll = () => {
      if (checkMiddleOfScreen()) {
        observer.disconnect();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (lenis && typeof lenis.off === 'function') {
          lenis.off('scroll', onScroll);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

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
      observer.disconnect();
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (lenis && typeof lenis.off === 'function') {
        lenis.off('scroll', onScroll);
      }
    };
  }, [prefersReducedMotion, rootMargin]);

  return (
    <Component
      ref={headingRef}
      id={id}
      aria-label={fullPhrase}
      className={className}
      style={{
        ...style,
        lineHeight: 1.15,
      }}
    >
      {/* Screen reader text: reads the complete clean heading phrase in one piece */}
      <span className="sr-only">{fullPhrase}</span>

      {/* Visual Shutter Reveal: letter-by-letter kinetic slice animation */}
      <span aria-hidden="true" className="inline">
        {splitWords.map((wordObj, wordIndex) => {
          return (
            <React.Fragment key={`${wordObj.text}-${wordIndex}`}>
              {/* Word container: keeps letters together within the word, allowing responsive wrap between words */}
              <span
                className="inline-block whitespace-nowrap"
                style={{
                  lineHeight: 'inherit',
                  ...wordObj.style,
                }}
              >
                {wordObj.chars.map(({ char, globalIndex }) => {
                  const delay = `${globalIndex * staggerMs}ms`;

                  return (
                    /* Character box: in-flow position reserves exact letter dimensions from start */
                    <span
                      key={globalIndex}
                      className="relative inline-block select-none"
                      style={{
                        verticalAlign: 'baseline',
                        lineHeight: 'inherit',
                      }}
                    >
                      {/* Top Slice: clipped to top third (0% - 33.333%), shifts right briefly */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 pointer-events-none select-none ${
                          isAnimated && !prefersReducedMotion
                            ? 'animate-shutter-top'
                            : 'opacity-0'
                        }`}
                        style={{
                          clipPath: 'inset(0% -25% 66.666% -25%)',
                          WebkitClipPath: 'inset(0% -25% 66.666% -25%)',
                          color: wordObj.color,
                          animationDelay: delay,
                          lineHeight: 'inherit',
                        }}
                      >
                        {char}
                      </span>

                      {/* Middle Slice: clipped to middle third (33.333% - 66.666%), shifts left briefly */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 pointer-events-none select-none ${
                          isAnimated && !prefersReducedMotion
                            ? 'animate-shutter-mid'
                            : 'opacity-0'
                        }`}
                        style={{
                          clipPath: 'inset(33.333% -25% 33.333% -25%)',
                          WebkitClipPath: 'inset(33.333% -25% 33.333% -25%)',
                          color: wordObj.color,
                          animationDelay: delay,
                          lineHeight: 'inherit',
                        }}
                      >
                        {char}
                      </span>

                      {/* Bottom Slice: clipped to bottom third (66.666% - 100%+ descender), shifts right briefly */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 pointer-events-none select-none ${
                          isAnimated && !prefersReducedMotion
                            ? 'animate-shutter-bot'
                            : 'opacity-0'
                        }`}
                        style={{
                          // -50% bottom inset guarantees full descender for 'g' in Categories and 'y' in Nzy
                          clipPath: 'inset(66.666% -25% -50% -25%)',
                          WebkitClipPath: 'inset(66.666% -25% -50% -25%)',
                          color: wordObj.color,
                          animationDelay: delay,
                          lineHeight: 'inherit',
                        }}
                      >
                        {char}
                      </span>

                      {/* Solid Base Letter: In-flow letter that fades/resolves cleanly into focus */}
                      <span
                        aria-hidden="true"
                        className={`inline-block ${
                          prefersReducedMotion
                            ? 'opacity-100'
                            : isAnimated
                            ? 'animate-shutter-solid'
                            : 'opacity-0'
                        }`}
                        style={{
                          color: wordObj.color,
                          animationDelay: delay,
                          lineHeight: 'inherit',
                        }}
                      >
                        {char}
                      </span>
                    </span>
                  );
                })}
              </span>

              {/* Natural trailing whitespace allows responsive line wrapping on narrow screens */}
              {wordIndex < splitWords.length - 1 && ' '}
            </React.Fragment>
          );
        })}
      </span>
    </Component>
  );
};
