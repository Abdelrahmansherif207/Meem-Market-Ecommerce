"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Copy, Check, Ticket, RefreshCw } from "lucide-react";

import { couponService } from "../services/couponService";
import { useAvailableCoupons } from "../hooks/useAvailableCoupons";
import { CouponCardSkeleton } from "./skeletons/CouponSkeleton";
import type { AvailableCoupon } from "../types";

interface MyAvailableCouponsProps {
  /** Called after a coupon is applied so the cart can refresh. */
  onCouponApplied?: () => void | Promise<void>;
  /** Currently applied coupon code from the server cart (drives the Applied badge). */
  appliedCouponCode?: string | null;
}

/**
 * Personalized "Coupons For You" shelf (`GET /general/coupons/available`).
 * Advisory only — the real check still happens at apply/checkout:
 * - `action: "apply"` cards copy their code and apply via the coupon service.
 * - `action: "claim"` cards render the claim → claimed flow, then offer
 *   Copy Code + Apply with the generated code (kept in `/mine` claims).
 * Pages are appended via "Show More" while `has_more_pages` is true.
 */
export default function MyAvailableCoupons({
  onCouponApplied,
  appliedCouponCode = null,
}: MyAvailableCouponsProps) {
  const t = useTranslations("coupons");
  const locale = useLocale();
  const {
    applyCoupons,
    claimCoupons,
    claimedCoupons,
    claimedCodeById,
    loading,
    loadingMore,
    error,
    canLoadMore,
    loadMore,
    reload,
  } = useAvailableCoupons();

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  /** Optimistic claimed set — reconciled with server truth via `reload()`. */
  const [claimedIds, setClaimedIds] = useState<Set<number>>(() => new Set());
  /** Generated per-customer codes returned by the successful claim (201). */
  const [claimedCodes, setClaimedCodes] = useState<Map<number, string>>(() => new Map());
  const [claimErrors, setClaimErrors] = useState<Map<number, string>>(() => new Map());
  /** Apply state for claimed cards (same conventions as MyCouponsList). */
  const [applyError, setApplyError] = useState<{ id: number; message: string | null } | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);

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

  if (error && applyCoupons.length === 0 && claimCoupons.length === 0 && claimedCoupons.length === 0) {
    return null;
  }

  if (applyCoupons.length === 0 && claimCoupons.length === 0 && claimedCoupons.length === 0) {
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

  /** Apply code claimed coupons — swaps in the server's message. */
  const handleApplyClaimed = async (coupon: AvailableCoupon, code: string) => {
    setApplyingId(coupon.id);
    setApplyError(null);
    // Mirror the cart-page convention (MyCouponsList / CouponInput):
    // clear any current coupon first, then apply the new one.
    await couponService.removeCoupon(locale);
    const result = await couponService.applyCoupon(code, locale);
    if (result.success) {
      onCouponApplied?.();
    } else {
      setApplyError({ id: coupon.id, message: result.message ?? null });
    }
    setApplyingId(null);
  };

  const handleClaim = async (coupon: AvailableCoupon) => {
    setClaimingId(coupon.id);
    setClaimErrors((prev) => {
      if (!prev.has(coupon.id)) return prev;
      const next = new Map(prev);
      next.delete(coupon.id);
      return next;
    });
    const result = await couponService.claimCoupon(coupon.id, locale);
    if (result.success) {
      setClaimedIds((prev) => new Set(prev).add(coupon.id));
      if (result.data?.code) {
        setClaimedCodes((prev) => new Map(prev).set(coupon.id, result.data!.code!));
      }
      // Sync with server truth (item flips to `claim_status: "claimed"`)
      // and let the parent refresh whatever it needs (cart etc.).
      reload();
      onCouponApplied?.();
    } else {
      setClaimErrors((prev) => new Map(prev).set(coupon.id, result.message || t("claimFailed")));
    }
    setClaimingId(null);
  };

  const handleClaimedCopy = async (id: number, code: string | null) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border-2 border-border bg-white p-5">
      <h4 className="text-sm font-medium text-text-secondary">
        {t("personalizedTitle")}
      </h4>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {claimCoupons.map((coupon) => (
          <ClaimCard
            key={coupon.id}
            coupon={coupon}
            claiming={claimingId === coupon.id}
            claimed={claimedIds.has(coupon.id)}
            claimedCode={claimedCodes.get(coupon.id) ?? claimedCodeById.get(coupon.id) ?? null}
            claimError={claimErrors.get(coupon.id) ?? null}
            copied={copiedId === coupon.id}
            applying={applyingId === coupon.id}
            applied={claimedCodeById.get(coupon.id) === appliedCouponCode && appliedCouponCode !== null}
            appliedCouponCode={appliedCouponCode}
            applyErrorId={applyError?.id ?? null}
            applyErrorMessage={applyError?.message ?? null}
            onClaim={handleClaim}
            onCopyClaimed={handleClaimedCopy}
            onApplyClaimed={handleApplyClaimed}
            t={t}
          />
        ))}
        {claimedCoupons.map((coupon) => (
          <ClaimCard
            key={coupon.id}
            coupon={coupon}
            claiming={claimingId === coupon.id}
            claimed
            claimedCode={claimedCodes.get(coupon.id) ?? claimedCodeById.get(coupon.id) ?? null}
            claimError={null}
            copied={copiedId === coupon.id}
            applying={applyingId === coupon.id}
            applied={claimedCodeById.get(coupon.id) === appliedCouponCode && appliedCouponCode !== null}
            appliedCouponCode={appliedCouponCode}
            applyErrorId={applyError?.id ?? null}
            applyErrorMessage={applyError?.message ?? null}
            onClaim={handleClaim}
            onCopyClaimed={handleClaimedCopy}
            onApplyClaimed={handleApplyClaimed}
            t={t}
          />
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
  claiming,
  claimed,
  claimedCode,
  claimError,
  copied,
  applying,
  applied,
  appliedCouponCode,
  applyErrorId,
  applyErrorMessage,
  onClaim,
  onCopyClaimed,
  onApplyClaimed,
  t,
}: {
  coupon: AvailableCoupon;
  claiming: boolean;
  claimed: boolean;
  /** Code generated by the claim — from the 201 response or `/mine` claims. */
  claimedCode: string | null;
  claimError: string | null;
  copied: boolean;
  applying: boolean;
  /** This card's claimed code is the coupon currently applied to the cart. */
  applied: boolean;
  appliedCouponCode: string | null;
  applyErrorId: number | null;
  applyErrorMessage: string | null;
  onClaim: (coupon: AvailableCoupon) => Promise<void>;
  onCopyClaimed: (id: number, code: string | null) => Promise<void>;
  onApplyClaimed: (coupon: AvailableCoupon, code: string) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}) {
  const claimableCode = claimedCode ?? (claimed ? coupon.code : null);
  const isApplied = applied || (appliedCouponCode !== null && claimableCode === appliedCouponCode);

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

      {claimed ? (
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success">
            <CheckCircle2 className="h-3 w-3" />
            {t("claimed")}
          </span>
          {/* Server list keeps `code: null` for claimed coupons; the copy
              and apply buttons only appear once the generated code is
              known (201 response or `/mine` claims map). */}
          {claimableCode && !isApplied && (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onCopyClaimed(coupon.id, claimableCode)}
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
                disabled={applying}
                onClick={() => onApplyClaimed(coupon, claimableCode)}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {applying ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : null}
                {t("apply")}
              </button>
            </div>
          )}
          {isApplied && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success">
              <CheckCircle2 className="h-3 w-3" />
              {t("applied")}
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={claiming}
          onClick={() => onClaim(coupon)}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {claiming ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Ticket className="h-3 w-3" aria-hidden />
          )}
          {t("claim")}
        </button>
      )}
      {claimError && (
        <p className="text-[11px] text-error">{claimError}</p>
      )}
      {applyErrorId === coupon.id && applyErrorMessage && (
        <p className="text-[11px] text-error">{applyErrorMessage}</p>
      )}
      {coupon.expires_at && (
        <p className="truncate text-[11px] text-text-secondary">
          {t("expiresSoon", { date: coupon.expires_at })}
        </p>
      )}
    </div>
  );
}
