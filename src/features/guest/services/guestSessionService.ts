import type { ApiResponse } from "@/shared/types";
import type { GuestSessionData } from "../types";
import { guestFetch } from "./guestFetch";

/**
 * Guest session lifecycle (contract §3).
 *
 * `init` takes no body and no CSRF; it is idempotent — re-calling with a
 * valid cookie returns the current expiry (and the CSRF token again), so the
 * frontend can safely call it on every mount / after a refresh. `revoke`
 * needs the CSRF header, which the proxy or `guestFetch` injects.
 */
export const guestSessionService = {
  init: (lang?: string): Promise<ApiResponse<GuestSessionData>> =>
    guestFetch<ApiResponse<GuestSessionData>>("/general/guest/session", {
      method: "POST",
      body: "{}",
      lang,
    }),

  revoke: (lang?: string): Promise<ApiResponse<unknown>> =>
    guestFetch<ApiResponse<unknown>>("/general/guest/session", {
      method: "DELETE",
      lang,
    }),
};
