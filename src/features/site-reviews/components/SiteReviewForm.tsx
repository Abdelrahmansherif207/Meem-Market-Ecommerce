"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { ApiError } from "@/shared/lib/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { siteReviewService } from "../services/siteReviewService";

export function SiteReviewForm() {
  const t = useTranslations("siteReviews");
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthModalStore((s) => s.open);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (rating === 0) {
      setFieldErrors((prev) => ({ ...prev, rating: t("ratingRequired") }));
      return;
    }

    if (!comment.trim()) {
      setFieldErrors((prev) => ({ ...prev, comment: t("commentRequired") }));
      return;
    }

    setSubmitting(true);
    try {
      await siteReviewService.submitSiteReview({ rating, title, comment }, locale);
      setRating(0);
      setTitle("");
      setComment("");
      setSuccessMessage(t("submittedMessage"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        useAuthStore.getState().clearAuth();
        openAuthModal();
        return;
      }
      if (err instanceof ApiError && err.status === 422) {
        const fields: Record<string, string> = {};
        Object.entries(err.fields).forEach(([key, messages]) => {
          fields[key] = messages[0];
        });
        setFieldErrors(fields);
        return;
      }
      setFormError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border bg-background px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10";
  const errorInput = "border-error";
  const normalInput = "border-border";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {successMessage && (
        <div className="mb-4 rounded-lg bg-success-surface px-4 py-3 text-sm font-medium text-success" role="status">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">{t("yourRating")}</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition hover:scale-110"
                aria-label={`${star} star`}
              >
                <Star
                  className={cn(
                    "size-7 cursor-pointer transition-colors",
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-border text-border",
                  )}
                />
              </button>
            ))}
          </div>
          {fieldErrors.rating && (
            <p className="mt-1.5 text-xs text-error">{fieldErrors.rating}</p>
          )}
        </div>

        <div>
          <label htmlFor="site-review-title" className="mb-1.5 block text-sm font-semibold text-text-primary">
            {t("titleLabel")}
          </label>
          <input
            id="site-review-title"
            type="text"
            value={title}
            maxLength={191}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className={cn(inputClasses, fieldErrors.title ? errorInput : normalInput)}
          />
          {fieldErrors.title && (
            <p className="mt-1.5 text-xs text-error">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="site-review-comment" className="mb-1.5 block text-sm font-semibold text-text-primary">
            {t("commentLabel")}
          </label>
          <textarea
            id="site-review-comment"
            value={comment}
            maxLength={2000}
            rows={4}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("commentPlaceholder")}
            className={cn(inputClasses, "resize-none", fieldErrors.comment ? errorInput : normalInput)}
          />
          {fieldErrors.comment && (
            <p className="mt-1.5 text-xs text-error">{fieldErrors.comment}</p>
          )}
        </div>

        {formError && <p className="text-xs text-error">{formError}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition",
              submitting
                ? "cursor-not-allowed bg-primary/70"
                : "bg-primary hover:bg-primary-dark",
            )}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? t("submitting") : t("submit")}
          </button>

          {!isAuthenticated && (
            <p className="text-center text-xs text-text-secondary">{t("guestNote")}</p>
          )}
        </div>
      </form>
    </div>
  );
}