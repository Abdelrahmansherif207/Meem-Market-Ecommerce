import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { XCircle } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SESSION_COOKIE_NAME } from "@/features/auth/session/constants";
import { GuestPaymentReturn } from "@/features/guest";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";

interface PaymentFailedPageProps {
  locale: string;
  error?: string;
  /** `order_id` from the gateway return URL (used to forward guests). */
  orderId?: string;
}

export async function PaymentFailedPage({
  locale,
  error,
  orderId,
}: PaymentFailedPageProps) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  // Guests continue on their confirmation page, where payment can be retried.
  if (!hasSession && isGuestCheckoutEnabled()) {
    return (
      <div className="py-6">
        <GuestPaymentReturn orderId={orderId} outcome="failed" />
      </div>
    );
  }

  const t = await getTranslations({ locale, namespace: "payment" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });

  return (
    <div className="py-6">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
          { label: t("failed.breadcrumb") },
        ]}
      />

      <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <XCircle className="size-16 text-red-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">
          {t("failed.title")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("failed.subtitle")}
        </p>

        {error && (
          <div className="mt-6 w-full max-w-sm rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-left">
            <span className="text-xs font-medium uppercase tracking-wider text-red-600">
              {t("failed.error")}
            </span>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/payment"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            {t("failed.tryAgain")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            {t("failed.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
