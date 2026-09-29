import { ApiError } from "@/shared/lib/api";

type Translate = (key: string) => string;

export function mapCheckoutError(error: unknown, t: Translate): string {
  if (error instanceof ApiError) {
    const message = error.message ?? "";

    if (error.status === 401) return t("errors.sessionExpired");
    if (error.status === 429) return t("errors.tooManyAttempts");
    if (error.status >= 500) return t("errorProcessing");
    if (message === "Cart not found") return t("errors.cartNotFound");
    if (message === "Payment gateway is unavailable") return t("errors.gatewayUnavailable");
    if (message.includes("does not support the selected currency")) return t("errors.gatewayCurrency");
    if (message.includes("promotion is not eligible")) return t("errors.promotionNotEligible");

    if (!message || message.startsWith("API Error") || message.startsWith("Request failed")) {
      return t("errorProcessing");
    }
    return message;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || /fetch|network|load failed/i.test(error.message)) {
      return t("errors.network");
    }
  }

  return t("errorProcessing");
}
