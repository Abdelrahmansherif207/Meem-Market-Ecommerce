import { PaymentFailedPage } from "@/features/payment";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payment.failed" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; order_id?: string }>;
}) {
  const { locale } = await params;
  const { error, order_id } = await searchParams;
  return (
    <PaymentFailedPage locale={locale} error={error} orderId={order_id} />
  );
}
