"use client";

import { CheckCircle2, Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";

interface ClaimCouponButtonProps {
  claimed: boolean;
  claiming: boolean;
  onClaim: () => void | Promise<void>;
  error?: string | null;
}

/**
 * In-place claim control for claimable coupon notifications:
 * "Claim" button → spinner while claiming → green "Claimed" badge.
 */
export function ClaimCouponButton({ claimed, claiming, onClaim, error }: ClaimCouponButtonProps) {
  const t = useTranslations("notifications");

  if (claimed) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {t("claimed")}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={claiming}
        onClick={onClaim}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white",
          "transition-colors hover:bg-primary-dark disabled:opacity-60",
        )}
      >
        <Gift className="h-3.5 w-3.5" />
        {claiming ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
        {t("claim")}
      </button>
      {error && <span className="text-[11px] text-error">{error}</span>}
    </span>
  );
}
