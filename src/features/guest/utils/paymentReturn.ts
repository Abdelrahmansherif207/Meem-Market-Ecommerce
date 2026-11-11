/**
 * Guest variant of the payment-return note (see
 * `features/checkout/utils/paymentReturn`). Recorded right before the browser
 * is redirected to the payment provider; consumed when the user comes back so
 * the checkout island can route to the guest order confirmation instead of
 * re-rendering the form.
 */
const STORAGE_KEY = "guest_online_payment_return";
const TTL_MS = 30 * 60 * 1000;

export interface GuestPaymentReturnNote {
  orderId: number;
  createdAt: number;
}

export function saveGuestPaymentReturnNote(orderId: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ orderId, createdAt: Date.now() }),
    );
  } catch {}
}

export function peekGuestPaymentReturnNote(): GuestPaymentReturnNote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuestPaymentReturnNote> | null;
    if (!parsed || typeof parsed.orderId !== "number" || typeof parsed.createdAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.createdAt > TTL_MS) return null;
    return { orderId: parsed.orderId, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function consumeGuestPaymentReturnNote(): GuestPaymentReturnNote | null {
  const note = peekGuestPaymentReturnNote();
  if (note) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return note;
}
