/**
 * Guest API endpoints. Every guest route lives under `/general/guest` — the
 * integration guide omits the `/general` segment, but the live API keeps it.
 */
export const GUEST_BASE = "/general/guest";
export const GUEST_CART = `${GUEST_BASE}/cart`;
export const GUEST_CART_ITEMS = `${GUEST_BASE}/cart/items`;
export const GUEST_CHECKOUT = `${GUEST_BASE}/checkout`;
export const GUEST_ORDERS = `${GUEST_BASE}/orders`;
export const GUEST_SESSION = `${GUEST_BASE}/session`;

export const guestCartLineEndpoint = (itemId: number): string =>
  `${GUEST_CART_ITEMS}/${itemId}`;

export const guestOrderEndpoint = (orderId: number): string =>
  `${GUEST_ORDERS}/${orderId}`;

export const guestOrderPaymentEndpoint = (orderId: number): string =>
  `${GUEST_ORDERS}/${orderId}/payment`;

export const guestOrderTokensEndpoint = (orderId: number): string =>
  `${GUEST_ORDERS}/${orderId}/access-tokens`;

export const GUEST_TRACK = `${GUEST_ORDERS}/track`;
export const GUEST_CANCEL = `${GUEST_ORDERS}/cancel`;
export const GUEST_CANCEL_REQUEST_OTP = `${GUEST_ORDERS}/cancel/request-otp`;
