"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input, FieldWrapper } from "@/components/ui/Input";
import { ApiError } from "@/shared/lib/api";
import { guestOrderTrackingService } from "../services/guestOrderTrackingService";
import {
  clearGuestOrderTokens,
  findGuestOrderTokensByNumber,
  findLatestGuestTrackingToken,
  saveGuestOrderTokens,
} from "../store/useGuestOrderTokensStore";
import {
  formatGuestDate,
  formatGuestDateTime,
  guestStatusKey,
  guestStatusTone,
  isKnownGuestStatus,
  parseGuestCancellationToken,
  parseGuestTrackingToken,
} from "../lib/format";
import { CopyTrackingLink } from "./CopyTrackingLink";
import { GuestCancelDialog } from "./GuestCancelDialog";
import type { GuestCancelResult, GuestTrackResult } from "../types";

/** Remove the single-use `cancel` token from the shareable URL fragment. */
function removeCancellationFromUrl() {
  if (typeof window === "undefined") return;
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return;
  const params = new URLSearchParams(rawHash);
  if (!params.has("cancel")) return;
  params.delete("cancel");
  const nextHash = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ""}`,
  );
}

/** Drop the whole tracking hash after the shopper starts a new search. */
function clearTrackingHash() {
  if (typeof window === "undefined" || !window.location.hash) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
}

/**
 * Public order tracking. The token goes in the POST body; shareable links
 * keep it (and the optional single-use `cancel` token) in the URL hash so
 * neither reaches the server or a referrer. The input accepts a bare token,
 * a `#token=…` link, or a pasted URL. Cancellation always requires the OTP
 * sent to the phone on file — the link alone is not enough.
 */
