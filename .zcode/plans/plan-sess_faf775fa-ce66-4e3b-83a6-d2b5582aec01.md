## Coupons & Vouchers Section — dedicated homepage swiper

**Goal:** Replace the current placeholder (section type `"coupons"` → generic `CardSlider`, 5 cols, no borders) with a dedicated Coupons & Vouchers section: a Swiper showing **4 columns on desktop**, where each coupon card is bordered with its API-provided `borderColor` (and no border when `borderless: true`).

Data verified live: `/general/coupons` returns `{ id, name, slug, code, image: {desktop, mobile}, borderColor, borderless }` (10 coupons). Section title comes from the CMS section object, so no new translation keys are needed.

### New files
1. **`src/features/coupons/components/CouponsVouchersSection.tsx`** — async server section component (same pattern as `BrandsStripSection`): props `{ title, locale, setting?, endpoint? }`; fetches coupons via `homePageService.fetchSectionData<Coupon[]>(endpoint ?? "/general/coupons", locale)`; returns `null` on error/empty; renders the client swiper.
2. **`src/features/coupons/components/CouponsVouchersSwiper.tsx`** — `"use client"` Swiper following the established `CardSlider`/`PromotionsSectionClient` conventions: `key={locale}`, `dir` for RTL, Autoplay/Navigation modules, `setting.autoplay` + `setting.slider_speed`, lock-aware `BannerArrows`, `loop` when enough slides. Breakpoints: `1.3 → 480: 2 → 768: 3 → 1024: 4` (desktop 4 cols; `setting.columns_count` can override if the CMS sends one). Card: rounded, `aspect-3/4`, `border-2` with **inline `style={{ borderColor: coupon.borderColor }}`** when `!coupon.borderless` (inline style, not className — arbitrary hex from the API can't be a Tailwind class; matches `AvailableCoupons.tsx` precedent).
3. **`src/features/coupons/components/skeletons/CouponsVouchersSkeleton.tsx`** — title skeleton + 4 bordered `aspect-3/4` card skeletons.
4. **`src/features/coupons/index.ts`** — feature public surface exporting the section + skeleton (per AGENTS.md).

### Modified files
5. **`src/features/pages/components/SectionRenderer.tsx`** — split `case "coupons"` out of the `"flash-sales"` group: render `CouponsVouchersSection` with its own skeleton.
6. **`src/features/home/components/cardSlider/FlashSaleSection.tsx`** — remove the now-dead `type === "coupons"` mapping branch, the `ApiCoupon` import, and the `slidesPerView: type === "coupons" ? 5 : undefined` special case.

### Notes
- Cards are display-only (no click/copy action) — it's a homepage teaser; the interactive apply/copy flow already lives in the cart.
- The swiper requirement wins over the section's optional `layout=grid` setting.
- Verify with `npm run lint`, `tsc --noEmit`, and a visual check of the homepage on the dev server.