/**
 * Guest checkout feature flag + backend cookie contract (§2 of the guest
 * checkout integration contract).
 *
 * The flag gates the whole guest flow: server-backed guest cart,
 * `/guest-checkout`, guest order confirmation and public tracking.
 * Default OFF — anonymous shoppers keep the legacy localStorage cart and the
 * auth-gated checkout until the flag is enabled per deployment.
 */
export const GUEST_CHECKOUT_FLAG = process.env.NEXT_PUBLIC_GUEST_CHECKOUT === "true";

export function isGuestCheckoutEnabled(): boolean {
  return GUEST_CHECKOUT_FLAG;
}

/**
 * Backend-issued guest cookies. The HttpOnly session cookie must never be
 * read or forwarded by frontend code; the CSRF cookie is the double-submit
 * token. Both are scoped to `Path=/api`, so pages under `/[locale]/...`
 * cannot see them via `document.cookie` — the CSRF value is injected into
 * proxied requests by `src/proxy.ts` (apiBridge) and mirrored into app state
 * from the session-init response as a fallback.
 *
 * Cookie NAMES are env-configurable on the backend (contract §2): this
 * deployment issues `catch_*`, the contract default is `meem_*`. The proxy
 * therefore matches the first candidate present on the request.
 */
export const GUEST_SESSION_COOKIE_CANDIDATES = [
  process.env.NEXT_PUBLIC_GUEST_SESSION_COOKIE,
  "catch_guest",
  "meem_guest",
] as const;

export const GUEST_CSRF_COOKIE_CANDIDATES = [
  process.env.NEXT_PUBLIC_GUEST_CSRF_COOKIE,
  "catch_guest_csrf",
  "meem_guest_csrf",
] as const;

export const GUEST_CSRF_HEADER = "X-CSRF-Token";
