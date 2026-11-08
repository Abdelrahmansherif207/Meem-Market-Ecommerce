# Catch Beauty Homepage — CMS Verification Report

**Date:** 2026-11-08
**Storefront:** `http://localhost:3100` (production build, EN + AR)
**CMS API:** `https://catch.mohammedtareq.me/api/v1`
**Scope:** CMS-driven homepage sections, Tier One front settings, real hero support,
flash-sale selection, localized copy, and end-to-end API + HTML verification.

> This report describes the current implementation. The older
> `docs/homepage/section-mapping.md` documents Phase 4 and is partially
> outdated (it still says 19 sections, tags disabled, and the CMS slider
> permanently replaced). This report supersedes those statements for the
> 2026-11-08 verification pass.

---

## 1. Result Summary

| Area | Result |
|---|---|
| TypeScript | `npx tsc --noEmit` — 0 errors |
| ESLint | 0 errors, 3 pre-existing warnings |
| Production build | Passed (44 routes) |
| Public homepage | 17 sections in EN and AR |
| Back-setting preservation | 0 issues; only approved date keys changed |
| EN HTML audit | Passed all checks |
| AR HTML audit | Passed all checks |
| Flash-sale data | Renders `black-friday` (12 products), not the expired sale |
| Real `hero` type | Frontend ready; **blocked by backend registration** |

The homepage is now genuinely CMS-driven for the tested settings: section
visibility, titles, subtitles, badges, columns, timer, category shape, brand
layout, and shelf layout all change the rendered storefront.

---

## 2. Errors Found and Fixed

### 2.1 Expired flash sale was selected

**Symptom:** The Flash Deals section rendered `this-week-mega-discount`
(11 products), whose `end_date` was `2026-11-08T00:00:00Z` — already expired
when the final verification ran. The CMS timer, however, pointed at
`2026-12-05T00:00`.

**Root cause:** `CatchFlashSaleSection` always used `flashSales[0]`, the first
sale in CMS order, without checking `end_date`.

**Fix:** Added `selectActiveFlashSale()`:

1. Filter out sales whose `end_date` is in the past.
2. Prefer the active sale whose end date falls on the same local calendar day
   as the CMS `timer_end_at`.
3. Fall back to the first remaining active sale.

**Evidence:** The rendered flash list now exactly matches `black-friday`:
12 product slugs in the same order (`kiko-unlimited-double-touch-lipstick-121`
through `mesauda-vain-brows-eyebrow-pencil-104-dark`).

### 2.2 CMS badges were not visible on flash-active products

**Symptom:** `badge_text` was stored as `{ en: "LOVE", ar: "حب" }` and
`{ en: "FLASH SALE", ar: "عرض سريع" }`, but the Valentine banner cards showed
only the automatic “Flash deal” countdown chip. A visible-text audit found
`LOVE` zero times in the rendered page.

**Root cause:** `ProductCard` checked `item.flashSaleActive` first and rendered
the countdown chip, so the CMS badge was only used when the product was not
flash-sale-active.

**Fix:** Merchant-defined `badge_text` now takes precedence:

- CMS badge → rendered when supplied.
- Otherwise flash-sale countdown chip (when `flashSaleActive`).
- Otherwise automatic low-stock chip.

**Evidence after fix:** `LOVE` renders 18 times and `حب` 20 times in EN/AR HTML
(9 banner cards × two streamed copies, plus the Arabic fallback copy);
`FLASH SALE` / `عرض سريع` render 44 times in each locale.

### 2.3 Localized CMS objects were treated as plain strings

**Symptom:** The backend returns localized copy as `{ en, ar }`, but several
section components declared `badge_text?: string` and passed the object
straight into card props.

**Root cause:** The frontend section contract had no localized-text type.

**Fix:** Added `LocalizedText` and `resolveLocalizedText()` with this fallback
order:

1. Active locale (`en` or `ar`).
2. The other locale.
3. Static message fallback.

Applied to badges, subtitles, action labels, hero copy, and tags. Plain strings
remain supported for backwards compatibility.

### 2.4 Invalid countdown target rendered broken timer output

**Symptom:** A missing/null/invalid `timer_end_at` could produce a timer with
zeroed or invalid values.

