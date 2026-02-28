'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const CONSENT_COOKIE = 'noseblind_cookie_consent';
const CONSENT_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function getConsentCookie(): 'accepted' | 'declined' | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
  if (!match) return null;
  const val = decodeURIComponent(match[1]);
  return val === 'accepted' || val === 'declined' ? val : null;
}

export function setConsentCookie(value: 'accepted' | 'declined') {
  document.cookie = `${CONSENT_COOKIE}=${value}; max-age=${CONSENT_MAX_AGE}; path=/; SameSite=Lax`;
}

export function clearConsentCookie() {
  document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=/;`;
}

export default function CookieConsentBanner({ nonce }: { nonce?: string }) {
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null);
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const stored = getConsentCookie();
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored);
    } else {
      setVisible(true);
      // Double RAF ensures the translate-y-full starting position is painted
      // before we transition to translate-y-0 (slide-up effect)
      requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    }
  }, []);

  function dismiss(value: 'accepted' | 'declined') {
    setConsentCookie(value);
    setConsent(value);
    setEntered(false); // trigger slide-down exit
    setTimeout(() => setVisible(false), 300);
  }

  function handleDecline() {
    dismiss('declined');
    // Delete any GA cookies already set from a previous session
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith('_ga') || name === '_gid') {
        document.cookie = `${name}=; max-age=0; path=/;`;
        document.cookie = `${name}=; max-age=0; path=/; domain=.${location.hostname}`;
      }
    });
  }

  return (
    <>
      {/* Load GA4 only after explicit consent.
          Initialization runs in onLoad — a JS event handler callback, not a <script> element.
          Event handler callbacks are not subject to script-src CSP restrictions,
          so there is no nonce/inline-script conflict. */}
      {consent === 'accepted' && GA_ID && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
          nonce={nonce}
          onLoad={() => {
            type GtagWindow = Window & { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
            const w = window as unknown as GtagWindow;
            w.dataLayer = w.dataLayer || [];
            w.gtag = function gtag(...args: unknown[]) { w.dataLayer.push(args); };
            w.gtag('js', new Date());
            w.gtag('config', GA_ID);
          }}
        />
      )}

      {/* Banner — slides down on enter, slides up on dismiss */}
      {visible && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 transition-transform duration-300 ease-out ${
            entered ? 'translate-y-0' : '-translate-y-full'
          }`}
          role="dialog"
          aria-label="Cookie consent"
          aria-modal="false"
        >
          <div className="max-w-xl mx-auto bg-white border border-secondary/20 rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] p-5">
            <p className="font-display text-base font-semibold text-primary mb-1">
              Cookie notice 🍪
            </p>
            <p className="text-sm text-primary/60 leading-relaxed">
              This site uses cookies to understand how visitors interact with content.
              No personal data is sold or used for advertising.{' '}
              <Link
                href="/privacy"
                className="text-secondary underline hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
            {/* Equal visual weight on both buttons — required for GDPR dark pattern compliance */}
            <div className="flex items-center gap-3 mt-4 justify-end">
              <button
                onClick={handleDecline}
                className="px-5 py-2 text-sm font-medium text-primary border border-primary/30 hover:border-primary/70 hover:bg-primary/5 rounded-full transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => dismiss('accepted')}
                className="px-5 py-2 text-sm font-medium text-primary border border-primary/30 hover:border-primary/70 bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
