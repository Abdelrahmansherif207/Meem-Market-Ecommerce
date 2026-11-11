/**
 * Idempotency-Key helpers for state-changing guest calls (checkout / payment
 * initiation). One logical operation keeps one key across retries so the
 * backend replays the same result instead of duplicating work (contract §1.5).
 */
const INTENT_TTL_MS = 30 * 60 * 1000;

export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Non-crypto fallback (older browsers) — still a unique-enough opaque key.
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function storageKey(purpose: string): string {
  return `guest-idem-${purpose}`;
}

/**
 * Returns the key for `purpose`, creating one on first use. Reused by retry
 * paths within the TTL (e.g. a network failure or a 409 retry must resend the
 * SAME key). Only browser sessions have storage — server callers should
 * generate a fresh key per request.
 */
export function getOrCreateIdempotencyKey(purpose: string): string {
  if (typeof window === "undefined") return newIdempotencyKey();
  try {
    const raw = window.sessionStorage.getItem(storageKey(purpose));
    if (raw) {
      const parsed = JSON.parse(raw) as { key: string; createdAt: number };
      if (parsed?.key && Date.now() - parsed.createdAt < INTENT_TTL_MS) {
        return parsed.key;
      }
    }
    const key = newIdempotencyKey();
    window.sessionStorage.setItem(
      storageKey(purpose),
      JSON.stringify({ key, createdAt: Date.now() }),
    );
    return key;
  } catch {
    return newIdempotencyKey();
  }
}

/** Clears the intent after the operation definitively succeeded or was abandoned. */
export function clearIdempotencyKey(purpose: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(storageKey(purpose));
  } catch {}
}
