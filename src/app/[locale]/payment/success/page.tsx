import { PaymentSuccessPage } from "@/features/payment";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payment.success" });

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
  searchParams: Promise<{ order_id?: string; transaction_id?: string }>;
}) {
  const { locale } = await params;
  const { order_id, transaction_id } = await searchParams;
  return (
    <PaymentSuccessPage
      locale={locale}
      orderId={order_id}
      transactionId={transaction_id}
    />
  );
}
