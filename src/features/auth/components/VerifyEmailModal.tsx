"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";
import { sendOtpCodeAction, otpAction } from "../actions";
import { useAuthStore } from "../store/useAuthStore";
import type { AuthLoginData } from "../types";

interface VerifyEmailModalProps {
  email: string;
  onClose: () => void;
}

export function VerifyEmailModal({ email, onClose }: VerifyEmailModalProps) {
  const setAuthData = useAuthStore((s) => s.setAuthData);
  const token = useAuthStore((s) => s.token);
  const permissions = useAuthStore((s) => s.permissions);
  const role = useAuthStore((s) => s.role);
  const [step, setStep] = useState<"sending" | "verify">("sending");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const formData = new FormData();
    formData.set("email", email);
    sendOtpCodeAction(null, formData).then((result) => {
      if (result.success) {
        setStep("verify");
      } else {
        setError(result.message || "Failed to send OTP code.");
      }
    });
  }, [email]);

  function handleVerify() {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setPending(true);
    setError("");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", otp);

    otpAction(null, formData).then((result) => {
      setPending(false);
      if (result.success) {
        const updatedData: AuthLoginData = {
          token: token || result.data?.token || "",
          permissions: result.data?.permissions ?? permissions,
          role: result.data?.role ?? role,
          email_verified: true,
          email: result.data?.email || email,
          phone_number: result.data?.phone_number,
        };
        setAuthData(updatedData);
        onClose();
      } else {
        setError(result.message || "Verification failed.");
      }
    });
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  const handleOtpComplete = (value: string) => {
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
      <div className="relative w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-primary transition hover:bg-border"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "sending" ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary animate-pulse">
              <ShieldCheck className="h-6 w-6" />
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
              error={error || undefined}
              autoFocus
            />

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
                className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? "Verifying..." : "Verify"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
