"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ShieldCheck, AlertTriangle, Smartphone } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";
import type { ActionState } from "../actions/types";

interface OtpFormProps {
  action: (formData: FormData) => void;
  pending: boolean;
  state: ActionState | null;
  email: string;
  phone?: string;
  otpStatus?: string;
  method?: "email" | "phone";
  onBack: () => void;
  onAskMeLater?: () => void;
  onResend?: () => void;
  onMethodChange?: (method: "email" | "phone") => void;
}

const RESEND_COOLDOWN = 20;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_COOLDOWN = 60;

export function OtpForm(props: OtpFormProps) {
  const { action, pending, state, email, phone, otpStatus, method = "email", onBack, onAskMeLater, onResend, onMethodChange } = props;
  const fieldErrors = state?.fieldErrors ?? {};
  const p = state?.payload ?? {};
  const formRef = useRef<HTMLFormElement | null>(null);
  const [otp, setOtp] = useState(() => p.code ?? "");
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOtpDown = otpStatus === "false";
  const isBlocked = attempts <= 0 || rateLimitCooldown > 0;
  const identity = email || p.email || "";
  const identityPhone = phone || p.phone || "";

  useEffect(() => {
    if (state && !state.success) {
      const msg = state.message || "";
      if (msg.toLowerCase().includes("too many") || msg.includes("429")) {
        setRateLimitCooldown(RATE_LIMIT_COOLDOWN);
      } else {
        setAttempts((prev) => Math.max(0, prev - 1));
      }
    }
  }, [state]);

  useEffect(() => {
    if (resendCooldown <= 0 && rateLimitCooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
      setRateLimitCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [resendCooldown > 0 || rateLimitCooldown > 0]);

  const handleResend = useCallback(() => {
    if (resendCooldown > 0 || !onResend) return;
    setResendCooldown(RESEND_COOLDOWN);
    setAttempts(MAX_ATTEMPTS);
    onResend();
  }, [resendCooldown, onResend]);

  const handleOtpComplete = useCallback((value: string) => {
    const formData = new FormData(formRef.current || undefined);
    formData.set("code", value);
    if (formRef.current) formRef.current.requestSubmit();
  }, []);

  return (
    <>
      {rateLimitCooldown > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-700">Too many attempts</p>
          <p className="text-xs text-red-600">Please wait {rateLimitCooldown} seconds before trying again.</p>
        </div>
      )}
      <form ref={formRef} className="mx-auto mt-4 max-w-md" action={action}>
        <div className="rounded-3xl border border-border/80 bg-white/95 p-6 shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
          {isOtpDown ? (
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">OTP service unavailable</p>
                <p className="text-xs text-text-secondary">The verification service is temporarily down.</p>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{method === "email" ? "Verify your email" : "Verify your phone"}</p>
                <p className="text-xs text-text-secondary">Enter the 6-digit code sent to {method === "email" ? identity : identityPhone}</p>
              </div>
            </div>
          )}
          {!isOtpDown && onMethodChange && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-text-secondary">Verify via:</span>
              <button type="button" onClick={() => onMethodChange("email")} className={"rounded-lg px-3 py-1 text-xs font-semibold transition " + (method === "email" ? "bg-primary text-white" : "border border-border text-text-primary hover:border-primary")}>Email</button>
              <button type="button" onClick={() => onMethodChange("phone")} className={"inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition " + (method === "phone" ? "bg-primary text-white" : "border border-border text-text-primary hover:border-primary")}><Smartphone className="h-3 w-3" /> Phone</button>
            </div>
          )}
          {!isOtpDown && !isBlocked && (
            <>
              <OtpInput value={otp} onChange={setOtp} onComplete={handleOtpComplete} error={fieldErrors.code} autoFocus />
              <div className="mt-2 text-center text-xs text-text-secondary">{attempts > 1 ? attempts + " attempts remaining" : "1 attempt remaining"}</div>
            </>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
            <button type="button" onClick={onBack} className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary">Back</button>
            {!isOtpDown && !isBlocked && (
              <button type="submit" disabled={pending || otp.length !== 6} className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70">{pending ? "Verifying..." : "Verify code"}</button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
            {!isOtpDown && (
              <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || !onResend} className="font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50">{resendCooldown > 0 ? "Resend in " + resendCooldown + "s" : "Resend code"}</button>
            )}
            {!isOtpDown && onAskMeLater && (
              <button type="button" onClick={onAskMeLater} className="font-semibold text-amber-600 transition hover:text-amber-700">Ask me later</button>
            )}
          </div>
          {isOtpDown && onMethodChange && method === "email" && (
            <div className="mt-3 text-center">
              <button type="button" onClick={() => onMethodChange("phone")} className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-dark"><Smartphone className="h-3 w-3" /> Verify with phone instead</button>
            </div>
          )}
        </div>
        <input type="hidden" name={method === "email" ? "email" : "phone"} value={method === "email" ? identity : identityPhone} />
        <input type="hidden" name="code" value={otp} />
        <input type="hidden" name="method" value={method} />
      </form>
    </>
  );
}
