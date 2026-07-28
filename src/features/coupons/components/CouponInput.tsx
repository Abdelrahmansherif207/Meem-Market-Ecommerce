"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { couponService } from "../services/couponService";

interface CouponInputProps {
  onApplied?: () => void;
  isAuthenticated: boolean;
}

type CouponStatus = "idle" | "loading" | "success" | "already-applied" | "error" | "network-error";

export default function CouponInput({ onApplied, isAuthenticated }: CouponInputProps) {
  const locale = useLocale();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CouponStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus("loading");
    setErrorMsg("");

    if (isAuthenticated) {
      await couponService.removeCoupon(locale);
    }

    const result = await couponService.applyCoupon(trimmed, locale);

    if (result.success && result.data) {
      setStatus("success");
      setCode("");
      onApplied?.();
    } else {
      const msg = result.message || "";
      const statusCode = result.status;

      if (statusCode === 401) {
        setStatus("network-error");
        setErrorMsg("Your session has expired. Please log in again.");
      } else if (statusCode === 404) {
        setStatus("error");
        setErrorMsg("Invalid coupon code");
      } else if (statusCode === 422) {
        setStatus("error");
        setErrorMsg(msg);
      } else if (statusCode === 429) {
        setStatus("network-error");
        setErrorMsg("Too many attempts. Please wait.");
      } else if (statusCode && statusCode >= 500) {
        setStatus("network-error");
        setErrorMsg("Something went wrong. Please try again.");
      } else if (msg.includes("already applied")) {
        setStatus("already-applied");
        setErrorMsg("Coupon already applied");
      } else if (msg.includes("expired")) {
        setStatus("error");
        setErrorMsg("Coupon has expired");
      } else {
        setStatus("network-error");
        setErrorMsg("Network error, please try again");
      }
    }
  }, [code, locale, isAuthenticated]);

  const isInputDisabled = status === "loading";

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== "idle" && status !== "loading") {
              setStatus("idle");
              setErrorMsg("");
            }
          }}
          onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
          placeholder="Enter coupon code"
          disabled={isInputDisabled}
          className={cn(
            "flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
            status === "error" && "border-red-400 focus:ring-red-400",
          )}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isInputDisabled || !code.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Apply
        </button>
      </div>

      {status === "success" && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Coupon applied successfully!
        </p>
      )}
      {status === "already-applied" && (
        <p className="flex items-center gap-1.5 text-sm text-blue-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </p>
      )}
      {(status === "error" || status === "network-error") && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <XCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
          {status === "network-error" && (
            <button
              type="button"
              onClick={handleApply}
              className="ml-1 underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </p>
      )}
    </div>
  );
}
