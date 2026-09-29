export interface Address {
  city: string;
  state: string;
  country: string;
  street_address: string;
}

export type FulfillmentType = "delivery" | "pickup";
export type PaymentMethod = "online" | "cod" | "pay_at_cashier";

/**
 * Machine identifiers for the order-flow shipping types. Never translated;
 * UI copy lives in `checkout.shippingType.*` messages.
 */
export type ShippingType = "local" | "international";

export interface LocalizedText {
  en?: string;
  ar?: string;
}

export type FlowWidgetType = "text" | "number" | "boolean" | "date" | "select" | "multi_select";

export type FlowOptionSource = "countries" | "governorates" | "warehouses" | "pickup_locations";

export interface OrderFlowInput {
  key: string;
  type: FlowWidgetType;
  label: LocalizedText;
  placeholder?: LocalizedText | null;
  help_text?: LocalizedText | null;
  required?: boolean;
  /** e.g. "checkout" or "transition:<code>" — only "checkout" is enforced client-side. */
  required_at?: string | null;
  source?: FlowOptionSource | null;
  sort_order?: number;
}

export interface OrderFlowStatus {
  code: string;
  name?: LocalizedText | null;
}

export interface OrderFlowDefinition {
  code: string;
  name?: LocalizedText | null;
  shipping_type: ShippingType;
  is_default?: boolean;
  is_active?: boolean;
  statuses?: OrderFlowStatus[];
  inputs?: OrderFlowInput[];
}

export type FlowValue = string | number | boolean | string[];
export type FlowValues = Record<string, FlowValue>;

/** External sort/widget contract: `"local" | "international"` labels come from messages. */
export const SHIPPING_TYPE_CODES: ShippingType[] = ["local", "international"];

/** Normalizes any localized object/mixed payload to a display string with en↔ar fallback. */
export function localizedText(value: LocalizedText | string | null | undefined, locale: string): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const primary = locale === "ar" ? value.ar : value.en;
  const fallback = locale === "ar" ? value.en : value.ar;
  return (primary || fallback || "").toString();
}

export interface FlowOption {
  id: string;
  name: string;
}

export interface PaymentGatewayOption {
  code: string;
  display_name: string;
  supported_currencies?: string[];
  supports_catalog_currency: boolean;
}

export interface EligiblePromotion {
  id: number;
  type: string;
  title: string;
  code: string;
  discount: number;
  gift_items: { id?: number; name?: string; image?: string }[];
}

export interface GovernorateShippingPrice {
  id: number;
  governorate_id: number;
  price: number;
  estimated_days: number;
  free_shipping_over: number;
  status: boolean;
}

export interface Governorate {
  id: number;
  name: string;
  country_id: number;
  status: boolean;
  is_fast_shipping_enabled: boolean;
  shipping_price?: GovernorateShippingPrice | null;
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
  gateway?: string;
  selected_promotion_id?: number | null;
  selected_gift_product_id?: number | null;
  shipping_type?: ShippingType;
  flow_values?: FlowValues;
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
  shipping_type?: ShippingType;
  /**
   * Only sent when the chosen flow defines checkout-required inputs. Keys must
   * exist among the flow's active inputs; select/multi_select values must be
   * active ids from their source.
   */
  flow_values?: FlowValues;
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
  shipping_type: ShippingType;
}
