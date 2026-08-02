"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, User, Pencil } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { ProductReview } from "../types";
import { getAverageRating } from "../utils";
import { ReviewForm } from "./ReviewForm";

interface ProductReviewsProps {
  productId: number;
  reviews: ProductReview[];
  onReviewSuccess: () => void;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "size-5" : "size-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200",
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productId, reviews, onReviewSuccess }: ProductReviewsProps) {
  const t = useTranslations("product");
  const authId = useAuthStore((s) => s.id);
  const authEmail = useAuthStore((s) => s.email);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  function isOwnReview(review: ProductReview): boolean {
    if (!review.user) return false;
    if (authId != null && review.user.id === authId) return true;
    if (authEmail != null && review.user.email === authEmail) return true;
    return false;
  }

  const existingReview = editingReviewId
    ? reviews.find((r) => r.id === editingReviewId)
    : undefined;

  const avgRating = reviews.length > 0 ? getAverageRating(reviews) : 0;

  return (
    <div className="space-y-6">
      <ReviewForm
        productId={productId}
        existingReview={existingReview}
        onSuccess={onReviewSuccess}
        onCancel={editingReviewId ? () => setEditingReviewId(null) : undefined}
      />

      {reviews.length > 0 && (
        <>
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <span className="text-3xl font-bold text-text-primary">{avgRating}</span>
            <div>
              <StarRating rating={avgRating} size="md" />
              <p className="mt-0.5 text-sm text-text-secondary">
                {reviews.length} {t("reviews")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => {
              const own = isOwnReview(review);
              return (
                <div key={review.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        {review.user?.image ? (
                          <Image
                            src={review.user.image}
                            alt={review.user.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <User className="size-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {review.user?.name ?? t("anonymous")}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    {own && editingReviewId !== review.id && (
                      <button
                        type="button"
                        onClick={() => setEditingReviewId(review.id)}
                        className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
                      >
                        <Pencil className="size-3.5" />
                        {t("editReview")}
                      </button>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {review.comment}
                    </p>
                  )}
                  {review.images.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {review.images.map((img, i) => (
                        <Image
                          key={i}
                          src={img}
                          alt={`Review image ${i + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {reviews.length === 0 && (
        <div className="py-4 text-center text-sm text-text-secondary">
          {t("noReviews")}
        </div>
      )}
    </div>
  );
}
