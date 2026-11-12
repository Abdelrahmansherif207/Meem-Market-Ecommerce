"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldWrapper } from "@/components/ui/Input";
import { ApiError } from "@/shared/lib/api";
import { guestOrderTrackingService } from "../services/guestOrderTrackingService";
import {
  findGuestOrderTokensByNumber,
  findLatestGuestTrackingToken,
} from "../store/useGuestOrderTokensStore";
import { CopyTrackingLink } from "./CopyTrackingLink";
import type { GuestTrackResult } from "../types";

/**
 * Public order tracking (contract §7): the token is submitted in the POST
 * body. The shareable link keeps it in the URL hash (never sent to the
 * server), and the input is prefilled from tokens the confirmation page
 * saved in this browser — any valid token works.
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
  const [cancelBlocked, setCancelBlocked] = useState(false);
  const [cancelledDone, setCancelledDone] = useState(false);
  const [trackedToken, setTrackedToken] = useState<string | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const autoTrackedRef = useRef(false);

  const submit = useCallback(
    async (rawToken: string, keepCancelState = false) => {
      const value = rawToken.trim();
      if (!value) return;
      setLoading(true);
      setError(null);
      setCancelError(null);
      if (!keepCancelState) {
        setCancelBlocked(false);
        setCancelledDone(false);
      }
      try {
        const data = await guestOrderTrackingService.track(value, locale);
        setResult(data);
        setTrackedToken(value);
        setCanCancel(
          Boolean(
            findGuestOrderTokensByNumber(data.order.order_number)
              ?.cancellationToken,
          ),
        );
      } catch (err) {
        setResult(null);
        setTrackedToken(null);
        setCanCancel(false);
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

  // Auto-track once: the shareable link carries the token in the hash,
  // otherwise reuse the latest token the confirmation page stored in this
  // browser. The same storage also keeps the cancellation token, so the
  // cancel action survives leaving the confirmation page.
  useEffect(() => {
    if (typeof window === "undefined" || autoTrackedRef.current) return;
    autoTrackedRef.current = true;

    const hashToken = new URLSearchParams(window.location.hash.slice(1))
      .get("token")
      ?.trim();
    if (hashToken) {
      setToken(hashToken); // eslint-disable-line react-hooks/set-state-in-effect
      submit(hashToken);
      return;
    }

    const storedToken = findLatestGuestTrackingToken();
    if (storedToken) {
      setToken(storedToken);
      submit(storedToken);
    }
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
      setCancelBlocked(true);
      setCanCancel(false);
      const refreshToken = stored.trackingToken ?? token.trim();
      if (refreshToken) await submit(refreshToken, true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setCancelError(t("cancelBlocked"));
          setCancelBlocked(true);
        } else if (err.status === 422) {
          setCancelError(t("cancelUsed"));
          setCancelBlocked(true);
        } else {
          setCancelError(t("errorGeneric"));
        }
      } else {
        setCancelError(t("errorGeneric"));
      }
    } finally {
      setCancelling(false);
    }
  }, [result, locale, submit, t, token]);

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
            {trackedToken && (
              <div className="border-t border-border pt-4">
                <CopyTrackingLink token={trackedToken} />
              </div>
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

          {canCancel && result.order.status !== "cancelled" && !cancelBlocked && (
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
