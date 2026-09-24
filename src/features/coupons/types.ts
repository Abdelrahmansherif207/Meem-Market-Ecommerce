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

export interface CouponAssignment {
  id: number;
  coupon_id: number;
  code: string;
  max_uses: number;
  used: number;
  remaining: number;
  expired: boolean;
  expires_at: string | null;
  assigned_at: string;
}

export interface CouponClaim {
  id: number;
  coupon_id: number;
  code: string;
  status: "active" | "redeemed" | "expired" | string;
  claimed_at: string;
  expires_at: string | null;
  redeemed_at: string | null;
}

export interface ClaimCouponResponse {
  success: boolean;
  data?: CouponClaim;
  message?: string;
  status?: number;
}

export interface MyCouponsData {
  assignments: CouponAssignment[];
  claims?: CouponClaim[];
}

export type MyCouponsResult =
  | { success: true; assignments: CouponAssignment[]; claims: CouponClaim[] }
  | { success: false; message?: string; status?: number };
