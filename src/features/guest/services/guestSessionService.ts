import type { ApiResponse } from "@/shared/types";
import { GUEST_SESSION } from "../lib/endpoints";
import { normalizeGuestSession } from "../lib/contract";
import type { GuestSessionData } from "../types";
import { guestFetch } from "./guestFetch";

/**
 * Guest session lifecycle.
 *
 * `init` takes no body and no CSRF; it is idempotent — re-calling with a
 * valid cookie returns the current expiry (and the CSRF token again), so the
 * frontend can safely call it on every mount / after a refresh.
 */
export const guestSessionService = {
  init: (lang?: string): Promise<GuestSessionData> =>
    guestFetch<ApiResponse<unknown>>(GUEST_SESSION, {
      method: "POST",
      body: "{}",
      lang,
    }).then((response) => normalizeGuestSession(response.data)),
};