**Root cause:** `useCountdown` parsed the target with `new Date(...)` and never
exposed whether parsing succeeded. `CatchCountdown` only checked `isExpired`.

**Fix:** `useCountdown` now returns `hasValidTarget`; `CatchCountdown` returns
`null` when the target is invalid. The timer is hidden instead of showing
misleading numbers.

### 2.5 Empty section titles produced empty `<h2>` elements

**Symptom:** A section with no title emitted `<h2></h2>`.

**Fix:** `SectionHeader` suppresses the `<h2>` when the title is empty.
`CatchShelfIsland` also decouples the header action (e.g. countdown) from title
rendering.

### 2.6 `shape: "circle"` was ignored for categories

**Symptom:** The CMS stored `shape: "circle"`, but category artwork rendered as
rounded squares.

**Fix:** `CatchCategoriesSection` now applies `rounded-full` when
`shape === "circle"` and keeps `rounded-xl` for square. Verified in both
locales.

### 2.7 `layout: "list"` was ignored for brands and shelves

**Symptom:** The CMS stored `layout: "list"` for Top Brands and Flash Deals, but
both rendered the default slider/grid presentation.

**Fix:**

- `CatchBrandsSection`: list renders a two-column desktop list of logo + name
  rows; grid still uses the CMS column grid.
- `CatchShelfIsland`: `slider` (default), `grid`, and `list` are now distinct.
- `ProductCard`: added `variant="list"` with media beside details, used by the
  list shelf.

`layout` is now passed from flash-sales, products, banner, and slider sections.

### 2.8 Shelf `columns_count` was hardcoded

**Symptom:** Shelves always showed 5 desktop columns.

**Fix:** `CatchShelfIsland` reads `columns_count` and clamps desktop slides to
3–5. Brands and categories clamp to their own ranges (brands max 8,
categories 4–8).

### 2.9 CMS settings were replaced by test strings

**Symptom:** During earlier testing, titles, badges, and endpoints were
overwritten with strings such as `edwfsdfdsf`, `asdsadsadsad`, and
`efrsdf`, and a temporary date filter was added to the flash-sale endpoint.

**Fix:** Restored meaningful values (see section 4) while preserving every
other `setting.back` object.

### 2.10 API update quirks discovered

- `title` must be sent as `{ en, ar }`; a plain string fails with
  `"The title must be an array."`
- `is_active` must be sent as integer `0`/`1`.
- The categories section title is only persisted when `title_visible: 1` is
  included. This was discovered by testing `PATCH`, `PUT`, and multiple title
  shapes; all returned 200 but stored an empty title until the flag was sent.
- `setting.back` drives the derived `endpoint`. Nulling only
  `back.start_date` and `back.end_date` removes the accidental date filters
  without changing any other selection/filter key.

---

## 3. Enhancements

### 3.1 Real CMS hero support (frontend)

Added `src/features/home/redesign/CatchHeroSection.tsx` and registered the
`hero` type in `CatchSectionRenderer`.

Supported front settings:

| Setting | Behavior |
|---|---|
| `media_type` | `video` (default) or `image` |
| `video_desktop` / `video_mobile` / `poster` | Art-directed video sources with fallback assets |
| `image_desktop` / `image_mobile` | Image artwork when `media_type: "image"` |
| `eyebrow` / `heading` / `subtitle` / `cta_label` | Localized copy |
| `cta_href` / `show_cta` | CTA destination / visibility |
| `show_overlay` | Overlay visibility |
| `content_align` | `start`, `center`, `end` |
| `content_position` | `center`, `bottom` |
| `height` | `compact`, `standard`, `tall` |
| `show_mobile_content` | Shows overlaid copy on mobile instead of video-only |
| `tone` | `light` or `dark` token-based treatment |

`HomePage` now renders a CMS `hero` section when present and falls back to the
existing campaign video only when no `hero` section exists. The CMS `sliders`
section is no longer filtered out; it renders in CMS order when active, and
Tags is re-enabled in the renderer. Both are currently inactive in the CMS, so
they do not appear in the public page.

### 3.2 Tier One shared header/link settings

Sections now support:

- `subtitle` (localized)
- `show_title`
- `show_view_all`
- `action_label` (localized)
- `action_href`
- `show_product_count` (categories)