export function TrackOrderPage() {
  const t = useTranslations("guestCheckout.tracking");
  const tg = useTranslations("guestCheckout");
  const locale = useLocale();

  const [token, setToken] = useState("");
  const [result, setResult] = useState<GuestTrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelBlocked, setCancelBlocked] = useState(false);
  const [cancelledDone, setCancelledDone] = useState(false);
  const [cancelDialogToken, setCancelDialogToken] = useState<string | null>(
    null,
  );
  const [cancelPreparing, setCancelPreparing] = useState(false);
  const [trackedToken, setTrackedToken] = useState<string | null>(null);
  const [cancellationToken, setCancellationToken] = useState<string | null>(
    null,
  );
  const [canCancel, setCanCancel] = useState(false);
  const autoTrackedRef = useRef(false);
  const requestRef = useRef(0);

  const statusLabel = useCallback(
    (value: string | null | undefined) => {
      if (!value) return "—";
      return isKnownGuestStatus(value) ? tg(`status.${guestStatusKey(value)}`) : value;
    },
    [tg],
  );

  const submit = useCallback(
    async (rawToken: string, linkCancellationToken?: string | null) => {
      const value = parseGuestTrackingToken(rawToken);
      const cancellationFromLink =
        linkCancellationToken ?? parseGuestCancellationToken(rawToken);
      if (!value) {
        setError(t("invalidToken"));
        setResult(null);
        setTrackedToken(null);
        setCancellationToken(null);
        setCanCancel(false);
        return;
      }

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      setLoading(true);
      setError(null);
      setCancelError(null);
      setCancelBlocked(false);
      setCancelledDone(false);

      try {
        const data = await guestOrderTrackingService.track(value, locale);
        if (requestId !== requestRef.current) return;
        setResult(data);
        setTrackedToken(value);
        // Prefer the token saved in this browser; a shared link can also
        // carry its own cancellation token in the URL fragment.
        const storedCancellationToken =
          findGuestOrderTokensByNumber(data.order.orderNumber)
            ?.cancellationToken ?? null;
        const resolvedCancellationToken =
          storedCancellationToken ?? cancellationFromLink ?? null;
        setCancellationToken(resolvedCancellationToken);
        setCanCancel(Boolean(resolvedCancellationToken));
      } catch (err) {
        if (requestId !== requestRef.current) return;
        setResult(null);
        setTrackedToken(null);
        setCancellationToken(null);
        setCanCancel(false);
        setError(
          err instanceof ApiError && (err.status === 404 || err.status === 422)
            ? t("invalidToken")
            : t("errorGeneric"),
        );
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [locale, t],
  );

  // Auto-track once: a shared link carries the token in the hash/query,
  // otherwise reuse the latest token saved by this browser.
  useEffect(() => {
    if (typeof window === "undefined" || autoTrackedRef.current) return;
    autoTrackedRef.current = true;

    const fromUrl = parseGuestTrackingToken(window.location.href);
    const cancelFromUrl = fromUrl
      ? parseGuestCancellationToken(window.location.href)
      : null;
    const storedToken = fromUrl ?? findLatestGuestTrackingToken();
    if (!storedToken) return;

    setToken(storedToken); // eslint-disable-line react-hooks/set-state-in-effect
    void submit(storedToken, cancelFromUrl);
  }, [submit]);

  const openCancelDialog = useCallback(async () => {
    if (!result || cancelPreparing) return;
    setCancelError(null);
    setCancelPreparing(true);
    try {
      const stored = findGuestOrderTokensByNumber(result.order.orderNumber);
      const resolvedCancellationToken =
        stored?.cancellationToken ?? cancellationToken;
      if (!resolvedCancellationToken) {
        setCancelError(t("tokenMissing"));
        return;
      }
      setCancelDialogToken(resolvedCancellationToken);
    } finally {
      setCancelPreparing(false);
    }
  }, [cancelPreparing, cancellationToken, result, t]);

  const handleCancelled = useCallback(
    (cancelResult: GuestCancelResult) => {
      if (!result) return;
      const stored = findGuestOrderTokensByNumber(result.order.orderNumber);
      // The cancellation token is spent; keep the tracking token so the
      // shopper can still follow the cancelled order.
      const trackingTokenToKeep = stored?.trackingToken ?? trackedToken;
      if (stored && trackingTokenToKeep) {
        saveGuestOrderTokens({
          orderId: stored.orderId,
          orderNumber: stored.orderNumber,
          trackingToken: trackingTokenToKeep,
          cancellationToken: null,
        });
      } else if (stored) {
        clearGuestOrderTokens(stored.orderId);
      }
      setCancelledDone(true);
      setCancelBlocked(true);
      setCanCancel(false);
      setCancellationToken(null);
      // The token is single-use — drop it from the shareable URL.
      removeCancellationFromUrl();
      // Update locally so a failed refresh cannot hide a successful cancel.
      setResult((prev) =>
        prev
          ? {
              ...prev,
              order: {
                ...prev.order,
                status: cancelResult.order.status || "cancelled",
              },
            }
          : prev,
      );

      // Best-effort refresh keeps the status/timeline in sync.
      const refreshToken =
        trackingTokenToKeep ?? trackedToken ?? token.trim();
      if (refreshToken) {
        void guestOrderTrackingService
          .track(refreshToken, locale)
          .then((refreshed) => setResult(refreshed))
          .catch(() => {
            // Keep the locally cancelled state.
          });
      }
    },
    [locale, result, trackedToken, token],
  );

  const resetSearch = () => {
    setResult(null);
    setError(null);
    setCancelError(null);
    setCancelledDone(false);
    setCancelBlocked(false);
    setCanCancel(false);
    setCancellationToken(null);
    setCancelDialogToken(null);
    setTrackedToken(null);
    setToken("");
    clearTrackingHash();
  };

  const cancelled = result?.order.status === "cancelled";

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          {t("title")}
        </h1>
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
            autoComplete="off"
            spellCheck={false}
          />
        </FieldWrapper>
        <Button type="submit" full loading={loading} disabled={!token.trim()}>
          <Search className="h-4 w-4" />
          {t("trackBtn")}
        </Button>
        <p className="text-xs leading-relaxed text-text-secondary">
          {t("trackHelp")}
        </p>
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
                  {result.order.orderNumber}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${guestStatusTone(
                  result.order.status,
                )}`}
              >
                {statusLabel(result.order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-surface px-3 py-2">
                <p className="text-xs text-text-secondary">
                  {t("paymentStatus")}
                </p>
                <p className="font-semibold text-text-primary">
                  {statusLabel(result.order.paymentStatus)}
                </p>
              </div>
              <div className="rounded-xl bg-surface px-3 py-2">
                <p className="text-xs text-text-secondary">
                  {t("fulfillmentStatus")}
                </p>
                <p className="font-semibold text-text-primary">
                  {statusLabel(result.order.fulfillmentStatus)}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-text-secondary">
              {result.order.createdAt && (
                <p>
                  {t("createdAt")}: {formatGuestDateTime(result.order.createdAt, locale)}
                </p>
              )}
              {result.order.lastUpdatedAt && (
                <p>
                  {t("lastUpdated")}:{" "}
                  {formatGuestDateTime(result.order.lastUpdatedAt, locale)}
                </p>
              )}
              {result.trackingExpiresAt && (
                <p>
                  {t("expiresAt")}: {formatGuestDate(result.trackingExpiresAt, locale)}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetSearch}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("trackAnother")}
              </Button>
            </div>
          </div>

          {cancelError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {cancelError}
            </div>
          )}

          {cancelledDone && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {t("cancelledDone")}
            </div>
          )}

          <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
              <Clock className="h-4 w-4" />
              {t("timeline")}
            </h2>
            {result.timeline.length === 0 ? (
              <p className="text-sm text-text-secondary">{t("timelineEmpty")}</p>
            ) : (
              <ol className="space-y-4">
                {result.timeline.map((entry, index) => (
                  <li key={`${entry.timestamp}-${index}`} className="relative flex gap-4 pb-1">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {entry.title ??
                          (entry.status ? statusLabel(entry.status) : "—")}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-text-secondary">
                          {entry.description}
                        </p>
                      )}
                      <p className="text-xs text-text-secondary">
                        {formatGuestDateTime(entry.timestamp, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {trackedToken && !cancelled && (
            <div className="rounded-2xl border-2 border-border bg-white p-5">
              <CopyTrackingLink
                token={trackedToken}
                cancellationToken={canCancel ? cancellationToken : null}
              />
            </div>
          )}

          {canCancel && !cancelled && !cancelBlocked && (
            <Button
              type="button"
              variant="outline"
              full
              onClick={() => void openCancelDialog()}
              loading={cancelPreparing}
              disabled={cancelPreparing}
            >
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

      {cancelDialogToken && result && (
        <GuestCancelDialog
          cancellationToken={cancelDialogToken}
          orderNumber={result.order.orderNumber}
          onClose={() => setCancelDialogToken(null)}
          onCancelled={handleCancelled}
          onBlocked={() => {
            setCancelBlocked(true);
            setCanCancel(false);
          }}
        />
      )}
    </div>
  );
}
