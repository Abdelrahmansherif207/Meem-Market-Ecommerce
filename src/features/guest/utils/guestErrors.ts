import { ApiError } from "@/shared/lib/api";
import { useGuestSessionStore } from "../store/useGuestSessionStore";

/**
 * Runs a guest mutation with the documented self-healing retry: a `401`
 * (no/revoked session) or `419` (CSRF mismatch) means the browser's guest
 * identity needs (re)issuing — re-run `POST /guest/session` once and retry
 * the same call. Any other error is passed through untouched.
 */
export async function runWithGuestSession<T>(
  locale: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const recoverable =
      error instanceof ApiError && (error.status === 401 || error.status === 419);
    if (!recoverable) throw error;

    useGuestSessionStore.getState().reset();
    await useGuestSessionStore.getState().ensureSession(locale);
    return operation();
  }
}

/** True when the error is the backend's "too many requests" response. */
export function isRateLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}