Categories now show localized plural product counts, e.g.
`44 products` / `44 منتجًا`, through `catchHome.productCount`.

### 3.3 Layout and presentation improvements

- Categories: `shape` support, dynamic action link/label, localized subtitle,
  product counts.
- Brands: `layout: "list"` two-column list and localized action copy.
- Shelves: slider/grid/list layouts, dynamic columns, localized badges.
- Tags: `tone` (`default`/`light`/`dark`/`berry`), `show_hashtag`, `show_title`.
- Coupons and promotions: shared `SectionHeader`, localized subtitle,
  `show_title`.
- Skeletons: hero and tags skeletons added; sliders skeleton uses the correct
  reserved ratio.
- Defensive handling: CMS rows with `front: []` are treated as “no settings”.

### 3.4 Accessibility and localization

- Empty headings removed.
- Timer hidden when invalid.
- Banner artwork keeps its CMS alt text in both locales:
  - EN: `Valentine’s Day S2`
  - AR: `عيد الحب ٢`
- Arabic category/brand/section copy verified by Unicode codepoints, not just
  visual inspection.

---

## 4. CMS Changes Applied

Only these section ids were edited. Every other `setting.back` object was
preserved byte-for-byte.

| CMS id | Order | Type | Change |
|---:|---:|---|---|
| 2 | 4 | banners | Restored title `Valentine's Day` / `عيد الحب`; active; columns 5; badge `LOVE` / `حب` |
| 5 | 2 | categories | Restored title `Shop by Category` / `تسوق حسب الفئة`; `title_visible: 1`; columns 8; kept subtitle, actions, `show_product_count`, `shape: circle` |
| 6 | 5 | flash-sales | Activated; title `Flash Deals` / `عروض فلاش`; columns 5; timer `2026-12-05T00:00`; badge `FLASH SALE` / `عرض سريع`; `layout: list`; fixed Arabic subtitle `أسعار لفترة محدودة`; nulled only the broken `back.start_date`/`back.end_date` |
| 9 | 6 | products | Restored title `Flash Sale Products` / `منتجات العرض السريع`; columns 5; badge `FLASH SALE` / `عرض سريع`; `show_title: true`; `show_timer: false` |
| 13 | 16 | brands | Restored title `Top Brands` / `أفضل العلامات التجارية`; columns 8; kept subtitle/actions/`layout: list`; nulled only the broken `back.start_date`/`back.end_date` |
| 17 | 17 | categories | Restored `Parent Category` / `الفئة الرئيسية` after temporary test edits; `title_visible: 1`; left inactive |

**Back preservation:** compared against the original snapshot:
23 sections before and after; the only changed back keys are `start_date` and
`end_date` on ids 6 and 13; both were intentionally set to `null`. No keys were
dropped and no other values changed.

---

## 5. Verification Evidence

### 5.1 API contract

- `GET /sections` → 23 sections, 17 active.
- `GET /general/content-pages/home` → 17 sections in EN and AR.
- `GET /section-types` → 9 registered types:
  `sliders, banners, promotions, tags, categories, flash-sales, products, brands, coupons`.
- `hero` is **not** in the registered types (see section 7).
- Flash-sale list in HTML matches `GET /general/flash-sales/black-friday`
  exactly: 12 products in the same order.

### 5.2 HTML audit (`/en` and `/ar`)

| Check | EN | AR |
|---|---:|---:|
| HTTP 200 | ✓ | ✓ |
| Sections | 17 | 17 |
| `h1` | `New Collection` | `المجموعة الجديدة` |
| `h2` count / empty `<h2>` | 11 / 0 | 11 / 0 |
| Hero desktop + mobile video | ✓ | ✓ |
| Valentine banner link | ✓ | ✓ |
| Banner alt text | `Valentine’s Day S2` | `عيد الحب ٢` |
| Category rail `--cat-cols:8` | ✓ | ✓ |
| Category tiles with circle styling | 4 | 4 |
| Brand list container / unique brand links | ✓ / 8 | ✓ / 8 |
| Flash list container / product cards | ✓ / 12 | ✓ / 12 |
| Flash layout list | ✓ | ✓ |
| Countdown timers | 2 | 2 |
| Expected CMS strings present | all | all |
| Inactive tags/sliders titles absent | ✓ | ✓ |

