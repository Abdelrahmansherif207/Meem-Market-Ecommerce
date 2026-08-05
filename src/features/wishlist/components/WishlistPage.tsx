import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { WishlistPageContent } from "./WishlistPageContent";

interface WishlistPageProps {
  locale: string;
}

export async function WishlistPage({ locale }: WishlistPageProps) {
  const t = await getTranslations({ locale, namespace: "wishlist" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });

  return (
    <div className="py-6">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">{t("title")}</h1>
      </div>

      <div className="mt-6">
        <WishlistPageContent />
      </div>
    </div>
  );
}
