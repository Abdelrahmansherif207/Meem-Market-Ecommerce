"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useLocale, useTranslations } from "next-intl";
import { User } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { siteReviewService } from "../services/siteReviewService";
import type { SiteReview } from "../types";
import { formatRelativeDate } from "../utils";
import { SiteReviewsSkeleton } from "./SiteReviewsSkeleton";
import { StarRating } from "./StarRating";

type WallState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; reviews: SiteReview[] };

type WallAction =
  | { type: "LOADING" }
  | { type: "ERROR" }
  | { type: "READY"; reviews: SiteReview[] };

function wallReducer(state: WallState, action: WallAction): WallState {
  switch (action.type) {
    case "LOADING":
      return { status: "loading" };
    case "ERROR":
      return { status: "error" };
    case "READY":
      return { status: "ready", reviews: action.reviews };
    default:
      return state;
  }
}

export function SiteReviewsWall() {
  const t = useTranslations("siteReviews");
  const locale = useLocale();
  const [state, dispatch] = useReducer(wallReducer, { status: "loading" });

  const load = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      const data = await siteReviewService.getSiteReviews(locale);
      dispatch({ type: "READY", reviews: data });
    } catch {
      dispatch({ type: "ERROR" });
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") return <SiteReviewsSkeleton />;

  if (state.status === "error") {
    return (
      <ErrorState
        variant="serverError"
        compact
        title={t("loadError")}
        actions={<RetryButton label={t("retry")} onClick={load} />}
      />
    );
  }

  if (state.reviews.length === 0) {
    return (
      <EmptyState
        size="compact"
        variant="default"
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {state.reviews.map((review) => (
        <article key={review.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {review.customer.name}
                </p>
                <StarRating rating={review.rating} />
              </div>
            </div>

            {review.created_at && (
              <time className="shrink-0 text-xs text-text-secondary">
                {formatRelativeDate(review.created_at, locale)}
              </time>
            )}
          </div>

          {review.title && (
            <h3 className="mt-3 text-sm font-semibold text-text-primary">{review.title}</h3>
          )}

          {review.comment && (
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              {review.comment}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}