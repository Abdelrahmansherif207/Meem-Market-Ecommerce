"use client";

import { useState, useCallback } from "react";
import { Mail, Smartphone, Send, ShieldCheck } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";
import { sendOtpCodeAction, otpAction } from "../actions";
import { PhoneInputWithCountry } from "./PhoneInputWithCountry";
interface OtpLoginFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
}

const RESEND_COOLDOWN = 20;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_COOLDOWN = 60;

export function OtpLoginForm({ onSuccess, onBack }: OtpLoginFormProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  const isBlocked = attempts <= 0 || rateLimitCooldown > 0;
  const handleSendOtp = async () => {
    setError("");
    setFieldErrors({});
    if (method === "email") {
      if (!email.trim()) { setFieldErrors({ email: "Email is required." }); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setFieldErrors({ email: "Please enter a valid email address." }); return; }
    } else {
      if (!phone.trim()) { setFieldErrors({ phone: "Phone number is required." }); return; }
    }
    setPending(true);
    const formData = new FormData();
    formData.set(method === "email" ? "email" : "phone", method === "email" ? email.trim() : phone.trim());
    try {
      const result = await sendOtpCodeAction(null, formData);
      setPending(false);
      if (result.success) {
        if (result.payload?.otp_id) setOtpId(result.payload.otp_id);
        setStep("verify");
      } else {
        const msg = result.message || "";
        if (msg.toLowerCase().includes("too many") || msg.includes("429")) setRateLimitCooldown(RATE_LIMIT_COOLDOWN);
        else if (msg.toLowerCase().includes("found") || msg.toLowerCase().includes("exist")) setError("No account found with this " + method + ".");
        else setError(msg);
      }
    } catch { setPending(false); setError("Network error. Please try again."); }
  };
  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) { setError("Please enter a valid 6-digit code."); return; }
    setPending(true); setError("");
    const formData = new FormData();
    formData.set(method === "email" ? "email" : "phone", method === "email" ? email.trim() : phone.trim());
    formData.set("code", otp);
    if (otpId) formData.set("otpId", otpId);
    try {
      const result = await otpAction(null, formData);
      setPending(false);
      if (result.success) { onSuccess(result.data); }
      else {
        const msg = result.message || "";
        if (msg.toLowerCase().includes("too many") || msg.includes("429")) setRateLimitCooldown(RATE_LIMIT_COOLDOWN);
        else {
          setAttempts((prev) => Math.max(0, prev - 1));
          if (attempts <= 1) { setError("Too many attempts. Please wait 1 minute."); setRateLimitCooldown(RATE_LIMIT_COOLDOWN); }
          else setError("Invalid verification code. " + (attempts - 1) + " attempts remaining.");
        }
      }
    } catch { setPending(false); setError("Network error. Please try again."); }
  }, [otp, method, email, phone, otpId, attempts, onSuccess]);
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(RESEND_COOLDOWN); setAttempts(MAX_ATTEMPTS); setOtp(""); setError("");
    await handleSendOtp();
  };

  if (step === "verify") {
    return (
      <div className="mx-auto mt-4 max-w-md">
        {rateLimitCooldown > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-red-700">Too many attempts</p>
            <p className="text-xs text-red-600">Please wait {rateLimitCooldown} seconds before trying again.</p>
          </div>
        )}
        <div className="rounded-3xl border border-border/80 bg-white/95 p-6 shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Verify your {method}</p>
              <p className="text-xs text-text-secondary">Enter the 6-digit code sent to {method === "email" ? email : phone}</p>
            </div>
          </div>
          {!isBlocked && (
            <>
              <OtpInput value={otp} onChange={setOtp} onComplete={handleVerify} autoFocus />
              <div className="mt-2 text-center text-xs text-text-secondary">{attempts > 1 ? attempts + " attempts remaining" : "1 attempt remaining"}</div>
            </>
          )}
          {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
            <button type="button" onClick={() => { setStep("send"); setError(""); }} className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary">Back</button>
            {!isBlocked && <button type="button" onClick={handleVerify} disabled={pending || otp.length !== 6} className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70">{pending ? "Verifying..." : "Verify code"}</button>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
            {!isBlocked && <button type="button" onClick={handleResend} disabled={resendCooldown > 0} className="font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50">{resendCooldown > 0 ? "Resend in " + resendCooldown + "s" : "Resend code"}</button>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-4 max-w-md">
      <div className="rounded-3xl border border-border/80 bg-white/95 p-6 shadow-[0_9px_30px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            {method === "email" ? <Mail className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Log in with OTP</p>
            <p className="text-xs text-text-secondary">Enter your {method} to receive a verification code.</p>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-text-secondary">Verify via:</span>
          <button type="button" onClick={() => { setMethod("email"); setFieldErrors({}); }} className={"rounded-lg px-3 py-1 text-xs font-semibold transition " + (method === "email" ? "bg-primary text-white" : "border border-border text-text-primary hover:border-primary")}>Email</button>
          <button type="button" onClick={() => { setMethod("phone"); setFieldErrors({}); }} className={"inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition " + (method === "phone" ? "bg-primary text-white" : "border border-border text-text-primary hover:border-primary")}><Smartphone className="h-3 w-3" /> Phone</button>
        </div>
        {rateLimitCooldown > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-red-700">Too many attempts</p>
            <p className="text-xs text-red-600">Please wait {rateLimitCooldown} seconds before trying again.</p>
          </div>
        )}
        {method === "email" ? (
          <div>
            <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={"w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary " + (fieldErrors.email ? "border-red-500" : "border-border")} />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          </div>
        ) : (
          <PhoneInputWithCountry name="phone" placeholder="Enter your phone number" error={fieldErrors.phone} defaultValue={phone} onChange={(v) => setPhone(v)} />
        )}
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
          <button type="button" onClick={onBack} className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary">Back</button>
          <button type="button" onClick={handleSendOtp} disabled={pending || rateLimitCooldown > 0} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"><Send className="h-4 w-4" /> {pending ? "Sending..." : "Send OTP"}</button>
        </div>
      </div>
    </div>
  );
}
