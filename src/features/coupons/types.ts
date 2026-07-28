export interface CouponImage {
  desktop: string;
  mobile: string;
}

export interface Coupon {
  id: number;
  name: string;
  slug: string;
  code: string;
  image: CouponImage;
  borderColor: string;
  borderless: boolean;
}

export interface AppliedCoupon {
  code: string;
  name?: string;
  discount_amount: number;
  discount_type?: "percentage" | "fixed";
}

export interface ApplyCouponResponse {
  success: boolean;
  message?: string;
  data?: AppliedCoupon;
  status?: number;
}
