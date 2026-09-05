"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShieldCheck, X } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";
import { sendOtpCodeAction, otpAction } from "../actions";
import { useAuthStore } from "../store/useAuthStore";
import type { AuthLoginData } from "../types";

interface VerifyEmailModalProps {
  email: string;
  onClose: () => void;
}

const RESEND_COOLDOWN = 20;

export function VerifyEmailModal({ email: propEmail, onClose }: VerifyEmailModalProps) {
  const setAuthData = useAuthStore((s) => s.setAuthData);
  const token = useAuthStore((s) => s.token);
  const permissions = useAuthStore((s) => s.permissions);
  const role = useAuthStore((s) => s.role);
  const storeEmail = useAuthStore((s) => s.email);
  const email = propEmail || storeEmail || "";

  const [step, setStep] = useState<"sending" | "verify">("sending");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef(false);
  const lastAttemptRef = useRef<string | null>(null);

  const sendOtp = useCallback(async () => {
    if (!email) {
      setStep("verify");
      setError("No email associated with your account.");
      return;
    }
    setStep("sending");
    setError("");
    const formData = new FormData();
    formData.set("email", email);
    try {
      const result = await sendOtpCodeAction(null, formData);
      if (result.success) {
        setStep("verify");
        setOtp("");
        setError("");
        setResendCooldown(RESEND_COOLDOWN);
      } else {
        setStep("verify");
        setError(result.message || "Failed to send the verification code.");
      }
    } catch {
      setStep("verify");
      setError("Network error. Please try again.");
    }
  }, [email]);

  useEffect(() => {
    if (lastAttemptRef.current === email && sendRef.current) return;
    lastAttemptRef.current = email;
    sendRef.current = true;
    sendOtp();
  }, [email, sendOtp]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const cooldownActive = resendCooldown > 0;

  useEffect(() => {
    if (!cooldownActive) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldownActive, resendCooldown]);

  async function handleVerify() {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setPending(true);
    setError("");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", otp);

    try {
      const result = await otpAction(null, formData);
      if (result.success) {
        const updatedData: AuthLoginData = {
          token: token || result.data?.token || "",
          permissions: result.data?.permissions ?? permissions,
          role: result.data?.role ?? role,
          email_verified: true,
          email: result.data?.email || email,
          phone_number: result.data?.phone_number,
          expires_at: result.data?.expires_at,
        };
        if (setAuthData(updatedData)) {
          onClose();
        } else {
          setError("Your session has expired. Please sign in again.");
        }
      } else {
        setError(result.message || "Verification failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  const handleOtpComplete = () => {
    handleVerify();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Verify email"
    >
      <div className="relative w-full max-w-110 rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-primary transition hover:bg-border"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "sending" ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-text-primary">Sending verification code...</p>
            <p className="text-xs text-text-secondary">Please wait while we send a code to {email}</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Verify your email</p>
                <p className="text-xs text-text-secondary">
                  Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
                </p>
              </div>
            </div>

            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={handleOtpComplete}
              autoFocus
            />

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={sendOtp}
                disabled={resendCooldown > 0}
                className="inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={pending || otp.length !== 6}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}