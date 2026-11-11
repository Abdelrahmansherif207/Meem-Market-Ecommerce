import { TrackOrderPage } from "@/features/guest";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guestCheckout.tracking" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Page() {
  return (
    <div className="py-6">
      <TrackOrderPage />
    </div>
  );
}
