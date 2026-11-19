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

export function useSmoothScroll({ isModalOpen = false }: UseSmoothScrollOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      document.documentElement.style.setProperty('--thumbnail-stretch', '1');
      return;
    }

    // Initialize Lenis with modest duration (0.75s) and gentle inertia
    const lenis = new Lenis({
      duration: 0.75, // modest duration (0.6–0.9s range)
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth, restrained easing
      smoothWheel: true,
      syncTouch: false, // keep native touch scrolling on phones and tablets
      touchMultiplier: 1,
      autoRaf: false, // controlled by our dedicated animation frame loop
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Thumbnail stretch state tracking
    let currentStretch = 1;
    let prevStretch = 1;
    const maxStretch = 0.01; // Limit stretch strictly to ~1% (scaleY 1 to 1.01)

    const raf = (time: number) => {
      lenis.raf(time);

      // Compute stretch factor based on scroll velocity
      const velocity = Math.abs(lenis.velocity || 0);
      // Map velocity (0–80) to stretch (0–0.01)
      const targetStretch = 1 + Math.min(maxStretch, (velocity / 90) * maxStretch);

      // Smoothly interpolate towards target (or return to 1 when scroll settles)
      currentStretch += (targetStretch - currentStretch) * 0.16;

      if (Math.abs(currentStretch - 1) < 0.0003) {
        currentStretch = 1;
      }

      // Only touch DOM property when stretch value has meaningful delta
      if (Math.abs(currentStretch - prevStretch) > 0.0001 || (currentStretch === 1 && prevStretch !== 1)) {
        document.documentElement.style.setProperty('--thumbnail-stretch', currentStretch.toFixed(4));
        prevStretch = currentStretch;
      }

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
        document.documentElement.style.setProperty('--thumbnail-stretch', '1');
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
      document.documentElement.style.setProperty('--thumbnail-stretch', '1');
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
      duration: 0.75,
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
