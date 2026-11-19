import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Info,
  MessageSquare,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import type { ContactEnquiryPrefill } from '../types/portfolio';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '../utils/whatsapp';

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
    <section
      aria-labelledby="contact-heading"
      className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="border-b border-white/10 pb-6">
        <h1
          id="contact-heading"
          className="font-display text-3xl font-semibold tracking-tight text-white"
        >
          Tell us about your project
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          Fill in your project details below. Submitting prepares a structured enquiry message for WhatsApp—WhatsApp opens with the message ready so you only need to press Send.
        </p>
      </div>

      {prefill?.projectTitle && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-4 py-2.5 text-xs text-white">
          <span>
            Reference selected: <strong className="font-semibold">{prefill.projectTitle}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              onClearPrefill();
              setMessage('');
            }}
            className="rounded-lg bg-[#272727] px-3 py-1.5 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
          >
            Clear reference
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-medium text-white"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1.5 h-11 w-full rounded-xl depth-input px-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="contact-service"
            className="block text-sm font-medium text-white"
          >
            Service needed
          </label>
          <select
            id="contact-service"
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl depth-input px-3.5 text-sm text-white focus:outline-none"
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
            className="block text-sm font-medium text-white"
          >
            Project message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your deliverable format, rough timeline, or any visual references..."
            className="mt-1.5 w-full rounded-xl depth-input p-3.5 text-sm leading-relaxed text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            className="depth-btn-active inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm sm:w-auto"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Continue to WhatsApp</span>
          </button>
          <p className="mt-2.5 text-xs text-white/55">
            WhatsApp opens with your prepared message prefilled—simply review and press Send in WhatsApp.
          </p>
        </div>
      </form>

      {/* Prepared WhatsApp submission feedback */}
      {submittedState && (
        <div
          role="status"
          className="mt-7 rounded-2xl depth-panel p-5"
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6A00]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {submittedState.isConfigured && submittedState.waUrl ? (
                <>
                  <h2 className="font-display text-base font-semibold text-white">
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
                      className="depth-btn-active inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm"
                    >
                      <span>Open WhatsApp</span>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="depth-btn inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-[#F1F1F1]" aria-hidden="true" />
                          <span>Copied</span>
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
                  <h2 className="font-display text-base font-semibold text-white">
                    Prototype WhatsApp notice
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    No business WhatsApp number is configured yet in <code className="font-mono text-xs text-white/90">src/config/brand.ts</code>, so no external <code className="font-mono text-xs text-white/90">wa.me</code> link was opened. Your message has been formatted and URL-encoded below ready for launch once a number is set.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#272727] px-3.5 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#FF6A00]" aria-hidden="true" />
                          <span>Copied prepared message</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy prepared message</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-white/10 bg-black p-3.5 font-mono text-xs leading-relaxed text-white/80">
                {submittedState.plainMessage}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
