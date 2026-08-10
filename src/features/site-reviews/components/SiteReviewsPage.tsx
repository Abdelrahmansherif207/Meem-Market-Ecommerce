import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SiteReviewForm } from "./SiteReviewForm";
import { SiteReviewsWall } from "./SiteReviewsWall";

interface SiteReviewsPageProps {
  locale: string;
}

export async function SiteReviewsPage({ locale }: SiteReviewsPageProps) {
  const t = await getTranslations({ locale, namespace: "siteReviews" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });

  return (
    <div className="py-6">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mt-6">
        <h1 className="text-xl font-bold text-text-primary">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-text-primary">{t("wallTitle")}</h2>
          <SiteReviewsWall />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">{t("formTitle")}</h2>
          <SiteReviewForm />
        </div>
      </div>
    </div>
  );
}