import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Info,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import type { ContactEnquiryPrefill } from '../types/portfolio';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '../utils/whatsapp';
import { AnimatedHeading } from './AnimatedHeading';

interface ContactViewProps {
  prefill: ContactEnquiryPrefill | null;
  onClearPrefill: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  prefill,
  onClearPrefill,
}) => {
  const [name, setName] = useState('');
  const [service, setService] = useState<string>(BRAND_CONFIG.serviceOptions[0]);
  const [message, setMessage] = useState('');
  const [submittedState, setSubmittedState] = useState<{
    plainMessage: string;
    waUrl: string | null;
    isConfigured: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!prefill) {
      return;
    }
    if (prefill.suggestedService) {
      setService(prefill.suggestedService);
    }
    if (prefill.projectTitle) {
      setMessage(
        `I'd like to discuss a project similar to "${prefill.projectTitle}".`
      );
      setSubmittedState(null);
    }
  }, [prefill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const plainMessage = buildWhatsAppMessage({ name, service, message });
    const linkResult = buildWhatsAppUrl(
      BRAND_CONFIG.whatsappBusinessNumber,
      plainMessage
    );

    setSubmittedState({
      plainMessage,
      waUrl: linkResult.url,
      isConfigured: linkResult.isConfigured,
    });

    // If a valid business number is configured, launch WhatsApp safely via an anchor click
    if (linkResult.isConfigured && linkResult.url) {
      const anchor = document.createElement('a');
      anchor.href = linkResult.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const handleCopyMessage = async () => {
    if (!submittedState) {
      return;
    }
    try {
      await navigator.clipboard.writeText(submittedState.plainMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  return (
    <div className="w-full text-white min-h-[calc(100vh-var(--header-height,4rem)-8rem)] py-12 sm:py-16 lg:py-20">
      <section
        aria-labelledby="contact-heading"
        className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-left"
      >
        <div className="border-b border-white/10 pb-8 sm:pb-12 text-left">
          {/* Eyebrow Badge (Matching Services & Categories) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3.5 py-1 text-xs font-extrabold text-[#FF6A00] shadow-[0_0_12px_rgba(255,106,0,0.2)] mb-4 sm:mb-6">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="uppercase tracking-wider">Start A Project</span>
          </div>

          {/* Editorial Headline: Archivo Black, weight 400, editorial scale */}
          <AnimatedHeading
            as="h1"
            id="contact-heading"
            words={[
              { text: 'Contact', className: 'text-white' },
              { text: 'Us', className: 'text-[#FF6A00]' },
            ]}
            style={{
              fontFamily: "'Archivo Black', system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(2.5rem, 6.5vw, 6rem)',
              letterSpacing: '-0.035em',
            }}
            className="text-left tracking-[-0.035em] select-none text-balance"
          />

          {/* Prominent Body Text with Color Mix */}
          <p className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl font-medium leading-snug sm:leading-tight max-w-[48ch] text-left text-white text-balance">
            Tell us about your project. We'll shape the{' '}
            <span className="text-[#FF6A00]">edit</span>,{' '}
            <span className="text-[#FF6A00]">sound</span>, and{' '}
            <span className="text-[#FF6A00]">visual design</span>.
          </p>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/70 leading-relaxed max-w-xl text-left">
            Fill in your project details below to prepare a structured WhatsApp enquiry. WhatsApp opens with your message ready so you only need to press Send.
          </p>
        </div>

        {prefill?.projectTitle && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-4 py-3 text-xs sm:text-sm text-white shadow-[0_0_15px_rgba(255,106,0,0.15)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[#FF6A00]">//</span>
              <span className="truncate">
                Reference selected:{' '}
                <strong className="font-bold text-white">{prefill.projectTitle}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClearPrefill();
                setMessage('');
              }}
              className="shrink-0 rounded-lg bg-[#222222] px-3 py-1.5 text-xs font-semibold text-[#F1F1F1] border border-white/10 hover:bg-[#333333] hover:text-[#FF6A00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]"
            >
              Clear reference
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="contact-name"
              className="flex items-center gap-1.5 text-sm font-bold text-white"
            >
              <span className="font-mono text-xs text-[#FF6A00]">//</span>
              <span>Name</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or company"
              className="mt-2 h-12 w-full rounded-xl depth-input px-4 text-sm sm:text-base text-white placeholder:text-white/40 border border-white/10 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00] outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="contact-service"
              className="flex items-center gap-1.5 text-sm font-bold text-white"
            >
              <span className="font-mono text-xs text-[#FF6A00]">//</span>
              <span>Service needed</span>
            </label>
            <select
              id="contact-service"
              name="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl depth-input px-4 text-sm sm:text-base text-white border border-white/10 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00] outline-none transition-all"
            >
              {BRAND_CONFIG.serviceOptions.map((option) => (
                <option key={option} value={option} className="bg-[#111111] text-white">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="flex items-center gap-1.5 text-sm font-bold text-white"
            >
              <span className="font-mono text-xs text-[#FF6A00]">//</span>
              <span>Project message</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your deliverable format, rough timeline, or any visual references..."
              className="mt-2 w-full rounded-xl depth-input p-4 text-sm sm:text-base leading-relaxed text-white placeholder:text-white/40 border border-white/10 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00] outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="depth-btn-active inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl px-7 text-sm sm:text-base font-extrabold text-black bg-gradient-to-b from-[#FF7A1A] to-[#FF6A00] border border-[#FF8A33] border-t-white/40 shadow-[0_4px_14px_rgba(255,106,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,106,0,0.55)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] sm:w-auto"
            >
              <MessageSquare className="h-4.5 w-4.5" aria-hidden="true" />
              <span>Continue to WhatsApp</span>
            </button>
            <p className="mt-3 text-xs sm:text-sm text-white/55">
              WhatsApp opens with your prepared message prefilled—simply review and press Send in WhatsApp.
            </p>
          </div>
        </form>

        {/* Prepared WhatsApp submission feedback */}
        {submittedState && (
          <div
            role="status"
            className="mt-8 rounded-2xl depth-panel p-5 sm:p-6 border border-[#FF6A00]/30 shadow-[0_0_20px_rgba(255,106,0,0.1)]"
          >
            <div className="flex items-start gap-3.5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6A00]" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {submittedState.isConfigured && submittedState.waUrl ? (
                  <>
                    <h2 className="font-display text-base sm:text-lg font-bold text-white">
                      WhatsApp message ready
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      WhatsApp should open with your prepared enquiry below. Press Send inside WhatsApp to deliver your message.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={submittedState.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="depth-btn-active inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-extrabold text-black bg-gradient-to-b from-[#FF7A1A] to-[#FF6A00] border border-[#FF8A33] border-t-white/40 shadow-[0_4px_14px_rgba(255,106,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,106,0,0.55)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]"
                      >
                        <span>Open WhatsApp</span>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="depth-btn inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-white hover:border-[#FF6A00]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-[#FF6A00]" aria-hidden="true" />
                            <span className="text-[#FF6A00] font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" aria-hidden="true" />
                            <span>Copy message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-base sm:text-lg font-bold text-white">
                      Prototype WhatsApp notice
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      No business WhatsApp number is configured yet in <code className="font-mono text-xs text-[#FF6A00]">src/config/brand.ts</code>, so no external <code className="font-mono text-xs text-[#FF6A00]">wa.me</code> link was opened. Your message has been formatted and URL-encoded below ready for launch once a number is set.
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#222222] border border-white/10 px-4 text-xs sm:text-sm font-medium text-[#F1F1F1] hover:border-[#FF6A00]/40 hover:text-[#FF6A00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-[#FF6A00]" aria-hidden="true" />
                            <span className="text-[#FF6A00] font-semibold">Copied prepared message</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" aria-hidden="true" />
                            <span>Copy prepared message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black p-4 font-mono text-xs leading-relaxed text-white/80">
                  {submittedState.plainMessage}
                </pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
