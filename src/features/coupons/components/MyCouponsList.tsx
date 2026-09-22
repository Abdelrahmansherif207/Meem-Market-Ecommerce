"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/components/ui/Button";
import { couponService } from "../services/couponService";
import { useMyCoupons } from "../hooks/useMyCoupons";

interface MyCouponsListProps {
  /** Currently applied coupon code from the server cart (drives the Applied badge). */
  appliedCouponCode: string | null;
  /** Called after a successful apply — the cart page re-fetches the cart. */
  onApplied: () => void | Promise<void>;
}

export function MyCouponsList({ appliedCouponCode, onApplied }: MyCouponsListProps) {
  const t = useTranslations("coupons");
  const locale = useLocale();
  const { assignments, loading, error, isAuthenticated, reload } = useMyCoupons();

  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<{ code: string; message: string | null } | null>(null);

  const handleApply = useCallback(
    async (code: string) => {
      setApplyingCode(code);
      setApplyError(null);

      // Mirror the existing cart-page convention (CouponInput / AvailableCoupons):
      // clear any current coupon first, then apply the new one.
      await couponService.removeCoupon(locale);
      const result = await couponService.applyCoupon(code, locale);

      if (result.success) {
        await onApplied();
      } else {
        setApplyError({ code, message: result.message ?? null });
      }
      setApplyingCode(null);
    },
    [locale, onApplied],
  );

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Ticket className="h-4 w-4 text-primary" />
          {t("myCouponsTitle")}
        </div>
        <div className="space-y-2" aria-busy="true">
          <div className="h-16 animate-pulse rounded-xl bg-surface" />
          <div className="h-16 w-3/4 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-xl border border-error/30 bg-error/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-error">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error || t("loadError")}
        </p>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="h-3.5 w-3.5" />
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (assignments.length === 0) return null;

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Ticket className="h-4 w-4 text-primary" />
        {t("myCouponsTitle")}
      </div>

      <div className="space-y-2">
        {assignments.map((assignment) => {
          const isApplied = assignment.code === appliedCouponCode;
          const isApplying = applyingCode === assignment.code;
          const isBusy = applyingCode !== null;
          const isUnusable = assignment.expired || assignment.remaining <= 0;

          return (
            <div
              key={assignment.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                isApplied ? "border-success/40 bg-success/5" : "border-border bg-white",
              )}
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-bold tracking-wide" dir="ltr">
                  {assignment.code}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
                  <span>{t("remainingUses", { count: assignment.remaining })}</span>
                  {assignment.expires_at && (
                    <span>{t("expiresOn", { date: formatDate(assignment.expires_at) })}</span>
                  )}
                </div>
              </div>

              {isApplied ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("applied")}
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  loading={isApplying}
                  disabled={isUnusable || (isBusy && !isApplying)}
                  onClick={() => handleApply(assignment.code)}
                >
                  {isUnusable ? t("expired") : t("apply")}
                </Button>
              )}

              {applyError?.code === assignment.code && (
                <p className="flex w-full items-center gap-1.5 text-xs text-error">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  {applyError.message || t("applyFailed")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
