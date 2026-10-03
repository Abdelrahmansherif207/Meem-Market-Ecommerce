const STORAGE_KEY = "checkout_online_payment_return";
const TTL_MS = 30 * 60 * 1000;

export interface PaymentReturnNote {
  orderId?: number;
  createdAt: number;
}

export function savePaymentReturnNote(orderId?: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ orderId, createdAt: Date.now() }),
    );
  } catch {}
}

export function peekPaymentReturnNote(): PaymentReturnNote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PaymentReturnNote> | null;
    if (!parsed || typeof parsed.createdAt !== "number") return null;
    if (Date.now() - parsed.createdAt > TTL_MS) return null;
    const orderId =
      typeof parsed.orderId === "number" && parsed.orderId > 0
        ? parsed.orderId
        : undefined;
    return { orderId, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function consumePaymentReturnNote(): PaymentReturnNote | null {
  const note = peekPaymentReturnNote();
  if (note || hasRawNote()) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return note;
}

function hasRawNote(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
