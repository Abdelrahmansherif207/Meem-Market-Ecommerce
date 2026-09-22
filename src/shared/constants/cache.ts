/**
 * Shared Data Cache TTLs (seconds) for API endpoints that remain time-based.
 *
 * Price-bearing and CMS-driven endpoints (home sections, products, category
 * grids) bypass this table entirely — they use `cache: "no-store"` so guests
 * always see fresh data. Only slow-changing catalog/metadata endpoints are
 * cached here.
 */
export const CACHE_TTL = {
  /** Never cache (Data Cache disabled). */
  NONE: 0,
  /** Default content endpoints: settings, static pages, coupons, tags, flash-sale lists. */
  STANDARD: 60,
  /** Featured categories on home. */
  FEATURED: 120,
  /** Navigation-critical data: category menu, currencies, navbar. */
  NAV: 120,
  /** Public site reviews (backend caches them for hours). */
  REVIEWS: 900,
} as const;
