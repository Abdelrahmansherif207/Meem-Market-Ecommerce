"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { consumeGuestPaymentReturnNote } from "../utils/paymentReturn";

interface GuestPaymentReturnProps {
  /** `order_id` from the gateway return URL, when present. */
  orderId?: string;
  outcome: "success" | "failed";
}

type Resolution = "resolving" | "redirecting" | "missing";

/**
 * Guest gateway return.
 *
 * Payment providers redirect to /payment/success|failed. Guests have no
 * account, so this island forwards them to their order confirmation, where
 * the backend is polled for the authoritative payment state. The order id
 * comes from the return URL or the note saved right before the redirect.
 */
export function GuestPaymentReturn({
  orderId,
  outcome,
}: GuestPaymentReturnProps) {
  const t = useTranslations("guestCheckout.paymentReturn");
  const router = useRouter();
  const handledRef = useRef(false);

  const parsedOrderId = Number(orderId);
  const urlOrderId =
    Number.isInteger(parsedOrderId) && parsedOrderId > 0
      ? parsedOrderId
      : null;

  // Initial UI derives from props only, so SSR and the first client render
  // match. The session-storage note is browser-only and resolved after mount.
  const [state, setState] = useState<Resolution>(
    urlOrderId !== null ? "redirecting" : "resolving",
  );

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const note = consumeGuestPaymentReturnNote();
    const targetId = urlOrderId ?? note?.orderId ?? null;
    if (targetId === null) {
      // Post-hydration resolution: the note lives in browser storage only.
      setState("missing"); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    setState("redirecting");
    router.replace(`/guest-order/${targetId}?payment=${outcome}`);
  }, [outcome, router, urlOrderId]);

  if (state === "missing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
        <p className="max-w-md text-sm text-text-secondary">{t("missing")}</p>
        <Link
          href="/track-order"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {t("trackOrder")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-text-secondary">{t("redirecting")}</p>
    </div>
  );
}
