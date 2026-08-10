import { apiFetch, ApiError } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { SiteReview, SubmitSiteReviewPayload } from "../types";

/** The public endpoint is cached for 4 hours on the backend. */
const SITE_REVIEWS_CACHE_SECONDS = 60 * 60 * 4;

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function toNumber(value: unknown, fallback: number): number {
  const n = value === null || value === "" ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeReview(raw: unknown): SiteReview {
  const review = asRecord(raw);
  const customer = asRecord(review.customer);
  return {
    id: toNumber(review.id, 0),
    rating: toNumber(review.rating, 0),
    title: typeof review.title === "string" ? review.title : null,
    comment: typeof review.comment === "string" ? review.comment : "",
    customer: {
      id: toNumber(customer.id, 0),
      name: typeof customer.name === "string" ? customer.name : "",
    },
    created_at: typeof review.created_at === "string" ? review.created_at : "",
  };
}

export const siteReviewService = {
  /** GET /api/v1/general/site-reviews — public, approved reviews only, newest-first. */
  getSiteReviews: async (lang?: string): Promise<SiteReview[]> => {
    const response = await apiFetch<ApiResponse<SiteReview[]>>(
      "/general/site-reviews",
      {
        lang,
        next: { revalidate: SITE_REVIEWS_CACHE_SECONDS },
      },
    );
    const data = response?.data;
    if (!Array.isArray(data)) return [];
    return data.map(normalizeReview);
  },

  /**
   * POST /api/v1/general/site-reviews — requires auth. The review is always
   * created as `pending`. Only `rating`, `title`, and `comment` are sent.
   */
  submitSiteReview: async (
    payload: SubmitSiteReviewPayload,
    lang?: string,
  ): Promise<SiteReview> => {
    const response = await apiFetch<ApiResponse<unknown>>(
      "/general/site-reviews",
      {
        method: "POST",
        body: JSON.stringify({
          rating: payload.rating,
          ...(payload.title && payload.title.trim()
            ? { title: payload.title.trim() }
            : {}),
          comment: payload.comment.trim(),
        }),
        lang,
      },
    );
    return normalizeReview(response?.data);
  },

  isUnauthorizedError: (err: unknown): boolean =>
    err instanceof ApiError && err.status === 401,

  isValidationError: (err: unknown): boolean =>
    err instanceof ApiError && err.status === 422,
};