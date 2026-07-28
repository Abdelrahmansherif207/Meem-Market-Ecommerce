import { getTranslations } from "next-intl/server";
import { CheckCircle, QrCode } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { QRDisplay } from "./QRDisplay";

interface PaymentSuccessPageProps {
  locale: string;
  orderId?: string;
  transactionId?: string;
}

export async function PaymentSuccessPage({
  locale,
  orderId,
  transactionId,
}: PaymentSuccessPageProps) {
  const t = await getTranslations({ locale, namespace: "payment" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });

  return (
    <div className="py-6 min-h-screen">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
          { label: t("success.breadcrumb") },
        ]}
      />

      <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="size-16 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">
          {t("success.title")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("success.subtitle")}
        </p>

        <QRDisplay />

        {(orderId || transactionId) && (
          <div className="mt-6 w-full max-w-sm space-y-3 rounded-2xl border-2 border-border bg-white p-5 text-left">
            {orderId && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t("success.orderId")}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  #{orderId}
                </span>
              </div>
            )}
            {transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t("success.transactionId")}
                </span>
                <span className="text-sm font-mono font-semibold text-text-primary">
                  {transactionId}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            {t("success.goHome")}
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            {t("success.viewOrders")}
          </Link>
        </div>
      </div>
    </div>
  );
}
