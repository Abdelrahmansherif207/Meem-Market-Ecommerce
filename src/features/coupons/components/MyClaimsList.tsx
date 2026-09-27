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
import type { CouponClaim } from "../types";

interface MyClaimsListProps {
  /** Pre-fetched data from a parent (single shared `useMyCoupons` call). */
  data?: {
    claims: CouponClaim[];
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    reload: () => void;
  };
  /** Currently applied coupon code from the server cart (drives the Applied badge). */
  appliedCouponCode?: string | null;
  /** Called after a successful apply with the applied code. */
  onApplied?: (code: string) => void | Promise<void>;
}

export function MyClaimsList({ data, appliedCouponCode, onApplied }: MyClaimsListProps) {
  const t = useTranslations("coupons");
  const locale = useLocale();
  const internal = useMyCoupons({ enabled: data === undefined });
  const { claims, loading, error, isAuthenticated, reload } = data ?? internal;

  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<{ code: string; message: string | null } | null>(null);

  const handleApply = useCallback(
    async (code: string) => {
      setApplyingCode(code);
      setApplyError(null);

      // Mirror the cart-page convention (MyCouponsList): clear any current
      // coupon first, then apply the new one.
      await couponService.removeCoupon(locale);
      const result = await couponService.applyCoupon(code, locale);

      if (result.success) {
        await onApplied?.(code);
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
          {t("claimsTitle")}
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

  if (claims.length === 0) return null;

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));

  const statusConfig = {
    active: {
      label: t("statusActive"),
      className: "bg-success/10 text-success",
      icon: CheckCircle2,
    },
    redeemed: {
      label: t("statusRedeemed"),
      className: "bg-slate-500/10 text-slate-600",
      icon: CheckCircle2,
    },
    expired: {
      label: t("statusExpired"),
      className: "bg-amber-500/10 text-amber-600",
      icon: AlertTriangle,
    },
  } as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Ticket className="h-4 w-4 text-primary" />
        {t("claimsTitle")}
      </div>

      <div className="space-y-2">
        {claims.map((claim) => {
          const status = statusConfig[claim.status as keyof typeof statusConfig] ?? {
            label: claim.status,
            className: "bg-surface text-text-secondary",
            icon: Ticket,
          };
          const StatusIcon = status.icon;
          const isApplied = claim.code === appliedCouponCode;
          const isApplying = applyingCode === claim.code;
          const isBusy = applyingCode !== null;
          const canApply = claim.status === "active" && !isApplied;

          return (
            <div
              key={claim.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-bold tracking-wide" dir="ltr">
                  {claim.code}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
                  <span>{t("claimedOn", { date: formatDate(claim.claimed_at) })}</span>
                  {claim.expires_at && (
                    <span>{t("expiresOn", { date: formatDate(claim.expires_at) })}</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {canApply && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={isApplying}
                    disabled={isBusy && !isApplying}
                    onClick={() => handleApply(claim.code)}
                  >
                    {t("apply")}
                  </Button>
                )}
                {isApplied && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("applied")}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                    status.className,
                  )}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>

              {applyError?.code === claim.code && (
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
