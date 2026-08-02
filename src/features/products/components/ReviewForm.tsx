"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { reviewService } from "../services/reviewService";
import type { ProductReview } from "../types";

interface ReviewFormProps {
  productId: number;
  existingReview?: ProductReview;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthModalStore((s) => s.open);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const isEditing = Boolean(existingReview);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (rating === 0) {
      setError(t("yourRating"));
      return;
    }

    if (!comment.trim()) {
      setError(t("yourReview"));
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing && existingReview) {
        await reviewService.update(existingReview.id, { rating, comment }, locale);
        setSuccessMessage(t("reviewUpdated"));
      } else {
        await reviewService.create(productId, { rating, comment }, locale);
        setSuccessMessage(t("reviewSubmitted"));
      }

      setRating(0);
      setComment("");

      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={formRef} className="rounded-xl border border-border bg-surface p-4">
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
                      : "fill-gray-200 text-gray-200",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("reviewPlaceholder")}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition",
              submitting
                ? "cursor-not-allowed bg-primary/70"
                : "bg-primary hover:bg-primary-dark",
            )}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? t("updateReview") : t("submitReview")}
          </button>

          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface"
            >
              {t("cancelEdit")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
