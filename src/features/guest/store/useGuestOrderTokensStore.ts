/**
 * Client-side storage for the raw tracking / cancellation tokens returned
 * once by guest checkout (contract §5). The backend keeps hashes only — these
 * raw values exist solely in this browser, so `sessionStorage` is the right
 * home: they survive page refreshes within the tab but are not shared across
 * devices and never leave the client except in tracking/cancel request bodies.
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

export function saveGuestOrderTokens(
  tokens: Omit<GuestOrderTokens, "savedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
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
    const raw = window.sessionStorage.getItem(keyFor(orderId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestOrderTokens;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed;
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
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (!key || !key.startsWith(`${PREFIX}:`)) continue;
      const raw = window.sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as GuestOrderTokens;
      if (parsed?.orderNumber === orderNumber) return parsed;
    }
  } catch {}
  return null;
}

export function clearGuestOrderTokens(orderId: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(keyFor(orderId));
  } catch {}
}
