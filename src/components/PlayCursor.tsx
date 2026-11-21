import React, { useEffect, useRef } from 'react';

interface PlayCursorProps {
  isModalOpen?: boolean;
}

export const PlayCursor: React.FC<PlayCursorProps> = ({ isModalOpen = false }) => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    isVisible: false,
    clientX: -100,
    clientY: -100,
  });

  const hideCursor = () => {
    if (!stateRef.current.isVisible) return;
    stateRef.current.isVisible = false;
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
  };

  const showCursor = (x: number, y: number) => {
    if (typeof window === 'undefined') return;
    // Only display on desktop / fine pointer devices
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }
    if (isModalOpen) return;

    stateRef.current.clientX = x;
    stateRef.current.clientY = y;

    const el = cursorRef.current;
    if (!el) return;

    // Follow pointer directly without lag (centered on 36px circle = 18px offset)
    el.style.transform = `translate3d(${x - 18}px, ${y - 18}px, 0)`;

    if (!stateRef.current.isVisible) {
      stateRef.current.isVisible = true;
      el.style.display = 'flex';
    }
  };

  const updatePosition = (x: number, y: number) => {
    stateRef.current.clientX = x;
    stateRef.current.clientY = y;
    if (cursorRef.current && stateRef.current.isVisible) {
      cursorRef.current.style.transform = `translate3d(${x - 18}px, ${y - 18}px, 0)`;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const evaluateCursorAtPoint = (x: number, y: number) => {
      if (isModalOpen) {
        hideCursor();
        return;
      }

      // Check element directly under pointer coordinates
      const element = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!element) {
        hideCursor();
        return;
      }

      // Must be directly over a video thumbnail frame
      const thumbnail = element.closest<HTMLElement>('[data-playable-thumbnail="true"]');
      // Must not be over player controls, buttons, or links
      const isOverControl = Boolean(
        element.closest('button, a, input, select, textarea, [data-player-control="true"]')
      );

      if (thumbnail && !isOverControl) {
        if (!stateRef.current.isVisible) {
          showCursor(x, y);
        } else {
          updatePosition(x, y);
        }
      } else {
        hideCursor();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      evaluateCursorAtPoint(e.clientX, e.clientY);
    };

    const handlePointerOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      evaluateCursorAtPoint(e.clientX, e.clientY);
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      evaluateCursorAtPoint(e.clientX, e.clientY);
    };

    // When scrolling a video out from under a stationary pointer, immediately restore normal cursor
    const handleScroll = () => {
      if (!stateRef.current.isVisible) return;
      evaluateCursorAtPoint(stateRef.current.clientX, stateRef.current.clientY);
    };

    const handleMouseLeave = () => {
      hideCursor();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const lenis = (
      window as unknown as {
        __lenis?: {
          on: (event: string, cb: () => void) => void;
          off: (event: string, cb: () => void) => void;
        };
      }
    ).__lenis;

    if (lenis && typeof lenis.on === 'function') {
      lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (lenis && typeof lenis.off === 'function') {
        lenis.off('scroll', handleScroll);
      }
      hideCursor();
    };
  }, [isModalOpen]);

  useEffect(() => {
    hideCursor();
  }, [isModalOpen]);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 select-none will-change-transform items-center justify-center rounded-full bg-[#FF6A00] shadow-[0_2px_10px_rgba(255,106,0,0.5),0_1px_4px_rgba(0,0,0,0.5)]"
      style={{
        display: 'none',
        width: '36px',
        height: '36px',
        transform: 'translate3d(-100px, -100px, 0)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 fill-black ml-0.5"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
};