The four category tiles are an API-content observation, not a rendering
failure — see section 6.

### 5.3 Build and runtime

- `npx tsc --noEmit` — clean.
- `npm run lint` — 0 errors; 3 warnings that pre-date this work:
  - `niceone-src/extract.mjs` unused `isAbsolute`
  - `src/features/home/productSlider/ProductSlider.tsx` unused `theme`
  - `src/features/profile/components/OrderDetailModal.tsx` `<img>` warning
- `NEXT_PUBLIC_XHR_LOGS=false npm run build` — 44 routes generated.
- Final production server (`next start -p 3100`) — no `TypeError`,
  `ReferenceError`, unhandled rejection, or fetch errors in the server log.

### 5.4 Repeatable scripts

The verification was automated with Node scripts in
`C:\Users\admin\AppData\Local\Temp\opencode\`:

| Script | Purpose |
|---|---|
| `web-audit.mjs` | Fetches both saved locale HTML files and asserts every check in 5.2 (scripts/styles stripped before text assertions) |
| `compare-original-backs.mjs` | Compares every current `setting.back` against the original snapshot |
| `check-arabic.mjs` | Prints Arabic section titles/front settings as Unicode escapes |
| `scan-question-marks.mjs` | Detects `?` corruption in localized CMS copy |
| `check-flash-products.mjs` | Compares rendered flash-list slugs with the live sale detail |
| `badge-counts.mjs` | Counts visible CMS badge strings in both locales |
| `check-category-tiles.mjs` | Extracts category tile links/counts from the rail |

Run order after starting the server:

```powershell
# capture HTML
Invoke-WebRequest http://localhost:3100/en -UseBasicParsing |
  Select-Object -ExpandProperty Content |
  Set-Content C:\Users\admin\AppData\Local\Temp\opencode\web-home-en.html -Encoding utf8
Invoke-WebRequest http://localhost:3100/ar -UseBasicParsing |
  Select-Object -ExpandProperty Content |
  Set-Content C:\Users\admin\AppData\Local\Temp\opencode\web-home-ar.html -Encoding utf8

