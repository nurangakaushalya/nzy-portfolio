import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

interface UseSmoothScrollOptions {
  isModalOpen?: boolean;
}

/**
 * Custom hook to initialize and manage a single unified Lenis smooth-scroll instance.
 *
 * Current Mode: Duration-based easing
 * - Tuned in small increments: 0.75s -> 0.85s -> 0.95s -> 1.00s
 * - Immediate pickup on wheel tick via high-slope exponential curve at t=0
 * - Settle decelerates smoothly over 1.00s matching graphixdesign.agency's gentle glide
 * - Note: To use pure linear interpolation (lerp) like graphixdesign.agency (lerp: 0.1),
 *   simply comment out `duration` and `easing` below and uncomment `lerp: 0.1`.
 */
export function useSmoothScroll({ isModalOpen = false }: UseSmoothScrollOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    // Initialize Lenis with tuned duration-based easing for gentle glide
    const lenis = new Lenis({
      duration: 1.0, // Tuned from 0.75s in small increments (0.75s -> 0.85s -> 0.95s -> 1.00s)
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // immediate response at t=0, exponential smooth settle
      // Alternative pure lerp configuration (exact graphixdesign.agency equivalent):
      // lerp: 0.1,
      smoothWheel: true,
      syncTouch: false, // keep native touch scrolling on phones and tablets
      touchMultiplier: 1,
      autoRaf: false, // controlled strictly by our single dedicated animation frame loop
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Dedicated single animation loop for Lenis (zero style recalculations on document root)
    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };

    rafIdRef.current = requestAnimationFrame(raf);

    // Listen for changes to prefers-reduced-motion
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        lenis.destroy();
        lenisRef.current = null;
        window.__lenis = undefined;
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    };
  }, []);

  // Control scrolling when modal opens / closes
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isModalOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isModalOpen]);

  return lenisRef;
}

/**
 * Helper to smoothly scroll to a target element or selector accounting for header offset
 */
export function scrollToTarget(target: string | HTMLElement, offset = -72) {
  if (typeof window === 'undefined') return;

  const lenis = window.__lenis;
  const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const targetEl = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!targetEl) return;

  if (lenis && !isReducedMotion) {
    lenis.scrollTo(targetEl, {
      offset,
      duration: 0.85,
    });
  } else {
    const headerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '64',
      10
    );
    const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerHeight - 16;

    window.scrollTo({
      top: offsetPosition,
      behavior: isReducedMotion ? 'instant' : 'smooth',
    });
  }
}
