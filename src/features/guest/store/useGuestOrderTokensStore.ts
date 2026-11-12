/**
 * Client-side storage for the raw tracking / cancellation tokens returned
 * once by guest checkout (contract §5). The backend keeps hashes only — these
 * raw values exist solely in this browser, so `localStorage` is the right
 * home: they survive page refreshes and closing the tab, stay scoped to this
 * origin, and are never shared across devices. They leave the client only in
 * tracking/cancel request bodies, or when the user explicitly copies a
 * shareable tracking link.
 */
const PREFIX = "guest-order-tokens";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // tracking validity window (+30 days)

export interface GuestOrderTokens {
  orderId: number;
  orderNumber: string;
  trackingToken: string | null;
  cancellationToken: string | null;
  savedAt: number;
}

function keyFor(orderId: number): string {
  return `${PREFIX}:${orderId}`;
}

function readTokens(raw: string | null): GuestOrderTokens | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GuestOrderTokens;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGuestOrderTokens(
  tokens: Omit<GuestOrderTokens, "savedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      keyFor(tokens.orderId),
      JSON.stringify({ ...tokens, savedAt: Date.now() }),
    );
  } catch {}
}

export function getGuestOrderTokens(
  orderId: number,
): GuestOrderTokens | null {
  if (typeof window === "undefined") return null;
  try {
    return readTokens(window.localStorage.getItem(keyFor(orderId)));
  } catch {
    return null;
  }
}

/** Finds stored tokens by order number (tracking page has no order id). */
export function findGuestOrderTokensByNumber(
  orderNumber: string,
): GuestOrderTokens | null {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(`${PREFIX}:`)) continue;
      const parsed = readTokens(window.localStorage.getItem(key));
      if (parsed?.orderNumber === orderNumber) return parsed;
    }
  } catch {}
  return null;
}

/** Most recent tracking token, used to prefill the tracking page. */
export function findLatestGuestTrackingToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let latest: GuestOrderTokens | null = null;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(`${PREFIX}:`)) continue;
      const parsed = readTokens(window.localStorage.getItem(key));
      if (!parsed?.trackingToken) continue;
      if (!latest || parsed.savedAt > latest.savedAt) latest = parsed;
    }
    return latest?.trackingToken ?? null;
  } catch {}
  return null;
}

export function clearGuestOrderTokens(orderId: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(keyFor(orderId));
  } catch {}
}
