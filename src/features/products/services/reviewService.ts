import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";

export interface ReviewResponseData {
  id: number;
  rating: number;
  comment: string;
  images: string[];
}

export const reviewService = {
  create: (
    productId: number,
    payload: { rating: number; comment: string },
    lang?: string,
  ): Promise<ApiResponse<ReviewResponseData>> => {
    return apiFetch(`/general/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ ...payload, product_id: productId }),
      lang,
    });
  },

  update: (
    reviewId: number,
    payload: { rating?: number; comment?: string },
    lang?: string,
  ): Promise<ApiResponse<ReviewResponseData>> => {
    return apiFetch(`/general/products/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      lang,
    });
  },
};
