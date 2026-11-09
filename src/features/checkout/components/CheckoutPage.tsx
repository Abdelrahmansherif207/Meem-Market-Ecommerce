import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getCachedSettings } from "@/features/settings/services/settingsService";
import { CheckoutForm } from "./CheckoutForm";

interface CheckoutPageProps {
  locale: string;
}

export async function CheckoutPage({ locale }: CheckoutPageProps) {
  const t = await getTranslations({ locale, namespace: "checkout" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });
  const settings = await getCachedSettings(locale);

  return (
    <div className="py-6">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mt-6">
        <CheckoutForm
          orderTaxEnabled={settings.order_tax_enabled}
          orderTaxRate={settings.order_tax_rate}
          gatewaySettings={settings.payment_gateways}
        />
      </div>
    </div>
  );
}
