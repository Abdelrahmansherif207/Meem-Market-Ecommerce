import { notFound } from "next/navigation";
import { GuestOrderConfirmation, isGuestCheckoutEnabled } from "@/features/guest";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; orderId: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guestCheckout.confirmation" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<{ payment?: string | string[] }>;
}) {
  if (!isGuestCheckoutEnabled()) notFound();

  const { orderId } = await params;
  const { payment } = await searchParams;
  const id = Number(orderId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="py-6">
      <GuestOrderConfirmation orderId={id} paymentRetry={payment === "retry"} />
    </div>
  );
}
