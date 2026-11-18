/** Locale-aware formatting helpers for guest order surfaces. */

export function formatGuestDate(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatGuestDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * i18n key for a machine status. Components translate
 * `guestCheckout.status.<key>` with a generic fallback.
 */
export function guestStatusKey(status: string | null | undefined): string {
  if (!status) return "unknown";
  return status
    .toLowerCase()
    .replace(/^payment[-_]/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Badge tone shared by confirmation + tracking. */
export function guestStatusTone(status: string | null | undefined): string {
  const key = guestStatusKey(status);
  if (["cancelled", "failed", "refunded", "unpaid"].includes(key)) {
    return "bg-red-100 text-red-700";
  }
  if (["delivered", "completed", "paid", "captured", "fulfilled"].includes(key)) {
    return "bg-green-100 text-green-700";
  }
  if (["processing", "shipped", "out_for_delivery", "confirmed"].includes(key)) {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-amber-100 text-amber-700";
}

/**
 * Machine statuses with dedicated copy under `guestCheckout.status.*`.
 * Anything else is rendered raw instead of asking next-intl for a missing key.
 */
const KNOWN_GUEST_STATUSES = new Set([
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "fulfilled",
  "cancelled",
  "failed",
  "refunded",
  "paid",
  "unpaid",
  "captured",
  "unknown",
]);

export function isKnownGuestStatus(status: string | null | undefined): boolean {
  return KNOWN_GUEST_STATUSES.has(guestStatusKey(status));
}

/**
 * Accepts a raw token, a `#token=...` / `?token=...` URL, or a full tracking
 * link pasted by the shopper, and returns the token.
 */
export function parseGuestTrackingToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const hashIndex = value.indexOf("#");
  if (hashIndex >= 0) {
    const hash = value.slice(hashIndex + 1);
    const hashToken = new URLSearchParams(hash).get("token")?.trim();
    if (hashToken) return hashToken;
  }

  const queryIndex = value.indexOf("?");
  if (queryIndex >= 0) {
    const query = value.slice(queryIndex + 1).split("#")[0] ?? "";
    const queryToken = new URLSearchParams(query).get("token")?.trim();
    if (queryToken) return queryToken;
  }

  // A bare URL without a token parameter is not a token.
  if (/^https?:\/\//i.test(value) || value.includes("/track-order")) {
    return null;
  }

  return value;
}

/**
 * Reads the optional cancellation token carried by a shareable tracking link
 * (`#token=...&cancel=...`). Bare tokens are never treated as cancellation
 * tokens, so pasting a normal token can't accidentally cancel an order.
 *
 * The token stays in the URL fragment (never sent to the server) and the
 * backend still requires an OTP sent to the phone on file before cancelling.
 */
export function parseGuestCancellationToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const read = (params: string) => {
    const search = new URLSearchParams(params);
    return (
      search.get("cancel")?.trim() ||
      search.get("cancel_token")?.trim() ||
      search.get("cancellation_token")?.trim() ||
      null
    );
  };

  const hashIndex = value.indexOf("#");
  if (hashIndex >= 0) {
    const fromHash = read(value.slice(hashIndex + 1));
    if (fromHash) return fromHash;
  }

  const queryIndex = value.indexOf("?");
  if (queryIndex >= 0) {
    const fromQuery = read(value.slice(queryIndex + 1).split("#")[0] ?? "");
    if (fromQuery) return fromQuery;
  }

  return null;
}
