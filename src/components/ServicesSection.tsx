import React from 'react';
import {
  Boxes,
  Building2,
  CheckCircle2,
  Palette,
  Smartphone,
  Sparkles,
  Tv,
  Music,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

interface ServicesSectionProps {
  onSelectCategory: (categoryId: string) => void;
  onEnquireService: (serviceName: string) => void;
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

interface ServiceItem {
  id: string;
  title: string;
  tag: string;
  categoryId: string;
  prefillName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  deliverables: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: 'commercials',
    title: 'Commercials & Brand Films',
    tag: 'Commercial',
    categoryId: 'cat-commercials',
    prefillName: 'Commercial / Brand Film',
    icon: Tv,
    description:
      'High-impact editorial storytelling, product reveals, and cinematic brand launch films engineered to command viewer attention and inspire customer action.',
    deliverables: [
      'High-impact pacing & narrative rhythm',
      'Precision sound design & audio mastering',
      'Cinematic color grading (Rec.709 & HDR)',
      'Broadcast-spec delivery & multi-aspect exports',
    ],
  },
  {
    id: 'social-reels',
    title: 'Social Media Reels & Shorts',
    tag: 'Short-Form',
    categoryId: 'cat-reels',
    prefillName: 'Social Media Reels',
    icon: Smartphone,
    description:
      'Fast-paced, hook-driven 9:16 vertical edits optimized for Instagram Reels, TikTok, and YouTube Shorts to maximize viewer retention and engagement.',
    deliverables: [
      'Hook-driven opening 3-second pacing',
      'Kinetic typography & dynamic captions',
      'Beat-synced speed ramps & camera punch-ins',
      'High-volume campaign cutdown packages',
    ],
  },
  {
    id: 'music-videos',
    title: 'Music Videos & Live Visuals',
    tag: 'Music',
    categoryId: 'cat-music',
    prefillName: 'Music Video',
    icon: Music,
    description:
      'Atmospheric, rhythm-driven music videos, studio session documentaries, and performance visuals that elevate the musical identity of recording artists.',
    deliverables: [
      'Multi-camera performance synchronization',
      'Stylized cinematic palettes & analog film emulation',
      'Creative transition motifs & rhythmic cuts',
      'Widescreen 4K mastering with lossless audio',
    ],
  },
  {
    id: 'corporate-videos',
    title: 'Corporate Videos & Profiles',
    tag: 'Enterprise',
    categoryId: 'cat-corporate',
    prefillName: 'Corporate Video',
    icon: Building2,
    description:
      'Refined documentary-style corporate films, investor showcases, customer case studies, and executive interviews with disciplined visual structure.',
    deliverables: [
      'Clear narrative flow & polished dialogue cutting',
      'Acoustic voice enhancement & noise reduction',
      'Branded lower-thirds & informational graphics',
      'Internal and external multi-channel exports',
    ],
  },
  {
    id: 'motion-graphics',
    title: 'Motion Graphics & 3D Visuals',
    tag: 'Motion & VFX',
    categoryId: 'cat-motion',
    prefillName: 'Motion Graphics',
    icon: Boxes,
    description:
      'Title sequences, kinetic typography, 3D product animations, and visual effects that bring still assets to life with smooth, deliberate movement.',
    deliverables: [
      'Custom title sequences & animated intro stings',
      'Logo animations & brand motion guidelines',
      '2D/3D visual effects & seamless compositing',
      'Product feature highlights & animated diagrams',
    ],
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design & Brand Identity',
    tag: 'Identity & Print',
    categoryId: 'cat-design',
    prefillName: 'Graphic Design',
    icon: Palette,
    description:
      'Comprehensive visual identity marks, typography guidelines, album artwork, campaign key visuals, and press-ready structural packaging systems.',
    deliverables: [
      'Visual identity systems & complete brand kits',
      'Campaign posters, album art & digital covers',
      'Packaging layouts & press-verified print files',
      'Social media graphics & editorial templates',
    ],
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectCategory,
  onEnquireService,
}) => {
  return (
    <section
      id="services-section"
      aria-labelledby="services-heading"
      className="relative mx-auto max-w-[1700px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 scroll-mt-[calc(var(--header-height,4rem)+1.5rem)]"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3.5 py-1 text-xs font-extrabold text-[#FF6A00] shadow-[0_0_12px_rgba(255,106,0,0.2)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="uppercase tracking-wider">Disciplines & Capabilities</span>
        </div>

        <h2
          id="services-heading"
          className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          Our Services
        </h2>

        <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl text-balance">
          Tailored video editing, motion graphics, and visual design crafted with
          deliberate restraint and cinematic precision.
        </p>
      </div>

      {/* Services Grid (6 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="depth-card group relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-200"
            >
              {/* Card Header & Content */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#262626] to-[#141414] border border-white/10 border-t-white/25 text-[#FF6A00] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(255,106,0,0.35)] transition-all duration-200">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {service.tag}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-white mt-5 transition-colors duration-180 group-hover:text-[#FF7A1A]">
                  {service.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-white/70">
                  {service.description}
                </p>

                {/* Key Deliverables */}
                <div className="mt-6 border-t border-white/10 pt-5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 mb-3">
                    What We Deliver
                  </h4>
                  <ul className="space-y-2">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-xs text-white/85"
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-[#FF6A00] mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectCategory(service.categoryId)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors group/btn py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <span>View Projects</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-180 group-hover/btn:translate-x-1 text-[#FF6A00]"
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onEnquireService(service.prefillName)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-b from-[#FF7A1A] to-[#FF6A00] border border-[#FF8A33] border-t-white/40 shadow-[0_2px_8px_rgba(255,106,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(255,106,0,0.5)] active:translate-y-0 transition-all"
                >
                  <span>Enquire</span>
                </button>
              </div>
            </div>
          );
        })}
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
              onClick={() => onEnquireService('Video & Design Package')}
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
