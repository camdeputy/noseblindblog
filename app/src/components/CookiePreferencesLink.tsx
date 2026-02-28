'use client';

import { clearConsentCookie } from '@/components/CookieConsentBanner';

export default function CookiePreferencesLink() {
  function handleClick() {
    clearConsentCookie();
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs text-primary/40 hover:text-primary/70 transition-colors"
    >
      Cookie Preferences
    </button>
  );
}
