import { notFound } from "next/navigation";
import { GuestCheckoutPage, isGuestCheckoutEnabled } from "@/features/guest";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guestCheckout" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (!isGuestCheckoutEnabled()) notFound();

  const { locale } = await params;
  return <GuestCheckoutPage locale={locale} />;
}
