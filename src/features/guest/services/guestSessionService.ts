import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { GuestSessionData } from "../types";

/**
 * Guest session lifecycle (contract §3).
 *
 * `init` takes no body and no CSRF; it is idempotent — re-calling with a
 * valid cookie returns the current expiry (and the CSRF token again), so the
 * frontend can safely call it on every mount / after a refresh. `revoke`
 * needs the CSRF header, which `src/proxy.ts` injects server-side.
 */
export const guestSessionService = {
  init: (lang?: string): Promise<ApiResponse<GuestSessionData>> =>
    apiFetch<ApiResponse<GuestSessionData>>("/general/guest/session", {
      method: "POST",
      body: "{}",
      lang,
    }),

  revoke: (lang?: string): Promise<ApiResponse<unknown>> =>
    apiFetch<ApiResponse<unknown>>("/general/guest/session", {
      method: "DELETE",
      lang,
    }),
};
