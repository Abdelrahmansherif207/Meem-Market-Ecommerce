import type {
  GuestCancelResult,
  GuestCancelOtpResult,
  GuestCart,
  GuestCartLine,
  GuestCartLineAttribute,
  GuestCheckoutResult,
  GuestOrder,
  GuestOrderAddress,
  GuestOrderItem,
  GuestOrderTokensResult,
  GuestPaymentResult,
  GuestPickupLocationSummary,
  GuestSessionData,
  GuestShippingMethod,
  GuestTrackResult,
  GuestTrackTimelineEntry,
} from "../types";

/**
 * Contract adapter for guest payloads.
 *
 * The checked-in OAS (2026-11-12) and the newer integration guide disagree on
 * several field names, and the live API may return either revision depending
 * on the deployment. Normalizers accept both and always produce the canonical
 * models in `../types`. Keeping this layer permanent is deliberate: field
 * renames then have exactly one place to change.
 */

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pick(obj: JsonRecord | null, keys: readonly string[]): unknown {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function str(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function bool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

/** Unwraps `{ data: ... }` envelopes, then optional `{ cart }` / `{ order }`. */
function unwrap(payload: unknown, key: "cart" | "order"): JsonRecord | null {
  const root = asRecord(payload);
  if (!root) return null;

  if (root[key] === null) return null;
  const direct = asRecord(root[key]);
  if (direct) return direct;

  const data = asRecord(root.data);
  if (data) {
    if (data[key] === null) return null;
    const nested = asRecord(data[key]);
    if (nested) return nested;
    return data;
  }

  return root;
}

function normalizeShippingMethod(
  value: unknown,
  fallback: GuestShippingMethod = "scheduled",
): GuestShippingMethod {
  const raw = str(value)?.toLowerCase();
  if (!raw) return fallback;
  if (["fast", "fast-shipping", "fast_shipping", "now", "express"].includes(raw)) {
    return "fast";
  }
  if (["scheduled", "home", "standard"].includes(raw)) return "scheduled";
  return fallback;
}

function normalizeAttributes(value: unknown): GuestCartLineAttribute[] {
  return asArray(value).flatMap((entry) => {
    const record = asRecord(entry);
    if (!record) return [];
    const attribute =
      str(record.attribute) ?? str(record.attribute_name) ?? str(record.name);
    const attributeValue = str(record.value);
    if (!attribute || !attributeValue) return [];
    return [{ attribute, value: attributeValue }];
  });
}

function productRecord(line: JsonRecord): JsonRecord | null {
  return asRecord(line.product);
}

function productImage(line: JsonRecord): string {
  const product = productRecord(line);
  const image = product?.image;

  if (typeof image === "string") return image;
  const imageRecord = asRecord(image);
  if (imageRecord) {
    const thumbnail = str(imageRecord.thumbnail);
    if (thumbnail) return thumbnail;
    const original = imageRecord.original;
    if (typeof original === "string") return original;
    const originalRecord = asRecord(original);
    if (originalRecord) {
      const first = Object.values(originalRecord).find(
        (candidate) => typeof candidate === "string",
      );
      if (typeof first === "string") return first;
    }
  }

  return (
    str(product?.thumbnail) ??
    str(line.thumbnail) ??
    str(line.image) ??
    ""
  );
}

function productName(line: JsonRecord): string {
  const product = productRecord(line);
  return (
    str(product?.name) ??
    str(line.product_name) ??
    str(line.name) ??
    "Product"
  );
}

function productSlug(line: JsonRecord): string {
  const product = productRecord(line);
  return str(product?.slug) ?? str(line.slug) ?? "";
}

function productSku(line: JsonRecord): string {
  const product = productRecord(line);
  return str(product?.sku) ?? str(line.sku) ?? "";
}

function normalizeCartLine(
  raw: unknown,
  fallbackMethod: GuestShippingMethod,
): GuestCartLine | null {
  const line = asRecord(raw);
  if (!line) return null;

  const productId = num(pick(line, ["product_id", "productId"]));
  if (productId === null) return null;

  const quantity = Math.max(0, Math.trunc(num(line.quantity) ?? 0));
  const unitPrice =
    num(pick(line, ["unit_price", "unitPrice", "price", "current_price"])) ?? 0;
  const subtotal =
    num(pick(line, ["subtotal", "sub_total", "total_price", "total"])) ??
    unitPrice * quantity;

  return {
    id: num(pick(line, ["id", "cart_item_id", "item_id"])) ?? 0,
    productId,
    productVariantId: num(pick(line, ["product_variant_id", "variant_id"])),
    quantity,
    unitPrice,
    subtotal,
    shippingMethod: normalizeShippingMethod(line.shipping_method, fallbackMethod),
    name: productName(line),
    slug: productSlug(line),
    image: productImage(line),
    sku: productSku(line),
    attributes: normalizeAttributes(line.attributes),
    isAvailable: bool(pick(line, ["is_available", "available", "in_stock"])) ?? true,
    unavailableReason:
      str(line.unavailable_reason) ?? str(line.availability_reason),
  };
}

export function normalizeGuestCart(payload: unknown): GuestCart | null {
  const root = asRecord(payload);
  if (!root) return null;

  const cart = unwrap(payload, "cart");
  if (!cart) return null;

  const flatItems = asArray(cart.items);
  const lines: GuestCartLine[] = [];

  for (const item of flatItems) {
    const line = normalizeCartLine(item, "scheduled");
    if (line) lines.push(line);
  }

  // Legacy/authenticated-style grouping used by older guest builds.
  for (const item of asArray(cart.normal_items)) {
    const line = normalizeCartLine(item, "scheduled");
    if (line) lines.push(line);
  }
  for (const item of asArray(cart.fast_items)) {
    const line = normalizeCartLine(item, "fast");
    if (line) lines.push(line);
  }

  const derivedSubtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const subtotal =
    num(pick(cart, ["subtotal", "sub_total"])) ?? derivedSubtotal;
  const shippingCost =
    num(pick(cart, ["shipping_cost", "shipping_price", "shipping_fee"])) ?? 0;
  const total =
    num(pick(cart, ["total", "total_price", "total_after_coupon"])) ??
    subtotal + shippingCost;
  const declaredQuantity = num(pick(cart, ["total_quantity"]));
  const totalQuantity =
    declaredQuantity !== null && declaredQuantity > 0
      ? Math.trunc(declaredQuantity)
      : lines.reduce((sum, line) => sum + line.quantity, 0);

  return {
    id: num(cart.id) ?? 0,
    items: lines,
    subtotal,
    shippingCost,
    total,
    totalQuantity,
    currency: str(pick(cart, ["currency", "currency_code"])),
    expiresAt: str(pick(cart, ["guest_expires_at", "expires_at"])),
  };
}

/** `payment-pending` / `pending_payment` → `pending`; keeps other states. */
export function normalizeStatus(value: unknown, fallback = "pending"): string {
  const raw = str(value)?.toLowerCase();
  if (!raw) return fallback;
  return raw.replace(/^payment[-_]/, "").replace(/\s+/g, "_");
}

function normalizeOrderItem(raw: unknown): GuestOrderItem | null {
  const item = asRecord(raw);
  if (!item) return null;

  const quantity = Math.max(0, Math.trunc(num(item.quantity) ?? 0));
  const unitPrice =
    num(
      pick(item, [
        "unit_price",
        "price",
        "converted_unit_price",
        "current_price",
      ]),
    ) ?? 0;
  const total =
    num(
      pick(item, [
        "total_price",
        "total",
        "subtotal",
        "sub_total",
        "converted_total_price",
      ]),
    ) ??
    unitPrice * quantity;

  return {
    id: num(pick(item, ["id", "order_item_id"])) ?? 0,
    productId: num(pick(item, ["product_id", "productId"])) ?? 0,
    quantity,
    unitPrice,
    total,
    name: productName(item),
    image: productImage(item),
    slug: productSlug(item),
    variantLabel: variantLabel(item),
  };
}

function variantLabel(item: JsonRecord): string | null {
  const attributes = normalizeAttributes(item.attributes);
  if (attributes.length > 0) {
    return attributes.map((a) => `${a.attribute}: ${a.value}`).join(" / ");
  }
  const variant = asRecord(item.variant);
  if (variant) {
    const label =
      str(variant.name) ?? str(variant.label) ?? str(variant.value);
    if (label) return label;
    const variantAttributes = normalizeAttributes(variant.attributes);
    if (variantAttributes.length > 0) {
      return variantAttributes.map((a) => `${a.attribute}: ${a.value}`).join(" / ");
    }
  }
  return str(item.variant_name);
}

function normalizeAddress(value: unknown): GuestOrderAddress | null {
  if (typeof value === "string") {
    const street = str(value);
    return street ? { street, city: "", building: null, details: null } : null;
  }
  const address = asRecord(value);
  if (!address) return null;

  const street =
    str(pick(address, ["street", "street_address", "address", "line1"])) ?? "";
  const city = str(pick(address, ["city", "state", "town"])) ?? "";
  const building = str(address.building);
  const details = str(pick(address, ["details", "additional_details", "notes"]));

  if (!street && !city && !building && !details) return null;
  return { street, city, building, details };
}

function normalizePickupLocation(value: unknown): GuestPickupLocationSummary | null {
  const pickup = asRecord(value);
  if (!pickup) return null;
  const name = str(pick(pickup, ["store_name", "name"]));
  if (!name) return null;
  return {
    name,
    address: str(pickup.address),
    phone: str(pickup.phone),
  };
}

export function normalizeGuestOrder(payload: unknown): GuestOrder {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;
  const order = asRecord(data.order) ?? data;

  const items = asArray(
    pick(order, ["order_items", "items", "products", "orderItems"]),
  )
    .map(normalizeOrderItem)
    .filter((item): item is GuestOrderItem => item !== null);

  const derivedSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shippingPrice =
    num(
      pick(order, ["shipping_price", "shipping_cost", "shipping_fee", "shipping"]),
    ) ?? 0;
  const fastShippingFee =
    num(pick(order, ["fast_shipping_fee", "fast_delivery_fee"])) ?? 0;
  const discount =
    num(pick(order, ["discount", "coupon_discount", "promotion_discount"])) ?? 0;
  const subtotal =
    num(pick(order, ["subtotal", "sub_total"])) ?? derivedSubtotal;
  const total =
    num(pick(order, ["total", "total_price", "total_after_coupon"])) ??
    subtotal + shippingPrice + fastShippingFee - discount;

  const customerName =
    str(pick(order, ["customer_name", "name", "user_name"])) ??
    str(asRecord(order.user)?.name);
  const customerPhone =
    str(pick(order, ["customer_contact", "user_phone", "phone", "customer_phone"])) ??
    str(asRecord(order.user)?.phone);
  const customerEmail =
    str(pick(order, ["user_email", "customer_email", "email"])) ??
    str(asRecord(order.user)?.email);

  const canCancel =
    bool(pick(data, ["can_cancel", "canCancel"])) ??
    bool(pick(order, ["can_cancel", "canCancel"])) ??
    false;

  return {
    id: num(pick(order, ["id", "order_id"])) ?? 0,
    orderNumber: str(pick(order, ["order_number", "number", "code"])) ?? "",
    status: normalizeStatus(pick(order, ["status"]), "pending"),
    paymentStatus: normalizeStatus(
      pick(order, ["payment_status", "paymentStatus"]),
      "pending",
    ),
    fulfillmentStatus: normalizeStatus(
      pick(order, ["fulfillment_status", "fulfillmentStatus"]),
      "pending",
    ),
    paymentMethod:
      str(pick(order, ["payment_method", "paymentMethod"])) ?? "online",
    fulfillmentType:
      str(pick(order, ["fulfillment_type", "fulfillmentType"])) ?? "delivery",
    shippingType: str(pick(order, ["shipping_type", "shippingType"])),
    subtotal,
    shippingPrice,
    fastShippingFee,
    discount,
    total,
    currency: str(pick(order, ["currency", "currency_code"])),
    createdAt:
      str(pick(order, ["created_at", "createdAt", "placed_at"])) ?? "",
    notes: str(order.notes),
    customerName,
    customerPhone,
    customerEmail,
    address: normalizeAddress(
      pick(order, ["shipping_address", "address", "delivery_address"]),
    ),
    pickupLocation: normalizePickupLocation(
      pick(order, ["pickup_location", "pickupLocation"]),
    ),
    items,
    canCancel,
  };
}

export function normalizeGuestCheckout(payload: unknown): GuestCheckoutResult {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;
  const payment = asRecord(data.payment);

  return {
    order: normalizeGuestOrder(data),
    trackingToken: str(pick(data, ["tracking_token", "trackingToken"])),
    cancellationToken: str(
      pick(data, ["cancellation_token", "cancellationToken"]),
    ),
    payment: {
      method: str(payment?.method) ?? "",
      gateway: str(payment?.gateway),
      next: str(payment?.next) ?? "",
      redirectUrl:
        str(payment?.redirect_url) ??
        str(payment?.url) ??
        str(data.redirect_url),
    },
    idempotentReplay: bool(data.idempotent_replay) ?? false,
  };
}

export function normalizeGuestPayment(payload: unknown): GuestPaymentResult {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return {
    url:
      str(data.redirect_url) ??
      str(data.url) ??
      str(data.payment_url) ??
      null,
    orderId: num(pick(data, ["order_id", "orderId", "id"])) ?? 0,
    paymentMethod: str(pick(data, ["payment_method", "method"])) ?? "online",
    gateway: str(data.gateway),
    zeroValue: bool(data.zero_value) ?? false,
  };
}

export function normalizeGuestTrack(payload: unknown): GuestTrackResult {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;
  const order = asRecord(data.order) ?? {};

  const timeline: GuestTrackTimelineEntry[] = asArray(data.timeline).flatMap(
    (raw) => {
      const entry = asRecord(raw);
      if (!entry) return [];
      const timestamp =
        str(pick(entry, ["timestamp", "created_at", "date", "at"])) ?? "";
      if (!timestamp) return [];
      return [
        {
          timestamp,
          title: str(entry.title),
          status: str(entry.status),
          description: str(entry.description),
        },
      ];
    },
  );

  return {
    order: {
      orderNumber:
        str(pick(order, ["order_number", "number", "code"])) ?? "",
      status: normalizeStatus(order.status, "pending"),
      paymentStatus: normalizeStatus(order.payment_status, "pending"),
      fulfillmentStatus: normalizeStatus(order.fulfillment_status, "pending"),
      createdAt: str(pick(order, ["created_at", "createdAt"])) ?? "",
      lastUpdatedAt:
        str(pick(order, ["last_updated_at", "updated_at", "updatedAt"])) ?? "",
    },
    timeline,
    trackingExpiresAt: str(
      pick(data, ["tracking_expires_at", "trackingExpiresAt"]),
    ),
  };
}

export function normalizeGuestCancel(payload: unknown): GuestCancelResult {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;
  const order = asRecord(data.order) ?? data;

  return {
    order: {
      orderNumber: str(pick(order, ["order_number", "number"])) ?? "",
      status: normalizeStatus(order.status, "cancelled"),
    },
  };
}

export function normalizeGuestCancelOtp(
  payload: unknown,
): GuestCancelOtpResult {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return {
    otpId: str(pick(data, ["otp_id", "otpId"])),
    provider: str(data.provider),
    phone: str(pick(data, ["phone", "masked_phone", "phone_number"])),
  };
}

export function normalizeGuestOrderTokens(
  payload: unknown,
): GuestOrderTokensResult {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  return {
    orderId: num(pick(data, ["order_id", "orderId"])),
    trackingToken: str(pick(data, ["tracking_token", "trackingToken"])),
    trackingRevoked: bool(
      pick(data, ["tracking_revoked", "trackingRevoked"]),
    ) ?? false,
    cancellationToken: str(
      pick(data, ["cancellation_token", "cancellationToken"]),
    ),
    trackingExpiresAt: str(
      pick(data, ["tracking_expires_at", "trackingExpiresAt"]),
    ),
  };
}

export function normalizeGuestSession(payload: unknown): GuestSessionData {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;
  const guest = asRecord(data.guest) ?? {};
  const cookies = asRecord(data.cookies) ?? {};

  return {
    expiresAt: str(pick(guest, ["expires_at", "expiresAt"])),
    csrfToken: str(pick(data, ["csrf_token", "csrfToken"])),
    cookies: {
      sessionName: str(
        pick(cookies, ["name", "session_cookie", "session_cookie_name"]),
      ),
      csrfName: str(pick(cookies, ["csrf_name", "csrf_cookie", "csrf_cookie_name"])),
      csrfHeader:
        str(pick(cookies, ["csrf_header", "csrf_header_name"])) ?? "X-CSRF-Token",
    },
  };
}

/** Helpers shared with the UI. */
export function isGuestOrderCancelled(order: GuestOrder): boolean {
  return order.status === "cancelled";
}

export function isGuestOrderPaid(order: GuestOrder): boolean {
  return ["paid", "completed", "captured"].includes(order.paymentStatus);
}

export function isGuestPaymentPending(order: GuestOrder): boolean {
  if (order.paymentMethod !== "online") return false;
  if (isGuestOrderCancelled(order)) return false;
  return !isGuestOrderPaid(order) && order.paymentStatus !== "failed";
}

export { normalizeShippingMethod, normalizeAttributes };
