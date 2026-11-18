import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SESSION_COOKIE_NAME } from "@/features/auth/session/constants";
import { GuestPaymentReturn } from "@/features/guest";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { VerifiedPaymentSuccess } from "./VerifiedPaymentSuccess";

interface PaymentSuccessPageProps {
  locale: string;
  orderId?: string;
  transactionId?: string;
}

export async function PaymentSuccessPage({
  locale,
  orderId,
  transactionId,
}: PaymentSuccessPageProps) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  // Guests have no session; send them to their cookie-owned order page, which
  // polls the backend instead of trusting the gateway redirect.
  if (!hasSession && isGuestCheckoutEnabled()) {
    return (
      <div className="py-6">
        <GuestPaymentReturn orderId={orderId} outcome="success" />
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
          { label: t("success.breadcrumb") },
        ]}
      />

      <div className="mt-6">
        <VerifiedPaymentSuccess orderId={orderId} transactionId={transactionId} />
      </div>
    </div>
  );
}
