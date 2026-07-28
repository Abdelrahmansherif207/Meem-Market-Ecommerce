import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { PaymentContent } from "./PaymentContent";

interface PaymentPageProps {
  locale: string;
}

export async function PaymentPage({ locale }: PaymentPageProps) {
  const t = await getTranslations({ locale, namespace: "payment" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });

  return (
    <div className="py-6 min-h-screen">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mt-6">
        <PaymentContent />
      </div>
    </div>
  );
}
