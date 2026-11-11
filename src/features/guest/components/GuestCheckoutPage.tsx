import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getCachedSettings } from "@/features/settings/services/settingsService";
import { isGuestCheckoutEnabled } from "@/shared/constants/guestCheckout";
import { GuestCheckoutForm } from "./GuestCheckoutForm";

interface GuestCheckoutPageProps {
  locale: string;
}

export async function GuestCheckoutPage({ locale }: GuestCheckoutPageProps) {
  // Route stays hidden until the deployment opts in.
  if (!isGuestCheckoutEnabled()) notFound();

  const t = await getTranslations({ locale, namespace: "guestCheckout" });
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

      <div className="mt-6 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <GuestCheckoutForm
        taxEnabled={settings.order_tax_enabled}
        taxRate={settings.order_tax_rate}
      />
    </div>
  );
}
