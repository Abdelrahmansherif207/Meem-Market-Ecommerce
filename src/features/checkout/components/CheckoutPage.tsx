import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { CheckoutForm } from "./CheckoutForm";

interface CheckoutPageProps {
  locale: string;
}

export async function CheckoutPage({ locale }: CheckoutPageProps) {
  const t = await getTranslations({ locale, namespace: "checkout" });
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
        <CheckoutForm />
      </div>
    </div>
  );
}
