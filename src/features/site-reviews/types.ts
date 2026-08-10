export interface SiteReviewCustomer {
  id: number;
  name: string;
}

/**
 * Public (approved) site review. Never contains `status`, `moderator`,
 * `moderated_by`, or `moderated_at` — those keys are not in the payload.
 */
export interface SiteReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string;
  customer: SiteReviewCustomer;
  created_at: string;
}

export interface SubmitSiteReviewPayload {
  rating: number;
  title?: string;
  comment: string;
}