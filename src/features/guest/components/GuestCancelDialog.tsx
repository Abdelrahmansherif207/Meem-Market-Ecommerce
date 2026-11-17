"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import OtpInput from "@/components/ui/OtpInput";
import { ApiError } from "@/shared/lib/api";
import { guestOrderTrackingService } from "../services/guestOrderTrackingService";
import type { GuestCancelOtpResult, GuestCancelResult } from "../types";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const LOCKOUT_SECONDS = 60;

type Step = "confirm" | "otp" | "done";

interface GuestCancelDialogProps {
  /** One-time cancellation token from checkout / access-tokens. */
  cancellationToken: string;
  orderNumber: string;
  onClose: () => void;
  /** Fired once, after the backend confirms the cancellation. */
  onCancelled: (result: GuestCancelResult) => void;
  /** Fired when the token can no longer be used (used / blocked / invalid). */
  onBlocked?: () => void;
}

function includesAny(value: string, needles: string[]): boolean {
  const haystack = value.toLowerCase();
  return needles.some((needle) => haystack.includes(needle));
}

/**
 * Two-step cancellation dialog: request a one-time code, then verify it.
 *
 * The cancellation token is single-use and the OTP is bound to the phone on
 * file, so this is deliberately a modal that cannot be dismissed while a
 * request is in flight. Mounting the component starts a fresh flow.
 */
