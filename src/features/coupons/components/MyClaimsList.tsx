"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Ticket,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/components/ui/Button";
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
}

export function MyClaimsList({ data }: MyClaimsListProps) {
  const t = useTranslations("coupons");
  const locale = useLocale();
  const internal = useMyCoupons({ enabled: data === undefined });
  const { claims, loading, error, isAuthenticated, reload } = data ?? internal;

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

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  status.className,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
