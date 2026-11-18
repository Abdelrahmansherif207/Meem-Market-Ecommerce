import { GUEST_CSRF_HEADER } from "@/shared/constants/guestCheckout";
import { apiFetch, type ApiFetchOptions } from "@/shared/lib/api";
import { useGuestSessionStore } from "../store/useGuestSessionStore";

/**
 * Guest API wrapper.
 *
 * The proxy injects `X-CSRF-Token` from the guest CSRF cookie for proxied
 * requests. As a fallback, mirror the in-memory token from the session-init
 * response into the header too. A stale token surfaces as 419 and is healed
 * by `runWithGuestSession`.
 */
export function guestFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const csrfToken = useGuestSessionStore.getState().csrfToken;
  const headers = new Headers(options.headers);
  if (csrfToken && !headers.has(GUEST_CSRF_HEADER)) {
    headers.set(GUEST_CSRF_HEADER, csrfToken);
  }
  return apiFetch<T>(endpoint, { ...options, headers });
}
