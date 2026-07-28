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
