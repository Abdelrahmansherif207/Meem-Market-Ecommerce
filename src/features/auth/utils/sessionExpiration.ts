export const AUTH_EXPIRY_BUFFER_MS = 15_000;
export const MAX_TIMEOUT_MS = 2_147_000_000;

/** Normalizes API timestamps with microseconds for consistent browser parsing. */
export function parseSessionExpiry(expiresAt: string | null | undefined): number | null {
  if (!expiresAt?.trim()) return null;

  const normalized = expiresAt
    .trim()
    .replace(/\.(\d{3})\d*(?=Z$|[+-]\d{2}:?\d{2}$)/, ".$1");
  const timestamp = Date.parse(normalized);

  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getSessionInvalidationTime(
  expiresAt: string | null | undefined,
): number | null {
  const expiryTime = parseSessionExpiry(expiresAt);
  return expiryTime === null ? null : expiryTime - AUTH_EXPIRY_BUFFER_MS;
}

export function isSessionActive(
  expiresAt: string | null | undefined,
  now = Date.now(),
): boolean {
  const invalidationTime = getSessionInvalidationTime(expiresAt);
  return invalidationTime !== null && now < invalidationTime;
}
