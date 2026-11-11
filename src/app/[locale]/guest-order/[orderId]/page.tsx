import { GuestOrderConfirmation } from "@/features/guest";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; orderId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guestCheckout.confirmation" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  const id = Number(orderId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid order id");
  }
  return (
    <div className="py-6">
      <GuestOrderConfirmation orderId={id} />
    </div>
  );
}
