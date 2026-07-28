"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { ApiError } from "@/shared/lib/api";

export function ChangePasswordForm() {
  const t = useTranslations("profile.password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full rounded-xl border-2 border-border bg-white px-4 py-3 pr-11 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary";
  const labelClass = "text-sm font-semibold text-text-primary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("fillAll"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("minLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
        newPassword_confirmation: confirmPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : t("error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-border bg-white p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">{t("title")}</h3>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t("success")}
        </div>
      )}

      <div className="relative space-y-1.5">
        <label className={labelClass}>{t("currentPassword")}</label>
        <input
          type={showCurrent ? "text" : "password"}
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={submitting}
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary"
        >
          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative space-y-1.5">
        <label className={labelClass}>{t("newPassword")}</label>
        <input
          type={showNew ? "text" : "password"}
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={submitting}
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary"
        >
          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative space-y-1.5">
        <label className={labelClass}>{t("confirmPassword")}</label>
        <input
          type={showConfirm ? "text" : "password"}
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={submitting}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary"
        >
          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? t("updating") : t("update")}
      </button>
    </form>
  );
}
