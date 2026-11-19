import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onGoToContact: () => void;
}

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Brief',
    description:
      'We align on goals, target channels, visual references, and delivery specifications before cutting a frame or setting a grid.',
  },
  {
    number: '02',
    title: 'Create',
    description:
      'We assemble the narrative edit, motion timing, or graphic identity system with clear structure and deliberate visual restraint.',
  },
  {
    number: '03',
    title: 'Refine',
    description:
      'Structured review rounds focus on pacing, sound balance, color continuity, and typographic precision.',
  },
  {
    number: '04',
    title: 'Deliver',
    description:
      'Final masters are exported in platform-ready codecs, aspect ratios, or press-verified print and digital design packages.',
  },
];

export const AboutView: React.FC<AboutViewProps> = ({ onGoToContact }) => {
  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
    >
      {/* Short brand introduction */}
      <div className="border-b border-white/10 pb-8">
        <h1
          id="about-heading"
          className="font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl"
        >
          Sharp editing and disciplined visual design for modern releases.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
          Nzy is a creative studio focused on video editing and graphic design. We work with brands, musicians, and independent teams to turn raw footage and ideas into clear, watchable films and cohesive visual systems.
        </p>
      </div>

      {/* Services: Video Editing & Graphic Design */}
      <div className="grid grid-cols-1 gap-6 border-b border-white/10 py-8 md:grid-cols-2">
        <div className="depth-panel rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Video Editing Services
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Rhythmic offline and online editing tailored to the platform and pace each story demands.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>Commercial and product launch edits</li>
            <li>Vertical social media reels and campaign cutdowns</li>
            <li>Music videos and live performance films</li>
            <li>Corporate profiles, interviews, and motion graphics</li>
          </ul>
        </div>

        <div className="depth-panel rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            Graphic Design Services
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Clean typographic systems and print-ready visual assets built to sit comfortably alongside moving image.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>Visual identity marks and stationery systems</li>
            <li>Campaign posters, cover art, and key visuals</li>
            <li>Packaging layouts and editorial lookbooks</li>
            <li>Broadcast title cards and social visual templates</li>
          </ul>
        </div>
      </div>

      {/* Process: Brief, Create, Refine, Deliver */}
      <div className="py-8">
        <h2 className="font-display text-xl font-semibold text-white">
          How we work
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="depth-card rounded-xl p-5"
            >
              <span className="font-mono tabular-nums text-xs font-bold text-[#FF6A00]">
                {step.number}
              </span>
              <h3 className="font-display mt-2 text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-2 flex flex-col items-start justify-between gap-4 rounded-2xl depth-panel p-6 sm:flex-row sm:items-center sm:p-7">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Ready to scope an upcoming edit or design project?
          </h2>
          <p className="mt-1 text-sm text-white/65">
            Share a short brief and continue directly to WhatsApp.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToContact}
          className="depth-btn-active inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm"
        >
          <span>Contact Us</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
