"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Star, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ReviewForm } from "../ReviewForm";
import type { ProductReview } from "../../types";
import { getAverageRating } from "../../utils";

interface NiceOneReviewsSectionProps {
  productId: number;
  reviews: ProductReview[];
  onReviewSuccess: () => void;
}

type SortKey = "recent" | "high" | "low";

function maskName(name?: string | null): string | null {
  if (!name) return null;
  return `${name.slice(0, 5).trim()} *****`;
}

/**
 * Nice One-style customer reviews card (Stitch PDP screens): header with
 * sort select + "Add Review", big average rating summary, divided review
 * list with masked usernames and static Helpful/Reply affordances.
 *
 * Logic parity: submitting still goes through the existing `ReviewForm`
 * (auth modal for guests, reviewService create/update), own reviews keep
 * their Edit affordance, and success triggers the parent refresh flow.
 * The هستند dates and helpful counters don't exist in the review payload,
 * so no date row is rendered and the counts render as static zeros.
 */
export function NiceOneReviewsSection({ productId, reviews, onReviewSuccess }: NiceOneReviewsSectionProps) {
  const t = useTranslations("niceOnePdp");
  const tProduct = useTranslations("product");
  const authId = useAuthStore((s) => s.id);
  const authEmail = useAuthStore((s) => s.email);

  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [formOpen, setFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  function isOwnReview(review: ProductReview): boolean {
    if (!review.user) return false;
    if (authId != null && review.user.id === authId) return true;
    if (authEmail != null && review.user.email === authEmail) return true;
    return false;
  }

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === "high") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "low") list.sort((a, b) => a.rating - b.rating);
    // "recent": API order is already the served order — keep as-is.
    return list;
  }, [reviews, sortBy]);

  const avgRating = getAverageRating(reviews);
  const existingReview = editingReviewId
    ? reviews.find((r) => r.id === editingReviewId)
    : undefined;

  const showForm = formOpen || Boolean(existingReview);

  function handleSuccess() {
    setFormOpen(false);
    setEditingReviewId(null);
    onReviewSuccess();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <h2 className="text-lg font-bold text-text-primary">
          {t("reviewsTitle", { count: reviews.length })}
        </h2>
        <div className="flex items-center gap-2">
          <select
            aria-label={t("recentlyAdded")}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="cursor-pointer appearance-none rounded-md border border-line bg-page-gray px-3 py-2 text-xs font-medium text-text-secondary focus:outline-none"
          >
            <option value="recent">{t("recentlyAdded")}</option>
            <option value="high">{t("highestRating")}</option>
            <option value="low">{t("lowestRating")}</option>
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingReviewId(null);
              setFormOpen((open) => !open);
            }}
          >
            {formOpen ? tProduct("cancelEdit") : t("addReview")}
          </Button>
        </div>
      </div>

      {/* Overall rating summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <span className="text-3xl font-extrabold leading-none text-text-primary">
            {avgRating}
          </span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} star={star} avg={avgRating} />
            ))}
          </div>
        </div>
      )}

      {/* Write / edit review form (existing ReviewForm — unchanged logic) */}
      {showForm && (
        <div className="mt-4">
          <ReviewForm
            productId={productId}
            existingReview={existingReview}
            onSuccess={handleSuccess}
            onCancel={existingReview ? () => setEditingReviewId(null) : undefined}
          />
        </div>
      )}

      {/* Review list */}
      {sortedReviews.length > 0 && (
        <div className="divide-y divide-line">
          {sortedReviews.map((review) => {
            const own = isOwnReview(review);
            const displayName = maskName(review.user?.name) ?? tProduct("anonymous");

            return (
              <article key={review.id} className="py-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="truncate text-[11px] font-medium text-text-primary">
                    {displayName}
                  </span>
                  {own && editingReviewId !== review.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormOpen(false);
                        setEditingReviewId(review.id);
                      }}
                      className="flex items-center gap-1 text-[11px] text-text-muted transition hover:text-primary"
                    >
                      <Pencil className="size-3" aria-hidden />
                      {tProduct("editReview")}
                    </button>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} star={star} avg={review.rating} size="sm" />
                  ))}
                </div>

                {review.comment && (
                  <p dir="auto" className="mt-1.5 text-start text-xs leading-relaxed text-text-primary">
                    {review.comment}
                  </p>
                )}

                {review.images.length > 0 && (
                  <span className="mt-2 flex gap-2 overflow-x-auto">
                    {review.images.map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        alt={`Review image ${i + 1}`}
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-lg border border-line object-cover"
                        loading="lazy"
                      />
                    ))}
                  </span>
                )}

                <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1" aria-disabled>
                    <ThumbsUp className="size-3" aria-hidden />
                    {t("helpful", { count: 0 })}
                  </span>
                  <span>{t("reply")}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {reviews.length === 0 && !formOpen && (
        <div className="mt-4">
          <EmptyState
            size="compact"
            variant="orders"
            title={tProduct("noReviews")}
            description={tProduct("noReviewsDescription")}
          />
        </div>
      )}
    </div>
  );
}

function StarIcon({ star, avg, size = "md" }: { star: number; avg: number; size?: "sm" | "md" }) {
  return (
    <Star
      className={cn(
        size === "md" ? "size-4" : "size-3",
        star <= avg ? "fill-yellow-400 text-yellow-400" : "fill-border text-border",
      )}
    />
  );
}