node C:\Users\admin\AppData\Local\Temp\opencode\web-audit.mjs
node C:\Users\admin\AppData\Local\Temp\opencode\compare-original-backs.mjs
```

---

## 6. Content Configuration Observations

### 6.1 Categories: columns 8 but only 4 tiles

The categories section stores `columns_count: 8`, and the rendered rail uses
`--cat-cols:8`. However, the section’s `setting.back` also pins:

- `parent: true`
- 70 `categoriesId` values, most of which are **child** categories

The public endpoint returns only top-level categories that intersect that
selection, currently four:

`Care`, `Devices`, `Gifts`, `Home Scents`.

This is correct intersection behavior, not a rendering failure. To show 8
tiles, the CMS selection needs 8 top-level category IDs (or the `parent` flag
must be removed/adjusted). The frontend intentionally renders every category
the API returns and scrolls rather than dropping items.

### 6.2 Banner titles are intentionally internal

Banner section titles are not drawn above the artwork; the image carries the
campaign message and the alt text preserves accessibility. This matches the
existing design decision and is not a missing title.

### 6.3 Inactive sections

The following remain inactive by CMS configuration, and the public HTML
correctly omits them:

- `sliders` — New Collection
- `tags` — Popular Tags
- products sections 12, 15, 16
- categories section 17 (`Parent Category`)

Their renderers are enabled; flipping `is_active` will now make them appear.

---

## 7. Backend Gap — `hero` Section Type

The frontend hero is fully implemented, but the backend does not register the
type. Verified responses:

| Request | Result |
|---|---|
| `GET /section-types` | No `hero` entry |
| `POST /sections` with `type: "hero"` | `422` — `"The selected type is invalid."` |
| `POST /section-types/hero/settings` | `404` |
| `POST` / `PUT` / `PATCH /section-types/hero` | `405` |
| `PUT` / `PATCH /sections/{id}` with a different `type` | `type` is ignored |

**Impact:** A merchant cannot create or manage a real `hero` section yet. The
static campaign video remains the fallback, which is why the homepage still
shows the video hero.

**What the backend needs to add:**

1. Register `hero` in `GET /section-types`.
2. Add `POST /section-types/hero/settings` with the front defaults listed in
   section 3.1.
3. Accept `type: "hero"` in `POST /sections`.
4. Persist `type` changes in `PUT`/`PATCH /sections/{id}` (or explicitly reject
   them with a clear validation message).
5. Add the `hero` preview/icon and settings controls to the CMS admin.

Until then, no CMS write can produce a real hero section.

### 7.1 CMS admin coverage gap

Even for registered types, the admin UI exposes only a subset of the front
settings now supported by the storefront:

- `subtitle`, `show_title`, `show_view_all`, `action_label`, `action_href`,
  `show_product_count`
- `show_hashtag`, `tone`
- localized `badge_text` (the admin badge input is only shown for `products`
  and writes a plain string)
- hero settings (blocked entirely)

These values persist through the API and render correctly, but merchants
cannot edit them from the current CMS screens. The admin’s `SectionTypeConfig`
needs matching controls before the full Tier One contract is self-service.

---

## 8. Files Changed

### Frontend

- `src/features/home/redesign/CatchHeroSection.tsx` (new)
- `src/features/home/HomePage.tsx`
- `src/features/home/redesign/CatchSectionRenderer.tsx`
- `src/features/home/redesign/CatchFlashSaleSection.tsx`
- `src/features/home/redesign/CatchShelfIsland.tsx`
- `src/features/home/redesign/CatchCategoriesSection.tsx`
- `src/features/home/redesign/CatchBrandsSection.tsx`
- `src/features/home/redesign/CatchTagsSection.tsx`
- `src/features/home/redesign/CatchPromotionsSection.tsx`
- `src/features/home/redesign/CatchCouponsSection.tsx`
- `src/features/home/redesign/CatchBannerSection.tsx`
- `src/features/home/redesign/CatchHeroSliderSection.tsx`
- `src/features/home/redesign/CatchProductShelfSection.tsx`
- `src/features/home/redesign/CatchCountdown.tsx`
- `src/features/home/redesign/skeletons.tsx`
- `src/features/home/components/ProductSliderIsland.tsx`
- `src/features/home/sections/clients/HomeProductRail.tsx`
- `src/features/home/types.ts`
- `src/features/home/utils.ts`
- `src/features/products/components/ProductCard.tsx`
- `src/features/flash-sales/hooks/useCountdown.ts`
- `src/components/ui/SectionHeader.tsx`
- `messages/en.json`
- `messages/ar.json`

### CMS data

- Section ids 2, 5, 6, 9, 13, and 17 (see section 4).

---

## 9. Remaining Risks / Follow-ups

1. **Backend hero registration** — frontend contract is ready but unusable
   through the CMS until section 7 is completed.
2. **Admin settings coverage** — Tier One fields render but are not editable
   in the CMS UI.
3. **Categories content** — 8 columns are configured, but only 4 top-level
   categories are selected; content team should select 8 top-level IDs.
4. **Flash-sale timer/date coupling** — selection matches the CMS timer day to
   the sale end date in the server’s local timezone. If the deployment
   timezone changes, re-verify the match; the fallback is the first active sale.
5. **Browser-level interaction** — Playwright is not installed, so this pass
   verifies server-rendered HTML/RSC, not clicks or client-side transitions.
6. **Deployment** — frontend changes are uncommitted and not deployed; CMS data
   changes are already live.
7. **Reference folder** — `Catch-Beauty-Ecommerce/` remains ignored and
   untouched. Untracked `public/1790192789892917044.mp4` is user work and was
   not modified.

---

## 10. Final Status

The CMS-driven Catch Beauty homepage passes the full automated EN/AR audit on
the production build:

- 17 active sections render in the correct CMS order.
- Titles, subtitles, badges, columns, timers, category shape, and list layouts
  reflect CMS settings.
- The flash section uses the active `black-friday` sale (12 products) and not
  the expired sale.
- Arabic copy is clean and localized.
- Inactive tags/sliders stay absent.
- Back settings are preserved except for the two approved date-key changes.

The only unresolved product gap is backend support for the real `hero` section
type.
