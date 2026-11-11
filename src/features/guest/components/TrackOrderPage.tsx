"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldWrapper } from "@/components/ui/Input";
import { ApiError } from "@/shared/lib/api";
import { guestOrderTrackingService } from "../services/guestOrderTrackingService";
import { findGuestOrderTokensByNumber } from "../store/useGuestOrderTokensStore";
import type { GuestTrackResult } from "../types";

/**
 * Public order tracking (contract Â§7): the token is submitted in the POST
 * body â€” never placed in the URL. The input is prefilled from tokens the
 * confirmation page saved in this tab, but any valid token works.
 */
export function TrackOrderPage() {
  const t = useTranslations("guestCheckout.tracking");
  const locale = useLocale();

  const [token, setToken] = useState("");
  const [result, setResult] = useState<GuestTrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelledDone, setCancelledDone] = useState(false);

  const submit = useCallback(
    async (rawToken: string) => {
      const value = rawToken.trim();
      if (!value) return;
      setLoading(true);
      setError(null);
      setCancelError(null);
      setCancelledDone(false);
      try {
        const data = await guestOrderTrackingService.track(value, locale);
        setResult(data);
      } catch (err) {
        setResult(null);
        setError(
          err instanceof ApiError && (err.status === 404 || err.status === 422)
            ? t("invalidToken")
            : t("errorGeneric"),
        );
      } finally {
        setLoading(false);
      }
    },
    [locale, t],
  );

  // Prefill from a confirmation page in this tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      for (let i = 0; i < window.sessionStorage.length; i += 1) {
        const key = window.sessionStorage.key(i);
        if (!key || !key.startsWith("guest-order-tokens:")) continue;
        const raw = window.sessionStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as { trackingToken?: string | null };
        if (parsed?.trackingToken) {
          setToken(parsed.trackingToken);
          submit(parsed.trackingToken);
          break;
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = useCallback(async () => {
    if (!result) return;
    const stored = findGuestOrderTokensByNumber(result.order.order_number);
    if (!stored?.cancellationToken) {
      setCancelError(t("tokenMissing"));
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      await guestOrderTrackingService.cancel(stored.cancellationToken, locale);
      setCancelledDone(true);
      await submit(stored.trackingToken ?? "");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setCancelError(t("cancelBlocked"));
        else if (err.status === 422) setCancelError(t("cancelUsed"));
        else setCancelError(t("errorGeneric"));
      } else {
        setCancelError(t("errorGeneric"));
      }
    } finally {
      setCancelling(false);
    }
  }, [result, locale, submit, t]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(token);
        }}
        className="rounded-2xl border-2 border-border bg-white p-5 space-y-4"
      >
        <FieldWrapper label={t("tokenLabel")} htmlFor="track-token">
          <Input
            id="track-token"
            dir="ltr"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("tokenPlaceholder")}
          />
        </FieldWrapper>
        <Button type="submit" full loading={loading} disabled={!token.trim()}>
          <Search className="h-4 w-4" />
          {t("trackBtn")}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !result && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-text-secondary">{t("orderNumber")}</p>
                <p className="text-lg font-bold text-text-primary" dir="ltr">
                  {result.order.order_number}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-text-primary" dir="ltr">
                  {result.order.status}
                </span>
                <span className="text-[11px] text-text-secondary" dir="ltr">
                  {result.order.payment_status}
                </span>
              </div>
            </div>
            {result.tracking_expires_at && (
              <p className="text-xs text-text-secondary" dir="ltr">
                {t("expiresAt")}: {new Date(result.tracking_expires_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {cancelError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {cancelError}
            </div>
          )}

          {cancelledDone && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {t("cancelledDone")}
            </div>
          )}

          <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              {t("timeline")}
            </h2>
            <ol className="space-y-4">
              {result.timeline.map((entry, index) => (
                <li key={index} className="relative flex gap-4 pb-1">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{entry.title}</p>
                    {entry.description && (
                      <p className="text-xs text-text-secondary">{entry.description}</p>
                    )}
                    <p className="text-[11px] text-text-muted" dir="ltr">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {result.order.status !== "cancelled" && (
            <Button variant="outline" full onClick={handleCancel} loading={cancelling}>
              {t("cancelOrder")}
            </Button>
          )}

          <Link
            href="/"
            className="block text-center text-xs font-semibold text-text-secondary hover:text-primary"
          >
            {t("backHome")}
          </Link>
        </div>
      )}
    </div>
  );
}
