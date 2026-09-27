"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Check, Ticket, RefreshCw } from "lucide-react";

import { couponService } from "../services/couponService";
import { useAvailableCoupons } from "../hooks/useAvailableCoupons";
import { CouponCardSkeleton } from "./skeletons/CouponSkeleton";
import type { AvailableCoupon } from "../types";

interface MyAvailableCouponsProps {
  /** Called after a coupon is applied so the cart can refresh. */
  onCouponApplied?: () => void | Promise<void>;
}

/**
 * Personalized "Coupons For You" shelf (`GET /general/coupons/available`).
 * Advisory only — the real check still happens at apply/checkout:
 * - `action: "apply"` cards copy their code and apply via the coupon service.
 * - `action: "claim"` cards render the claim → claimed flow.
 * Pages are appended via "Show More" while `has_more_pages` is true.
 */
export default function MyAvailableCoupons({ onCouponApplied }: MyAvailableCouponsProps) {
  const t = useTranslations("coupons");
  const locale = useLocale();
  const {
    applyCoupons,
    claimCoupons,
    loading,
    loadingMore,
    error,
    canLoadMore,
    loadMore,
  } = useAvailableCoupons();

  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (!copiedId) return;
    const id = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(id);
  }, [copiedId]);

  if (loading) {
    return (
      <div className="space-y-3 rounded-2xl border-2 border-border bg-white p-5">
        <h4 className="text-sm font-medium text-text-secondary">
          {t("personalizedTitle")}
        </h4>
        <div className="flex gap-3 overflow-hidden pb-1">
          <CouponCardSkeleton />
          <CouponCardSkeleton />
        </div>
      </div>
   );
  }

  if (error && applyCoupons.length === 0 && claimCoupons.length === 0) {
    return null;
  }

  if (applyCoupons.length === 0 && claimCoupons.length === 0) {
    return null;
  }

  const handleCopy = async (coupon: AvailableCoupon) => {
    if (!coupon.code) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
    } catch {
      /* clipboard not available */
    }
  };

  const handleApply = async (coupon: AvailableCoupon) => {
    if (!coupon.code) return;
    try {
      const result = await couponService.applyCoupon(coupon.code, locale);
      if (result.success) {
        onCouponApplied?.();
      } else {
        console.warn("[MyAvailableCoupons] apply failed:", result.message);
      }
    } catch {
      /* apply surface already logs; shelf is advisory */
    }
  };

  const handleClaim = async (coupon: AvailableCoupon) => {
    try {
      await couponService.claimCoupon(coupon.id, locale);
      onCouponApplied?.();
    } catch {
      /* claim errors surface server messages via the claims list */
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border-2 border-border bg-white p-5">
      <h4 className="text-sm font-medium text-text-secondary">
        {t("personalizedTitle")}
      </h4>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {claimCoupons.map((coupon) => (
          <ClaimCard key={coupon.id} coupon={coupon} onClaim={handleClaim} t={t} />
        ))}
        {applyCoupons.map((coupon) => (
          <ApplyCard
            key={coupon.id}
            coupon={coupon}
            copied={copiedId === coupon.id}
            onCopy={handleCopy}
            onApply={handleApply}
            t={t}
          />
        ))}
      </div>

      {canLoadMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface disabled:opacity-60"
          >
            {loadingMore ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Ticket className="h-3.5 w-3.5" />
            )}
            {loadingMore ? "…" : t("showMore")}
          </button>
        </div>
      )}
    </div>
  );
}

function ApplyCard({
  coupon,
  copied,
  onCopy,
  onApply,
  t,
}: {
  coupon: AvailableCoupon;
  copied: boolean;
  onCopy: (coupon: AvailableCoupon) => Promise<void>;
  onApply: (coupon: AvailableCoupon) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}) {
  const expiry = coupon.expires_at
    ? { key: "coupons:expiresSoon", date: coupon.expires_at }
    : null;

  return (
    <div
      className="flex w-52 shrink-0 flex-col gap-2 rounded-xl border p-3"
      style={{ borderColor: "#ede4e2" }}
    >
      {coupon.image ? (
        <Image
          src={coupon.image}
          alt={coupon.name}
          width={208}
          height={120}
          className="h-14 w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 items-center justify-center rounded-lg bg-surface">
          <Ticket className="h-6 w-6 text-primary" aria-hidden />
        </div>
      )}
      <p className="truncate text-xs font-medium text-text-primary">{coupon.name}</p>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onCopy(coupon)}
          className="inline-flex items-center gap-1 text-[11px] text-primary transition-colors hover:text-primary-dark"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> {t("copied")}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> {t("copyCode")}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onApply(coupon)}
          className="rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary-dark"
        >
          {t("apply")}
        </button>
      </div>
      {expiry && (
        <p className="truncate text-[11px] text-text-secondary">
          {t("expiresSoon", { date: expiry.date })}
        </p>
      )}
    </div>
  );
}

function ClaimCard({
  coupon,
  onClaim,
  t,
}: {
  coupon: AvailableCoupon;
  onClaim: (coupon: AvailableCoupon) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      className="flex w-52 shrink-0 flex-col gap-2 rounded-xl border p-3"
      style={{ borderColor: "#ede4e2" }}
    >
      {coupon.image ? (
        <Image
          src={coupon.image}
          alt={coupon.name}
          width={208}
          height={120}
          className="h-14 w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 items-center justify-center rounded-lg bg-surface">
          <Ticket className="h-6 w-6 text-primary" aria-hidden />
        </div>
      )}
      <p className="truncate text-xs font-medium text-text-primary">{coupon.name}</p>
      <button
        type="button"
        onClick={() => onClaim(coupon)}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary-dark"
      >
        <Ticket className="h-3 w-3" aria-hidden />
        {t("claim")}
      </button>
      {coupon.expires_at && (
        <p className="truncate text-[11px] text-text-secondary">
          {t("expiresSoon", { date: coupon.expires_at })}
        </p>
      )}
    </div>
  );
}
