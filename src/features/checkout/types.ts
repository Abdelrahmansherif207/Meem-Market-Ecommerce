export interface Address {
  city: string;
  state: string;
  country: string;
  street_address: string;
}

export type FulfillmentType = "delivery" | "pickup";
export type PaymentMethod = "online" | "cod" | "pay_at_cashier";

export interface EligiblePromotion {
  id: number;
  type: string;
  title: string;
  code: string;
  discount: number;
  gift_items: { id?: number; name?: string; image?: string }[];
}

export interface Governorate {
  id: number;
  name: string;
  country_id: number;
  status: boolean;
  is_fast_shipping_enabled: boolean;
}

export interface FastCheckoutRequest {
  name: string;
  user_phone: string;
  user_email: string;
  address: {
    address?: string;
    city: string;
    country: string;
  };
  notes?: string;
  governorate_id: number;
  selected_promotion_id?: number | null;
  selected_gift_product_id?: number | null;
}

export interface CheckoutRequest {
  name: string;
  user_phone: string;
  user_email: string;
  address: Address;
  notes?: string;
  fulfillment_type?: FulfillmentType;
  payment_method?: PaymentMethod;
  gateway?: string;
  governorate_id?: number;
  selected_promotion_id?: number | null;
  selected_gift_product_id?: number | null;
  pickup_location_id?: number | null;
}

export interface CheckoutResponse {
  url?: string;
  order_id?: number;
  transaction_uuid?: string;
  qr_code?: string;
}

export interface CheckoutFormData {
  name: string;
  user_phone: string;
  user_email: string;
  governorate_id: number | null;
  city: string;
  state: string;
  country: string;
  street_address: string;
  notes: string;
  fulfillment_type: FulfillmentType;
  payment_method: PaymentMethod;
  selected_promotion_id: number | null;
  selected_promotion_discount: number;
  selected_gift_product_id: number | null;
  shipping_fee: number;
}
