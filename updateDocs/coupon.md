## Changes

### New Feature: `src/features/coupons/`

**types.ts**
- `CouponImage` — `{ desktop: string; mobile: string }`
- `Coupon` — `{ id, name, slug, image: CouponImage, borderColor, borderless }`
- `AppliedCoupon` — `{ code, discount_amount, discount_type? }`
- `ApplyCouponResponse` — `{ success, message?, data?: AppliedCoupon }`

**services/couponService.ts**
- `getCoupons(locale)` → `GET /general/coupons`
- `applyCoupon(code, locale)` → `POST /general/coupons/apply` with `{ code }` — wraps error into `ApplyCouponResponse`

### Components

**CouponInput.tsx** — `"use client"` component with:
- Text input + "Apply" button
- **Loading:** Button shows spinner, input disabled
- **Success:** Green "Coupon applied!" message, input hidden, `CouponBadge` shown
- **Already applied:** Blue info message with icon
- **Invalid/expired:** Red error below input
- **Network error:** Red error with "Try again" link

**CouponBadge.tsx** — `"use client"` inline badge showing:
- Coupon code (bold, green)
- Discount amount (percentage or fixed)
- Remove (X) button that clears the coupon
- Green background with border

**AvailableCoupons.tsx** — `"use client"` horizontal scrollable list:
- Fetches from `GET /general/coupons` on mount
- **Loading:** 3 `CouponCardSkeleton` placeholders
- **Empty:** Section hidden
- **Error:** Section hidden with `console.warn`
- Each card: coupon image (click to auto-fill), name, "Copy code" button
- Cards styled with `borderColor` from coupon data

**Skeletons:**
- `CouponCardSkeleton` — `aspect-[3/4]` card + text skeleton
- `CouponInputSkeleton` — input + button skeletons

### Integration: Cart Page

**CartSummary.tsx**
- Added `appliedCoupon`, `couponDiscount`, `onCouponRemove` props
- Renders `<CouponInput />` when no coupon applied (above the total line)
- Shows discount line item (`-X.XX K.D`) when coupon discount > 0
- Total is calculated as `subtotal - couponDiscount`

**CartPageContent.tsx**
- Added `appliedCoupon` state (`useState<AppliedCoupon | null>`)
- Computes `couponDiscount` from `appliedCoupon.discount_amount`
- Passes `appliedCoupon` and `couponDiscount` to `CartSummary`
- Renders `<AvailableCoupons />` below cart items

## API Notes
- `POST /general/coupons/apply` requires authentication (returns `"Unauthenticated"` for guests)
- No valid coupon codes could be tested — the success response shape is inferred. Error messages are parsed generically (`INVALID` → "Invalid coupon code", `ALREADY_APPLIED` → "Coupon already applied", `expired` → "Coupon has expired")
- `DELETE /general/coupons/apply` returns "Method Not Allowed" — removing a coupon may require a different endpoint or is handled on the backend automatically

## Endpoint: `GET /general/coupons/available` (personalized, paginated)

Advisory shelf of coupons the logged-in customer can use; the real check still
happens at apply/checkout.

- Query: `page` (min 1) and `limit` (1–50) — both optional, defaults `1`/`15`.
  Backend 422s with `errors.{page|limit}` on out-of-range values (`page=0`,
  `limit=51` verified).
- 200 envelope: `ApiResponse<{ data: AvailableCoupon[]; meta }>` where
  `meta = { current_page, per_page, total, has_more_pages }`.
- **Warning: `meta.total` counts only the items on the current page** (verified:
  15 items on page 1, 4 on page 2) — never use it for "are there more?"
  decisions; rely on `has_more_pages` exclusively.
- Errors: 401 `{"message":"Unauthenticated"}` without token.

### Verified item shape (2026-09-27)

```json
{ "id": 20, "name": "Happy Hour", "slug": "happy-hour", "image": null,
  "visibility": "public", "claim_status": "not_required", "requires_claim": false,
  "code": "HAPPY30", "claim_id": null, "expires_at": "2026-10-23T00:00:00+00:00",
  "action": "apply" }
```

Mixed shelf semantics:
- `visibility: "public"` → `code` is present, `action: "apply"` (copy/apply now)
- `visibility: "targeted"` → `code: null`, `requires_claim: true`,
  `claim_status: "claimable"`, `action: "claim"` (claim first, then the code
  shows up in `/general/coupons/mine` claims)

### Claim flow (verified 2026-09-27)

`POST /general/coupons/{id}/claim` → **201**:

```json
{ "status": 201, "message": "Coupon claimed successfully.", "success": true,
  "data": { "id": 5, "coupon_id": 27, "code": "COUPON_ODQEDZP",
    "status": "active", "claimed_at": "2026-09-27T11:35:24+00:00",
    "expires_at": null, "redeemed_at": null } }
```

After a successful claim, the item in `GET /general/coupons/available` mutates:

| Field | Before | After |
| --- | --- | --- |
| `claim_status` | `"claimable"` | `"claimed"` |
| `claim_id` | `null` | set (e.g. `3`) |
| `action` | `"claim"` | `"apply"` (**misleading** — `code` stays `null`) |
| `code` | `null` | still `null` (real code lives in the 201 + `/mine`) |

**UI must classify off `claim_status`/`claim_id`, never `action`** — otherwise
the post-claim card renders as an apply card with no code (dead button).
The generated per-customer code only appears in the 201 response and in
`GET /general/coupons/mine` → `claims[]` (plus profile `MyClaimsList`).

Shelf behavior in `MyAvailableCoupons`:
- Claim idle → spinner → green **Claimed** badge + "Copy Code" seeded from the
  201 `data.code`; failure shows an inline red error and the card stays claimable
- Items with `claim_status: "claimed"` (from earlier sessions/remounts) render
  claimed; their copy button appears only once a code is known client-side
- Note: `claim_status: "claimed"` items keep appearing in `/available` responses —
  the shelf does not filter them out

### Implementation (feature-first)

- `src/shared/types/index.ts` — `PageMeta` (generic pagination envelope; `total`
  may be page-scoped, prefer `has_more_pages`)
- `src/shared/hooks/usePaginatedFetch.ts` — generic page/limit hook driven only
  by `has_more_pages`; inflight/duplicate-page guards; consumers own the domain
- `src/features/coupons/types.ts` — `AvailableCoupon`, `AvailableCouponsData`,
  `AvailableCouponsResult`, `AvailableCouponAction`
- `src/features/coupons/services/couponService.ts` — `getAvailableCoupons(locale, page=1, limit=15)`
  (clamped params, `no-store`; throws `ApiError` instead of returning a union —
  required by the shared hook contract)
- `src/features/coupons/hooks/useAvailableCoupons.ts` — auth-gated wrapper around
  `usePaginatedFetch`; splits items into `applyCoupons` / `claimCoupons` /
  `claimedCoupons` (claimed = `claim_status === "claimed" || claim_id != null`)
- `src/features/coupons/components/MyAvailableCoupons.tsx` — "Coupons For You"
  shelf on the cart page (above the public `AvailableCoupons`): copy code +
  apply for `action: "apply"`, claim → spinner → Claimed badge + Copy Code for
  claimables, inline claim errors, "Show More" appends pages while
  `has_more_pages`; hidden while loading/empty/error
- `messages/{en,ar}.json` — `coupons.personalizedTitle`, `copyCode`, `copied`,
  `expiresSoon`, `showMore`, `claim`, `claimed`, `claimFailed`