export function GuestCancelDialog({
  cancellationToken,
  orderNumber,
  onClose,
  onCancelled,
  onBlocked,
}: GuestCancelDialogProps) {
  const t = useTranslations("guestCheckout.cancelDialog");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("confirm");
  const [otp, setOtp] = useState<GuestCancelOtpResult | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [lockoutIn, setLockoutIn] = useState(0);
  const [cancelResult, setCancelResult] = useState<GuestCancelResult | null>(
    null,
  );

  const cancelledRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const busy = requesting || verifying;

  // Countdown for the resend link.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(
      () => setResendIn((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [resendIn]);

  // Countdown for a brute-force lockout (429 after repeated bad codes).
  useEffect(() => {
    if (lockoutIn <= 0) return;
    const id = window.setInterval(
      () => setLockoutIn((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [lockoutIn]);

  // Lock body scroll, move focus into the dialog, and restore it on close.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(
      () => dialogRef.current?.focus({ preventScroll: true }),
      0,
    );
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  // Keep keyboard focus inside the dialog and support Escape-to-close.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!busy) onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [busy, onClose]);

  const requestCode = useCallback(async () => {
    if (requesting) return;
    setError(null);
    setCodeError(null);
    setRequesting(true);
    try {
      const result = await guestOrderTrackingService.requestCancelOtp(
        cancellationToken,
        locale,
      );
      setOtp(result);
      setCode("");
      setStep("otp");
      setResendIn(RESEND_SECONDS);
      setLockoutIn(0);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setError(t("generic"));
        return;
      }

      if (err.status === 404) {
        setError(t("invalidToken"));
        onBlocked?.();
      } else if (err.status === 409) {
        setError(t("paymentPending"));
        onBlocked?.();
      } else if (err.status === 422) {
        // Expired / used token, order no longer cancellable, or no phone on
        // file — all terminal for this cancellation link.
        setError(t("notEligible"));
        onBlocked?.();
      } else if (err.status === 429) {
        setError(t("tooManyRequests"));
      } else {
        setError(t("generic"));
      }
    } finally {
      setRequesting(false);
    }
  }, [cancellationToken, locale, onBlocked, requesting, t]);

  const verifyCode = useCallback(
    async (value?: string) => {
      const nextCode = (value ?? code).trim();
      if (nextCode.length !== OTP_LENGTH || verifying || lockoutIn > 0) return;

      setError(null);
      setCodeError(null);
      setVerifying(true);
      try {
        const result = await guestOrderTrackingService.cancel(
          {
            token: cancellationToken,
            code: nextCode,
            otpId: otp?.otpId ?? null,
          },
          locale,
        );
        if (!cancelledRef.current) {
          cancelledRef.current = true;
          setCancelResult(result);
          setStep("done");
          onCancelled(result);
        }
      } catch (err) {
        if (!(err instanceof ApiError)) {
          setError(t("generic"));
          return;
        }

        if (err.status === 404) {
          setError(t("invalidToken"));
          onBlocked?.();
          return;
        }
        if (err.status === 409) {
          setError(t("paymentPending"));
          onBlocked?.();
          return;
        }
        if (err.status === 429) {
          setLockoutIn(LOCKOUT_SECONDS);
          return;
        }

        const message = err.message.toLowerCase();
        if (err.status === 422) {
          if (includesAny(message, ["already been used", "used"])) {
            setError(t("usedToken"));
            onBlocked?.();
            return;
          }
          if (includesAny(message, ["expired"])) {
            setCodeError(t("expiredCode"));
            return;
          }
          if (includesAny(message, ["locked", "too many attempts"])) {
            setLockoutIn(LOCKOUT_SECONDS);
            return;
          }
          if (
            includesAny(message, [
              "cannot be cancelled",
              "can't be cancelled",
              "not cancellable",
              "no phone",
              "phone number",
            ])
          ) {
            setError(t("notEligible"));
            onBlocked?.();
            return;
          }
          setCodeError(t("invalidCode"));
          return;
        }

        setError(t("generic"));
      } finally {
        setVerifying(false);
      }
    },
    [cancellationToken, code, locale, lockoutIn, onBlocked, onCancelled, otp, t, verifying],
  );

  const handleResend = useCallback(() => {
    if (resendIn > 0 || busy) return;
    void requestCode();
  }, [busy, requestCode, resendIn]);

  const otpDisabled = busy || lockoutIn > 0;
  const verifyDisabled =
    code.length !== OTP_LENGTH || busy || lockoutIn > 0;

  // Isolate the masked phone so it keeps LTR order inside Arabic copy.
  const sentTo = otp?.phone
    ? t("otpSentTo", { phone: `\u2066${otp.phone}\u2069` })
    : t("otpSentGeneric");
  // A lockout is time-based, so render the live countdown instead of a
  // static "too many attempts" message that would go stale.
  const displayError =
    lockoutIn > 0 ? t("lockedFor", { seconds: lockoutIn }) : error;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-cancel-title"
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-white px-5 py-5 sm:px-6">
          <div className="relative">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label={t("close")}
              className="absolute end-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-text-secondary transition hover:bg-border hover:text-text-primary disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 pe-12">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  step === "done"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {step === "done" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <h2
                  id="guest-cancel-title"
                  className="text-base font-bold text-text-primary"
                >
                  {step === "done"
                    ? t("successTitle")
                    : step === "otp"
                      ? t("otpTitle")
                      : t("title")}
                </h2>
                <p
                  className="mt-0.5 truncate text-xs text-text-secondary"
                  dir="ltr"
                >
                  {orderNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {step === "confirm" && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-text-secondary">
                {t("requestDesc")}
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                {t("warning")}
              </div>
              {displayError && (
                <div
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("confirm");
                    setError(null);
                    setCodeError(null);
                  }}
                  disabled={busy}
                  aria-label={t("back")}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary transition hover:bg-border hover:text-text-primary disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {sentTo}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-text-primary">
                  {t("codeLabel")}
                </p>
                <OtpInput
                  value={code}
                  onChange={(value) => {
                    setCode(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                    if (codeError) setCodeError(null);
                  }}
                  onComplete={(value) => void verifyCode(value)}
                  length={OTP_LENGTH}
                  disabled={otpDisabled}
                  error={codeError ?? undefined}
                  autoFocus
                />
              </div>

              {displayError && (
                <div
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
                <span>{t("noCode")}</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={busy || resendIn > 0 || lockoutIn > 0}
                  className="inline-flex items-center gap-1 font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:text-text-muted"
                >
                  {requesting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  {resendIn > 0
                    ? t("resendIn", { seconds: resendIn })
                    : t("resend")}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <p className="text-sm leading-relaxed text-text-secondary">
                {t("successDesc")}
              </p>
              <p className="rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-text-primary">
                {cancelResult?.order.orderNumber || orderNumber}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-border bg-white px-5 py-4 sm:flex-row sm:px-6">
          {step === "confirm" && (
            <>
              <Button
                type="button"
                variant="outline"
                full
                onClick={onClose}
                disabled={busy}
              >
                {t("keepOrder")}
              </Button>
              <Button
                type="button"
                variant="danger"
                full
                loading={requesting}
                onClick={() => void requestCode()}
              >
                {t("sendCode")}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <Button
                type="button"
                variant="outline"
                full
                onClick={onClose}
                disabled={verifying}
              >
                {t("keepOrder")}
              </Button>
              <Button
                type="button"
                variant="danger"
                full
                loading={verifying}
                disabled={verifyDisabled}
                onClick={() => void verifyCode()}
              >
                {t("verify")}
              </Button>
            </>
          )}

          {step === "done" && (
            <Button type="button" full onClick={onClose}>
              {t("done")}
            </Button>
          )}
        </div>

        {step !== "done" && (
          <p className="px-5 pb-4 text-center text-xs leading-relaxed text-text-secondary sm:px-6">
            {t("help")}
          </p>
        )}
      </div>
    </div>
  );
}
