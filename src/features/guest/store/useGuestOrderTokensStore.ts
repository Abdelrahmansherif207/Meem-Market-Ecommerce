/**
 * Client-side storage for the raw tracking / cancellation tokens returned
 * once by guest checkout. The backend keeps hashes only — these raw values
 * exist solely in this browser. `sessionStorage` is the primary home (per the
 * integration guide) so they disappear when the tab closes; `localStorage`
 * is read as a migration fallback for tokens saved by older builds.
 *
 * They leave the client only in tracking/cancel request bodies, or when the
 * user explicitly copies a shareable tracking link.
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

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const session = window.sessionStorage.getItem(key);
    if (session) return session;
    // Migrate tokens written by previous builds.
    const legacy = window.localStorage.getItem(key);
    if (legacy) {
      window.sessionStorage.setItem(key, legacy);
      window.localStorage.removeItem(key);
      return legacy;
    }
  } catch {}
  return null;
}

function storageKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys = new Set<string>();
  try {
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith(`${PREFIX}:`)) keys.add(key);
    }
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(`${PREFIX}:`)) keys.add(key);
    }
  } catch {}
  return [...keys];
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

export function getGuestOrderTokens(orderId: number): GuestOrderTokens | null {
  return readTokens(readRaw(keyFor(orderId)));
}

/** Finds stored tokens by order number (tracking page has no order id). */
export function findGuestOrderTokensByNumber(
  orderNumber: string,
): GuestOrderTokens | null {
  for (const key of storageKeys()) {
    const parsed = readTokens(readRaw(key));
    if (parsed?.orderNumber === orderNumber) return parsed;
  }
  return null;
}

/** Most recent tracking token, used to prefill the tracking page. */
export function findLatestGuestTrackingToken(): string | null {
  let latest: GuestOrderTokens | null = null;
  for (const key of storageKeys()) {
    const parsed = readTokens(readRaw(key));
    if (!parsed?.trackingToken) continue;
    if (!latest || parsed.savedAt > latest.savedAt) latest = parsed;
  }
  return latest?.trackingToken ?? null;
}

export function clearGuestOrderTokens(orderId: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(keyFor(orderId));
    window.localStorage.removeItem(keyFor(orderId));
  } catch {}
}
