/**
 * Typed access to the GTM `window.dataLayer`.
 *
 * Everything the storefront reports goes through GTM (no gtag.js), so the
 * data layer is the single integration point. Every push is wrapped — an
 * analytics failure must never break shopping or checkout.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Push a GTM event. No-op during SSR and when the data layer is unavailable. */
export function pushDataLayer(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(event);
  } catch {
    // Swallow — analytics must never throw into feature code.
  }
}

/** True once the GTM bootstrap script has been rendered client-side. */
export function isGtmEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(process.env.NEXT_PUBLIC_GTM_ID);
}
