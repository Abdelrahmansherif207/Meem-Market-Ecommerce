"use client";

import { ShoppingBag, Zap, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface FastShippingSummaryProps {
  subtotal: number;
  quantity: number;
  checkoutEnabled: boolean;
}

export function FastShippingSummary({
  subtotal,
  quantity,
  checkoutEnabled,
}: FastShippingSummaryProps) {
  const t = useTranslations("cartPage");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-accent" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("fastTitle")} Summary
        </h3>
      </div>

      {quantity > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-text-secondary shrink-0" />
            <span className="text-sm text-text-secondary">
              {t("fastTitle")}{" "}
              <span className="text-xs text-text-secondary">
                ({quantity} {t("cartItems", { count: quantity })})
              </span>
            </span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {subtotal.toFixed(2)} K.D
          </span>
        </div>
      )}

      <div className="border-t border-border pt-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Total
          </span>
          <span className="text-lg font-bold tabular-nums text-text-primary">
            {subtotal.toFixed(2)} K.D
          </span>
        </div>
        <p className="text-[11px] text-text-secondary text-right">
          ({quantity} {t("cartItems", { count: quantity })})
        </p>
      </div>

      <button
        disabled={!checkoutEnabled}
        onClick={() =>
          router.push(isAuthenticated ? "/payment" : "/auth?redirect=/payment")
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ShoppingBag className="h-4 w-4" />
        {t("checkout")}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
