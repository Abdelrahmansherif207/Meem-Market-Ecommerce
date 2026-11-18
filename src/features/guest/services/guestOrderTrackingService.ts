import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import {
  GUEST_CANCEL,
  GUEST_CANCEL_REQUEST_OTP,
  GUEST_TRACK,
} from "../lib/endpoints";
import {
  normalizeGuestCancel,
  normalizeGuestCancelOtp,
  normalizeGuestTrack,
} from "../lib/contract";
import type {
  GuestCancelOtpPayload,
  GuestCancelOtpResult,
  GuestCancelResult,
  GuestTrackResult,
} from "../types";

/**
 * Public tracking + cancellation — no guest cookie required. Tokens travel in
 * the POST body. Shareable links keep them in the URL hash, which browsers
 * never send to the server. Invalid / expired / revoked / foreign tokens all
 * return 404 with the same message (no existence oracle).
 *
 * Cancellation is a two-step OTP flow: `requestCancelOtp` texts a code to the
 * phone on file, then `cancel` verifies it. The cancellation token alone is
 * no longer sufficient.
 */
export const guestOrderTrackingService = {
  track: (token: string, lang?: string): Promise<GuestTrackResult> =>
    apiFetch<ApiResponse<unknown>>(GUEST_TRACK, {
      method: "POST",
      body: JSON.stringify({ token }),
      lang,
    }).then((response) => normalizeGuestTrack(response.data)),

  requestCancelOtp: (
    token: string,
    lang?: string,
    phoneNumber?: string,
  ): Promise<GuestCancelOtpResult> =>
    apiFetch<ApiResponse<unknown>>(GUEST_CANCEL_REQUEST_OTP, {
      method: "POST",
      body: JSON.stringify({
        token,
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
      }),
      lang,
    }).then((response) => normalizeGuestCancelOtp(response.data)),

  cancel: (
    payload: GuestCancelOtpPayload,
    lang?: string,
  ): Promise<GuestCancelResult> =>
    apiFetch<ApiResponse<unknown>>(GUEST_CANCEL, {
      method: "POST",
      body: JSON.stringify({
        token: payload.token,
        code: payload.code,
        ...(payload.otpId ? { otp_id: payload.otpId } : {}),
      }),
      lang,
    }).then((response) => normalizeGuestCancel(response.data)),
};
