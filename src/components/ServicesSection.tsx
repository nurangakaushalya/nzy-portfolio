import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { AnimatedHeading } from './AnimatedHeading';

import promoImg from '../assets/images/commercial_apex_watch_1794892278805.jpg';
import reelsImg1 from '../assets/images/reel_streetwear_drop_1794892280358.jpg';
import reelsImg2 from '../assets/images/reel_espresso_craft_1794892280303.jpg';
import aiImg from '../assets/images/commercial_ev_horizon_1794892280413.jpg';
import designImg from '../assets/images/design_poster_series_1794892283720.jpg';

interface ServicesSectionProps {
  onSelectCategory?: (categoryId: string) => void;
  onEnquireService?: (serviceName: string) => void;
}

const WhatsAppIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

type ImageType = 'promo' | 'social' | 'ai' | 'design';

interface ServiceBarItem {
  id: string;
  title: string;
  description: string;
  imageType: ImageType;
}

const SERVICES: ServiceBarItem[] = [
  {
    id: 'promotional-video-editing',
    title: 'Promotional Video Editing',
    description: 'We cut product launches, event highlights, and brand campaigns into promos.',
    imageType: 'promo',
  },
  {
    id: 'social-media-video-editing',
    title: 'Social Media Video Editing',
    description: 'Reels, Shorts, and feed videos for Instagram, TikTok, YouTube, and Facebook.',
    imageType: 'social',
  },
  {
    id: 'ai-advertising-videos',
    title: 'AI Advertising Videos',
    description: 'We turn campaign ideas into video ads with AI-generated scenes.',
    imageType: 'ai',
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    description: 'We design campaign posters, social graphics, and digital ads.',
    imageType: 'design',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onEnquireService,
}) => {
  // Desktop active row (row 0 active on load, hovering switches smoothly)
  const [activeDesktopIndex, setActiveDesktopIndex] = useState<number>(0);
  // Mobile accordion toggle (-1 is all collapsed; default row 0 open)
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Smooth scroll entrance reveal tracking
  const [revealedRows, setRevealedRows] = useState<Record<number, boolean>>({});
  const [staggerDelays, setStaggerDelays] = useState<Record<number, number>>({});
  const observedElementsRef = useRef<HTMLElement[]>([]);

  const revealRowImmediately = useCallback((index: number) => {
    setRevealedRows((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
    setStaggerDelays((prev) => ({ ...prev, [index]: 0 }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // IntersectionObserver: Reveals each row when its top enters the bottom 10% of viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prefersReducedMotion) {
      const all: Record<number, boolean> = {};
      SERVICES.forEach((_, idx) => {
        all[idx] = true;
      });
      setRevealedRows(all);
      return;
    }

    let staggerCounter = 0;
    let batchTimer: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .map((e) => {
            const index = Number(e.target.getAttribute('data-row-index'));
            return { entry: e, index };
          })
          .sort((a, b) => a.index - b.index);

        if (intersecting.length === 0) return;

        intersecting.forEach(({ entry, index }) => {
          observer.unobserve(entry.target);

          const delay = staggerCounter * 60;
          staggerCounter++;

          setStaggerDelays((prev) => ({ ...prev, [index]: delay }));
          setRevealedRows((prev) => ({ ...prev, [index]: true }));
        });

        if (batchTimer) clearTimeout(batchTimer);
        batchTimer = window.setTimeout(() => {
          staggerCounter = 0;
        }, 180);
      },
      {
        root: null,
        // Bottom 10% of the viewport: triggers when top crosses 90% viewport height
        rootMargin: '0px 0px -10% 0px',
        threshold: 0,
      }
    );

    observedElementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (batchTimer) clearTimeout(batchTimer);
    };
  }, [prefersReducedMotion]);

  const registerRowElement = (el: HTMLElement | null) => {
    if (el && !observedElementsRef.current.includes(el)) {
      observedElementsRef.current.push(el);
    }
  };

  /**
   * Renders the compact image near center with rounded corners,
   * slight tilt, and second offset layer behind it.
   */
  const renderServiceImage = (
    imageType: ImageType,
    isOpen: boolean,
    reducedMotion: boolean
  ) => {
    if (imageType === 'social') {
      return (
        <div className="relative w-[180px] h-[140px] flex items-center justify-center select-none pointer-events-none">
          {/* Second offset layer behind */}
          <div
            aria-hidden="true"
            className="absolute w-[124px] h-[106px] xl:w-[130px] xl:h-[112px] rounded-2xl bg-[#fff3ea] shadow-md"
            style={{
              transform: isOpen ? 'rotate(-6deg) scale(1)' : 'rotate(0deg) scale(0.6)',
              opacity: isOpen ? 1 : 0,
              transition: reducedMotion
                ? 'none'
                : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out',
            }}
          />
          {/* Two overlapping vertical frames from Nzy's short-form work */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'scale(1)' : 'scale(0.6)',
              transition: reducedMotion
                ? 'none'
                : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out',
            }}
          >
            {/* Reel Frame 1 (Streetwear Drop) */}
            <img
              src={reelsImg1}
              alt="Social media reel streetwear frame"
              aria-hidden="true"
              className="w-[62px] h-[104px] xl:w-[68px] xl:h-[110px] object-cover rounded-xl shadow-lg -rotate-6 -translate-x-3.5 z-10"
              style={{ objectPosition: 'center 20%' }}
            />
            {/* Reel Frame 2 (Espresso Craft) */}
            <img
              src={reelsImg2}
              alt="Social media reel espresso craft frame"
              aria-hidden="true"
              className="w-[62px] h-[104px] xl:w-[68px] xl:h-[110px] object-cover rounded-xl shadow-2xl rotate-6 translate-x-3.5 -translate-y-1 z-20"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      );
    }

    let imgSrc = promoImg;
    let imgAlt = 'Promotional video editing frame';
    let layerW = 'w-[140px] xl:w-[150px]';
    let layerH = 'h-[94px] xl:h-[100px]';
    let imgW = 'w-[140px] xl:w-[150px]';
    let imgH = 'h-[94px] xl:h-[100px]';

    if (imageType === 'promo') {
      imgSrc = promoImg;
      imgAlt = 'Product launch commercial close-up';
      layerW = 'w-[140px] xl:w-[150px]';
      layerH = 'h-[94px] xl:h-[100px]';
      imgW = 'w-[140px] xl:w-[150px]';
      imgH = 'h-[94px] xl:h-[100px]';
    } else if (imageType === 'ai') {
      imgSrc = aiImg;
      imgAlt = 'AI advertising scene still';
      layerW = 'w-[140px] xl:w-[150px]';
      layerH = 'h-[94px] xl:h-[100px]';
      imgW = 'w-[140px] xl:w-[150px]';
      imgH = 'h-[94px] xl:h-[100px]';
    } else if (imageType === 'design') {
      imgSrc = designImg;
      imgAlt = 'Finished graphic design exhibition poster';
      layerW = 'w-[88px] xl:w-[94px]';
      layerH = 'h-[114px] xl:h-[120px]';
      imgW = 'w-[88px] xl:w-[94px]';
      imgH = 'h-[114px] xl:h-[120px]';
    }

    return (
      <div className="relative w-[180px] h-[140px] flex items-center justify-center select-none pointer-events-none">
        {/* Second offset layer behind */}
        <div
          aria-hidden="true"
          className={`absolute ${layerW} ${layerH} rounded-2xl bg-[#fff3ea] shadow-md`}
          style={{
            transform: isOpen ? 'rotate(-6deg) scale(1)' : 'rotate(0deg) scale(0.6)',
            opacity: isOpen ? 1 : 0,
            transition: reducedMotion
              ? 'none'
              : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out',
          }}
        />
        {/* Front Image with rounded corners and slight tilt */}
        <img
          src={imgSrc}
          alt={imgAlt}
          aria-hidden="true"
          className={`relative z-10 ${imgW} ${imgH} object-cover rounded-2xl shadow-[0_20px_45px_-12px_rgba(0,0,0,0.8)]`}
          style={{
            transform: isOpen ? 'rotate(3deg) scale(1)' : 'rotate(10deg) scale(0.6)',
            opacity: isOpen ? 1 : 0,
            transition: reducedMotion
              ? 'none'
              : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out',
          }}
        />
      </div>
    );
  };

  return (
    <section
      id="services-section"
      aria-labelledby="services-heading"
      className="relative mx-auto max-w-[1700px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 scroll-mt-[calc(var(--header-height,4rem)+1.5rem)]"
    >
      {/* 
        Section Header:
        - Editorial scale headline in Archivo Black (native weight 400), Title Case, White & Orange
        - Left edge aligned with service titles below across 320px, 390px, and desktop
        - Static (does not animate with rows)
      */}
      <div className="mb-10 sm:mb-14 lg:mb-16 px-3.5 sm:px-5 lg:px-6 xl:px-8 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3.5 py-1 text-xs font-extrabold text-[#FF6A00] shadow-[0_0_12px_rgba(255,106,0,0.2)] mb-4 sm:mb-6">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="uppercase tracking-wider">Disciplines & Capabilities</span>
        </div>

        <AnimatedHeading
          as="h2"
          id="services-heading"
          words={[
            { text: 'Our', className: 'text-white' },
            { text: 'Services', className: 'text-[#FF6A00]' },
          ]}
          style={{
            fontFamily: "'Archivo Black', system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(3rem, 8.5vw, 8rem)',
            letterSpacing: '-0.035em',
          }}
          className="text-left tracking-[-0.035em] select-none text-balance"
        />

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl text-left">
          Tailored video editing, motion graphics, and visual design crafted with
          deliberate restraint and cinematic precision.
        </p>
      </div>

      {/* Services List (Graphix-style horizontal bars) */}
      <div className="w-full">
        {/* DESKTOP VIEW (>= lg) */}
        <ul
          aria-label="Services list"
          className="hidden lg:block list-none m-0 p-0 border-t border-[#24221f]"
        >
          {SERVICES.map((service, index) => {
            const isActive = activeDesktopIndex === index;
            const isRevealed = Boolean(revealedRows[index]);
            const delay = staggerDelays[index] ?? 0;

            return (
              /* Outer Wrapper: Drives the 500ms entrance fade & 16px slide up */
              <div
                key={`desktop-wrap-${service.id}`}
                ref={registerRowElement}
                data-row-index={index}
                onFocusCapture={() => revealRowImmediately(index)}
                className="w-full"
                style={{
                  opacity: isRevealed || prefersReducedMotion ? 1 : 0,
                  transform:
                    isRevealed || prefersReducedMotion ? 'translateY(0px)' : 'translateY(16px)',
                  transition: prefersReducedMotion
                    ? 'none'
                    : 'opacity 500ms ease-out, transform 500ms ease-out',
                  transitionDelay: prefersReducedMotion ? '0ms' : `${delay}ms`,
                }}
              >
                <li
                  tabIndex={0}
                  role="button"
                  aria-expanded={isActive}
                  aria-label={`${service.title}, ${isActive ? 'expanded' : 'collapsed'}`}
                  onMouseEnter={() => setActiveDesktopIndex(index)}
                  onFocus={() => {
                    revealRowImmediately(index);
                    setActiveDesktopIndex(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveDesktopIndex(index);
                    }
                  }}
                  className="relative isolate cursor-pointer border-b border-[#24221f] outline-none rounded-2xl select-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  style={{
                    minHeight: isActive ? '200px' : '105px',
                    opacity: isActive ? 1 : 0.45,
                    transition: prefersReducedMotion
                      ? 'none'
                      : 'min-height 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out',
                  }}
                >
                  {/* Active Background Looping Orange Gradient */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 -z-10 rounded-2xl gx-service-gradient ${
                      isActive ? 'gx-service-gradient-animate' : ''
                    }`}
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scaleY(1)' : 'scaleY(0.7)',
                      pointerEvents: 'none',
                      transition: prefersReducedMotion
                        ? 'none'
                        : 'opacity 250ms ease-out, transform 250ms ease-out',
                    }}
                  />

                  {/* Horizontal Bar Layout:
                      Left: Title (wraps naturally without touching image)
                      Center: Compact image near center with tilt & offset layer
                      Right: Short description in dark text against orange background
                      Far Right: Indicator cross (+ to ×)
                  */}
                  <div
                    className="grid grid-cols-[minmax(280px,1.35fr)_190px_minmax(250px,1fr)_36px] items-center gap-6 xl:gap-10 px-6 xl:px-8 py-5"
                    style={{
                      minHeight: isActive ? '200px' : '105px',
                      transition: prefersReducedMotion
                        ? 'none'
                        : 'min-height 250ms cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                  >
                    {/* Col 1: Title in original left position */}
                    <div className="flex items-baseline gap-3.5 xl:gap-5 min-w-0 pr-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-xl xl:text-2xl font-light select-none transition-colors"
                        style={{
                          color: isActive ? '#0a0a0a' : '#FF6A00',
                          transition: prefersReducedMotion ? 'none' : 'color 200ms ease-out',
                        }}
                      >
                        //
                      </span>
                      <h3
                        className="font-display font-bold text-2xl xl:text-[38px] leading-[1.08] tracking-tight transition-all break-words select-none"
                        style={{
                          color: isActive ? '#0a0a0a' : '#f2ede4',
                          transform: isActive ? 'translateX(8px)' : 'translateX(0px)',
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'color 200ms ease-out, transform 200ms ease-out',
                        }}
                      >
                        {service.title}
                      </h3>
                    </div>

                    {/* Col 2: Compact Image Near Center (Tilted with offset layer, only visible when open) */}
                    <div
                      className="flex items-center justify-center pointer-events-none"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'scale(1)' : 'scale(0.85)',
                        visibility: isActive ? 'visible' : 'hidden',
                        transition: prefersReducedMotion
                          ? 'none'
                          : 'opacity 200ms ease-out, transform 250ms cubic-bezier(0.25, 1, 0.5, 1), visibility 250ms',
                      }}
                    >
                      {renderServiceImage(service.imageType, isActive, prefersReducedMotion)}
                    </div>

                    {/* Col 3: Short Description Sentence in dark text against orange background */}
                    <div
                      className="max-w-md"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                        pointerEvents: isActive ? 'auto' : 'none',
                        visibility: isActive ? 'visible' : 'hidden',
                        transition: prefersReducedMotion
                          ? 'none'
                          : 'opacity 200ms ease-out, transform 250ms cubic-bezier(0.25, 1, 0.5, 1), visibility 250ms',
                      }}
                    >
                      <p className="text-sm xl:text-base leading-relaxed text-[#0a0a0a] font-medium font-sans select-text">
                        {service.description}
                      </p>
                    </div>

                    {/* Col 4: Indicator Icon (+ to ×) */}
                    <div
                      aria-hidden="true"
                      className="w-7 h-7 relative flex items-center justify-center shrink-0 select-none pointer-events-none"
                    >
                      <span
                        className="h-[1.5px] w-5 rounded-full"
                        style={{
                          backgroundColor: isActive ? '#0a0a0a' : '#f2ede4',
                          transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'transform 200ms ease-out, background-color 200ms ease-out',
                        }}
                      />
                      <span
                        className="h-[1.5px] w-5 rounded-full absolute"
                        style={{
                          backgroundColor: isActive ? '#0a0a0a' : '#f2ede4',
                          transform: isActive ? 'rotate(135deg)' : 'rotate(90deg)',
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'transform 200ms ease-out, background-color 200ms ease-out',
                        }}
                      />
                    </div>
                  </div>
                </li>
              </div>
            );
          })}
        </ul>

        {/* MOBILE VIEW (< lg: Tap-to-Expand Accordion with Stacked Image & Sentence) */}
        <div className="block lg:hidden border-t border-[#24221f]">
          {SERVICES.map((service, index) => {
            const isExpanded = mobileExpandedIndex === index;
            const isRevealed = Boolean(revealedRows[index]);
            const delay = staggerDelays[index] ?? 0;

            return (
              /* Outer Wrapper: Drives the 500ms entrance fade & 16px slide up */
              <div
                key={`mobile-wrap-${service.id}`}
                ref={registerRowElement}
                data-row-index={index}
                onFocusCapture={() => revealRowImmediately(index)}
                className="w-full"
                style={{
                  opacity: isRevealed || prefersReducedMotion ? 1 : 0,
                  transform:
                    isRevealed || prefersReducedMotion ? 'translateY(0px)' : 'translateY(16px)',
                  transition: prefersReducedMotion
                    ? 'none'
                    : 'opacity 500ms ease-out, transform 500ms ease-out',
                  transitionDelay: prefersReducedMotion ? '0ms' : `${delay}ms`,
                }}
              >
                <div
                  className={`relative border-b border-[#24221f] rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'gx-service-gradient gx-service-gradient-animate' : ''
                  }`}
                  style={{
                    opacity: isExpanded ? 1 : 0.6,
                    transition: prefersReducedMotion ? 'none' : 'opacity 200ms ease-out',
                  }}
                >
                  {/* Tap-to-Expand Button */}
                  <button
                    type="button"
                    id={`service-toggle-${service.id}`}
                    aria-expanded={isExpanded}
                    aria-controls={`service-panel-${service.id}`}
                    aria-label={`${service.title}, ${isExpanded ? 'collapse details' : 'expand details'}`}
                    onClick={() => {
                      revealRowImmediately(index);
                      setMobileExpandedIndex((prev) => (prev === index ? -1 : index));
                    }}
                    className="w-full flex items-center justify-between py-5 px-4 sm:px-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] rounded-xl select-none"
                  >
                    <div className="flex items-baseline gap-3 min-w-0 pr-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-base sm:text-lg font-light transition-colors"
                        style={{
                          color: isExpanded ? '#0a0a0a' : '#FF6A00',
                          transition: prefersReducedMotion ? 'none' : 'color 200ms ease-out',
                        }}
                      >
                        //
                      </span>
                      <h3
                        className="font-display font-bold text-xl sm:text-2xl tracking-tight transition-all break-words"
                        style={{
                          color: isExpanded ? '#0a0a0a' : '#f2ede4',
                          transform: isExpanded ? 'translateX(6px)' : 'translateX(0px)',
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'color 200ms ease-out, transform 200ms ease-out',
                        }}
                      >
                        {service.title}
                      </h3>
                    </div>

                    {/* Indicator Icon (+ to ×) */}
                    <div
                      aria-hidden="true"
                      className="w-6 h-6 relative shrink-0 flex items-center justify-center pointer-events-none"
                    >
                      <span
                        className="h-[1.5px] w-4.5 rounded-full"
                        style={{
                          backgroundColor: isExpanded ? '#0a0a0a' : '#f2ede4',
                          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'transform 200ms ease-out, background-color 200ms ease-out',
                        }}
                      />
                      <span
                        className="h-[1.5px] w-4.5 rounded-full absolute"
                        style={{
                          backgroundColor: isExpanded ? '#0a0a0a' : '#f2ede4',
                          transform: isExpanded ? 'rotate(135deg)' : 'rotate(90deg)',
                          transition: prefersReducedMotion
                            ? 'none'
                            : 'transform 200ms ease-out, background-color 200ms ease-out',
                        }}
                      />
                    </div>
                  </button>

                  {/* Stacked Image & Sentence Beneath Title on Mobile */}
                  <div
                    id={`service-panel-${service.id}`}
                    role="region"
                    aria-labelledby={`service-toggle-${service.id}`}
                    className={`grid transition-[grid-template-rows] ease-out ${
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                    style={{
                      transitionDuration: prefersReducedMotion ? '0ms' : '250ms',
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col items-center gap-4 px-4 pb-6 pt-1 text-center sm:text-left sm:flex-row sm:items-center sm:gap-6 sm:px-6">
                        {/* Compact Image */}
                        <div className="shrink-0 my-1">
                          {renderServiceImage(service.imageType, isExpanded, prefersReducedMotion)}
                        </div>

                        {/* Short sentence in dark text against orange background */}
                        <p className="text-sm sm:text-base leading-relaxed text-[#0a0a0a] font-medium font-sans max-w-sm sm:max-w-md select-text">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retainers & Custom Bundles Banner */}
      <div className="mt-12 sm:mt-16 rounded-2xl border border-white/10 border-t-white/20 bg-gradient-to-b from-[#181818] via-[#121212] to-[#0D0D0D] p-6 sm:p-10 shadow-[0_16px_36px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#FF6A00]">
              Ongoing Retainers & Packages
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Need a Dedicated Monthly Post-Production Partner?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
              We offer flexible monthly video editing retainers for creator teams, agencies, and brands requiring consistent delivery tempos, predictable turnarounds, and uncompromising brand standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => onEnquireService?.('Video & Design Package')}
              className="depth-btn-active inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-black"
            >
              <span>Discuss Retainers</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappBusinessNumber}?text=${encodeURIComponent(
                "Hello Nzy, I'd like to discuss a custom service package or editing retainer!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-[#25D366] bg-gradient-to-b from-[#1C2C20] to-[#111C14] border border-[#25D366]/40 border-t-[#25D366]/70 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(37,211,102,0.3)] hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-black transition-all"
            >
              <WhatsAppIcon className="h-4.5 w-4.5" />
              <span>Quick WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
