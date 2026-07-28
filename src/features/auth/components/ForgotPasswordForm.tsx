"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, ShieldCheck, CheckCircle } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";
import type { ActionState } from "../actions/types";

interface ForgotPasswordFormProps {
  action: (formData: FormData) => void;
  pending: boolean;
  state: ActionState | null;
  onBack: () => void;
  onDone: () => void;
}

export function ForgotPasswordForm({
  action,
  pending,
  state,
  onBack,
  onDone,
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "done">("email");
  const [email, setEmail] = useState(() => state?.payload?.email || "");
  const [otp, setOtp] = useState("");

  const fieldErrors = state?.fieldErrors ?? {};

  useEffect(() => {
    if (state?.success) {
      if (step === "email" && state.payload?.otp_sent) {
        setStep("otp");
      } else if (step === "otp" && state.payload?.token_verified) {
        setStep("reset");
      } else if (step === "reset") {
        setStep("done");
      }
    }
  }, [state, step]);

  useEffect(() => {
    if (state?.success === false && step === "done") {
      setStep("reset");
    }
  }, [state, step]);

  function handleOtpComplete(_value: string) {
    // submit button handles submission
  }

  if (step === "done") {
    return (
      <div className="mx-auto mt-4 max-w-md">
        <div className="rounded-3xl border border-border/80 bg-white/95 p-6 text-center shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-50">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Password Reset Successful</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Your password has been reset. Please sign in with your new password.
          </p>
          <button
            type="button"
            onClick={onDone}
            className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="mx-auto mt-4 max-w-md" action={action}>
      {step === "email" && (
        <div className="rounded-3xl border border-border/80 bg-white/95 p-6 shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Reset your password</p>
              <p className="text-xs text-text-secondary">
                Enter your email address and we&apos;ll send you a 6-digit OTP code.
              </p>
            </div>
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary ${
                fieldErrors.email ? "border-red-500" : "border-border"
              }`}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={pending || !email}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="rounded-3xl border border-border/80 bg-white/95 p-6 shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Verify your email</p>
              <p className="text-xs text-text-secondary">
                Enter the 6-digit code sent to {email}. Test OTP: <span className="font-mono font-bold text-primary">123456</span>
              </p>
            </div>
          </div>

          <OtpInput value={otp} onChange={setOtp} onComplete={handleOtpComplete} error={fieldErrors.code} autoFocus />

          <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={pending || otp.length !== 6}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {step === "reset" && (
        <div className="rounded-3xl border border-border/80 bg-white/95 p-6 shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Set new password</p>
              <p className="text-xs text-text-secondary">
                Enter a new password for your account. Must be at least 8 characters.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <input
                type="password"
                name="password"
                placeholder="New password"
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary ${
                  fieldErrors.password ? "border-red-500" : "border-border"
                }`}
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>
            <div>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Confirm new password"
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary ${
                  fieldErrors.password_confirmation ? "border-red-500" : "border-border"
                }`}
              />
              {fieldErrors.password_confirmation && <p className="mt-1 text-xs text-red-500">{fieldErrors.password_confirmation}</p>}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
            <button
              type="button"
              onClick={() => setStep("otp")}
              className="rounded-2xl border border-border px-4 py-3 text-sm 
font-semibold text-text-primary transition hover:border-primary hover:text-primary"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
