import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
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
