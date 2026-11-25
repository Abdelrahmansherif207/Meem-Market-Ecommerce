/**
 * Analytics feature — GTM + GA4 ecommerce tracking.
 *
 * Public surface (components must not touch `window.dataLayer` directly):
 * - `GtmScript` — mount once in the locale root layout.
 * - `track*` functions — typed GA4 ecommerce events.
 * - `useListImpression` / `useOncePerKeyEffect` — Strict Mode-safe triggers.
 * - Item mappers — convert store models to GA4 items.
 */

export { GtmScript } from "./components/GtmScript";
export { isGtmEnabled } from "./lib/dataLayer";
export {
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackRemoveFromCart,
  trackSearch,
  trackSelectItem,
  trackViewItem,
  trackViewCart,
  trackViewItemList,
  type GA4ListContext,
} from "./lib/ecommerce";
export { useListImpression, useOncePerKeyEffect } from "./hooks/useListImpression";
export {
  buildGA4Item,
  fromCartApiItem,
  fromCategoryProduct,
  fromGuestCartLine,
  fromGuestOrderItem,
  fromHydratedCartItem,
  fromOrderItem,
  fromProductCardItem,
  fromProductDetail,
  fromRelatedProduct,
  type GA4EcommerceItem,
  type GA4ItemInput,
} from "./lib/items";
