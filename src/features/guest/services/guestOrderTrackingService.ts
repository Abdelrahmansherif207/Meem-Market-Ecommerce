import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { GuestCancelResult, GuestTrackResult } from "../types";

/**
 * Public tracking + cancellation (contract §7–§8) — no guest cookie required.
 * Tokens travel in the POST body, never in the URL, to avoid access-log
 * leakage. Invalid / expired / revoked / foreign tokens all return 404 with
 * the same message (no existence oracle).
 */
export const guestOrderTrackingService = {
  track: (token: string, lang?: string): Promise<GuestTrackResult> =>
    apiFetch<ApiResponse<GuestTrackResult>>("/general/guest/orders/track", {
      method: "POST",
      body: JSON.stringify({ token }),
      lang,
    }).then((response) => response.data),

  cancel: (token: string, lang?: string): Promise<GuestCancelResult> =>
    apiFetch<ApiResponse<GuestCancelResult>>("/general/guest/orders/cancel", {
      method: "POST",
      body: JSON.stringify({ token }),
      lang,
    }).then((response) => response.data),
};
