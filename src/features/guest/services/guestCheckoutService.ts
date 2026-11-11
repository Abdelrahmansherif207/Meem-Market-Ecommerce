import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type {
  GuestCheckoutRequest,
  GuestCheckoutResult,
  GuestOrder,
  GuestOrderTokensResult,
  GuestPaymentMethod,
  GuestPaymentResult,
} from "../types";

const BASE = "/general/guest";

/**
 * Guest checkout / order access (contract §5–§6).
 *
 * `checkout` and `initiatePayment` must carry an `Idempotency-Key` — the
 * caller generates/reuses it via `utils/idempotency`. CSRF is injected by
 * `src/proxy.ts`. `getOrder` is cookie-owned (confirmation page); access
 * tokens can be re-issued for the owning browser when the raw tokens were
 * lost after a refresh.
 */
export const guestCheckoutService = {
  checkout: (
    payload: GuestCheckoutRequest,
    idempotencyKey: string,
    lang?: string,
  ): Promise<GuestCheckoutResult> =>
    apiFetch<ApiResponse<GuestCheckoutResult>>(`${BASE}/checkout`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": idempotencyKey },
      lang,
    }).then((response) => response.data),

  initiatePayment: (
    orderId: number,
    payment: { payment_method: GuestPaymentMethod; gateway?: string },
    idempotencyKey: string,
    lang?: string,
  ): Promise<GuestPaymentResult> =>
    apiFetch<ApiResponse<GuestPaymentResult>>(
      `${BASE}/orders/${orderId}/payment`,
      {
        method: "POST",
        body: JSON.stringify(payment),
        headers: { "Idempotency-Key": idempotencyKey },
        lang,
      },
    ).then((response) => response.data),

  /** Cookie-owned order fetch for the confirmation page. */
  getOrder: (
    orderId: number,
    lang?: string,
  ): Promise<{ order: GuestOrder; can_cancel: boolean }> =>
    apiFetch<ApiResponse<{ order: GuestOrder; can_cancel: boolean }>>(
      `${BASE}/orders/${orderId}`,
      { lang },
    ).then((response) => response.data),

  /** Re-issues public tokens for the owning browser (contract §5). */
  issueAccessTokens: (
    orderId: number,
    lang?: string,
  ): Promise<GuestOrderTokensResult> =>
    apiFetch<ApiResponse<GuestOrderTokensResult>>(
      `${BASE}/orders/${orderId}/access-tokens`,
      { method: "POST", lang },
    ).then((response) => response.data),
};
