# Home Content-Page Sections — Settings Audit

- **Endpoint:** `GET /general/content-pages/home`
- **Render path:** `src/features/home/HomePage.tsx` → `redesign/CatchSectionRenderer.tsx` → `redesign/Catch*Section.tsx`
- **Audited:** 16 Nov 2026
- **Baseline:** the implementation as audited, before the fixes in [§5](#5-post-audit-changes)

> The legacy `src/features/home/sections/*` tree is not mounted anywhere and was excluded from this audit.

---

## 1. Summary — payload vs. implementation

| # | Section type (id) | Front settings sent | Consumed | Not consumed / dead | Flag |
|---|---|---|---|---|---|
| 1 | `hero` (25) | **18** keys | **18/18** | `endpoint` (section-level, ignored — hero renders from `setting` only) | ✅ **Complete** |
| 2 | `banners` (21) | `columns_count` (1) | **0/1 effective** — wired only to a product shelf, but `with_products: false` → shelf never renders | `columns_count`, section `title` ("Black Friday Deals" never printed) | ⚠️ **Partial — wired but dead** |
| 3 | `categories` (5) | **14** keys | **14/14 read, 12/14 produce the requested visual** | none ignored; `shape: "circle"` and `columns_count: 5` are overridden by layout math | ⚠️ **Partial (semantic)** |
| 4 | `products` "Flash Sale" (9) | `columns_count`, `badge_text`, `show_title`, `show_timer`, `timer_end_at` (5) | **5/5** | — | ✅ **Complete** |
| 5 | `products` "Best Sellers" (7) | `columns_count`, `show_title` (2) | **2/2** | — | ✅ **Complete** |
| 6 | `products` "Fragrance" (12) | `columns_count`, `badge_text`, `subtitle`, `show_title`, `show_timer` (5) | **5/5** | — | ✅ **Complete** |
| 7 | `brands` (13) | `subtitle`, `show_view_all`, `action_label`, `action_href`, `layout`, `columns_count` (6) | **6/6** | — | ✅ **Complete** (desktop-only columns) |
| 8 | `coupons` (18) | `subtitle`, `show_title` (2) | **2/2** | — | ✅ **Complete** |

**Totals: 53 front keys sent → 51 meaningfully used (96%).**

---

## 2. Detail per section

### 2.1 `hero` (id 25) — ✅ Complete 18/18

| Setting | Status | Where |
|---|---|---|
| `media_type: "video"` | ✅ | `CatchHeroSection.tsx:69` switches video vs image |
| `video_desktop`, `video_mobile` | ✅ | lines 60–63 |
| `poster` | ✅ | line 64 |
| `eyebrow`, `heading`, `cta_label` | ✅ | lines 40–46 (locale map resolved) |
| `cta_href` | ✅ | line 47 (route `/sliders/[slug]` exists) |
| `show_cta`, `show_overlay` | ✅ | lines 49–50 |
| `content_align`, `content_position` | ✅ | lines 53–54, 81–89 |
| `height: "standard"` | ✅ | lines 55, 74–79 |
| `show_mobile_content: false` | ✅ | line 51 — content + overlay hidden below `md` |
| `tone: "light"` | ✅ | lines 52, 91–111 |
| `autoplay`, `loop`, `muted` | ✅ | lines 56–58 → `CatchHeroVideoPlayer` |

Only gap: `"endpoint": "general/hero?"` is never called. Intentional (hero is settings-driven), but it means the backend hero list is unused.

### 2.2 `banners` (id 21) — ⚠️ Partial

| Setting | Status |
|---|---|
| `columns_count: 5` | ⚠️ Passed to `CatchShelfIsland` only when `banner.products.length > 0` (`CatchBannerSection.tsx:122–133`). Given `back.with_products: false`, the shelf never renders → no effect. |
| section `title` | ❌ Ignored — component destructures only `endpoint`, `locale`, `setting` (line 55). |
| `back.slug` / `back.with_products` | ➖ Enforced server-side via `endpoint` only. |

> ⚠️ **Extra finding:** banner artwork is overridden locally. `BANNER_ART_OVERRIDES` (lines 22–41) replaces the CMS image for slug `black-friday-deals-s2` with `/banners/black-friday-deals-s2-1380x260.jpg`. The API image for this banner is not what users see.

### 2.3 `categories` (id 5) — ⚠️ Partial (all read, 2 visually overridden)

| Setting | Status |
|---|---|
| `subtitle`, `show_view_all`, `action_label`, `action_href`, `show_product_count` | ✅ (lines 67–70, 86–93) |
| `layout: "grid"` | ✅ (parsed, grid is default) |
| `rows_count`, `tablet_rows_count`, `mobile_rows_count` | ✅ used as target rows |
| `columns_count`, `tablet_columns_count`, `mobile_columns_count` | ⚠️ treated as a **max cap**, not an exact count |
| `balance_last_row` | ✅ (defaults `true` anyway) |
| `shape: "circle"` | ❌ Not rendered — `categoryGrid.ts:177`: `shape === "square" \|\| rows >= 2 ? "card" : "circle"` → 2 rows forces card tiles |

Computed result with the response's `limit=8`:

| Breakpoint | Requested | Actual | Why |
|---|---|---|---|
| Desktop | 5 cols × 2 rows | **4 × 2** | `ceil(8/2)=4`, capped at 5 → 4 |
| Tablet | 5 × 2 | **4 × 2** | same math |
| Mobile | 4 × 2 | **4 × 2** | ✅ exact |

**Root cause:** `endpoint` sends `limit=8` but `categoriesId` contains **10** IDs, and `columns_count 5 × rows_count 2 = 10 slots`. Fix: raise `limit` to 10 in the CMS; desktop/tablet would then render true 5×2.

### 2.4 `products` (ids 9, 7, 12) — ✅ Complete 5/5, 2/2, 5/5

All of `columns_count`, `badge_text`, `subtitle`, `show_title`, `show_timer`, `timer_end_at`, `layout` flow through `CatchProductShelfSection.tsx:52–59` → `CatchShelfIsland.tsx` → `SectionHeader` / `CatchCountdown` / `ProductCard`.

One constraint worth knowing: `columns_count` is clamped **3–5** on desktop (`CatchShelfIsland.tsx:71–74`), and mobile (2) / tablet (3) are hardcoded. Your `5` passes cleanly. `timer_end_at: "2026-12-05T00:00"` renders (still in the future relative to the audit date).

### 2.5 `brands` (id 13) — ✅ Complete 6/6

| Setting | Status |
|---|---|
| `subtitle`, `show_view_all`, `action_label`, `action_href` | ✅ |
| `layout: "grid"` | ✅ (only `"list"` triggers the alternate layout) |
| `columns_count: 8` | ✅ desktop = 8; **mobile 2 / tablet 4 hardcoded** (`CatchBrandsSection.tsx:84–86`) |

### 2.6 `coupons` (id 18) — ✅ Complete 2/2

`subtitle` and `show_title` both render. Note the grid is **not** setting-driven: `planLayout()` hardcodes 3 → "2 half + 1 full" (`CatchCouponsSection.tsx:29–53`). Fine today because the payload sends no `columns_count`/`layout` for coupons — but if the dashboard adds them, they won't work.

---

## 3. Section-level fields (outside `setting.front`)

| Field | Status | Impact |
|---|---|---|
| `section.is_active` | ❌ Never checked | Inactive sections render if the API returns them. Relies 100% on backend filtering. |
| `section.order` | ❌ Never read | Render order = array order from the API. Safe today, fragile if the API changes. |
| `section.title` | ⚠️ Used by all except `banners`; `hero` uses it only as fallback (here it is `null`) | Banner title is silently dropped. |
| `section.setting.back` | ❌ Never read | By design — `endpoint` is pre-built by the backend. But it causes the `limit=8` vs 10-IDs mismatch above with no guard. |
| `section.endpoint` | ✅ Used by banners/categories/products/brands/coupons; ❌ ignored by `hero` | — |

---

## 4. What's actually "not listening" (priority order)

1. **`banners.columns_count`** — dead in this config (`with_products: false`). Either render a shelf or drop the setting.
2. **`categories.shape: "circle"`** — silently downgraded to cards because the grid is 2 rows tall.
3. **`categories.columns_count: 5`** — yields 4 columns; needs `limit: 10` (or `balance_last_row: false` + 10 items).
4. **`banners.title`** — never rendered.
5. **`is_active` / `order`** — not enforced client-side (defense-in-depth gap, not a visual bug).
6. **Banner image override** — CMS artwork for `black-friday-deals-s2` is replaced by a local asset.

---

## 5. Post-audit changes

Implemented after this audit (baseline findings above are kept for reference; line numbers refer to the pre-fix code).

### 5.1 `banners` now behaves like a `products` section when `with_products` is on

- `CatchSectionRenderer.tsx` forwards `section.setting.back` to `CatchBannerSection`.
- `CatchBannerSection.tsx`:
  - honors `back.with_products` (CMS flag is authoritative, falls back to `?with_products=1` in the endpoint);
  - gates the product rail on `withProducts && products.length > 0`;
  - forwards the products-section settings contract to `CatchShelfIsland`:
    `title` (section title → `banner.title`), `subtitle`, `showTitle` (`show_title`),
    `showTimer` (`show_timer`), `timerEndAt` (`timer_end_at`), plus the existing
    `columns_count`, `badge_text`, `layout`.
- Result: with `columns_count: 5` and `with_products: true`, the banner renders its CMS
  image followed by a 5-up product shelf with a "Black Friday Deals" heading.

### 5.2 Card badges are fully backend-driven

- `ProductCard.tsx`: removed the automatic low-stock chip
  (`LOW_STOCK_THRESHOLD`, `safeStock`, `isLowStock`).
- Only `badge_text` (localized `{ en, ar }`) renders a badge.
- No `badge_text` → no badge. Flash-sale items still show their "Ends in…" countdown.
- Applies site-wide (banner shelves, product shelves, category/brand/search/tag listings).
- The `catchHome.lowStock` message key is now unused and can be removed from
  `messages/en.json` and `messages/ar.json`.

### 5.3 Categories grid is literal (columns, rows, shape)

- `categoryGrid.ts` no longer derives columns from rows and no longer balances.
  `columns_count` / `rows_count` and their tablet/mobile variants render
  directly (`resolveCategoryColumns` and the balance loop were removed).
- `shape` drives the tile style directly: `circle` renders round tiles even
  across multiple rows; `square` renders card tiles.
- Cap rule: the visible tile count is the **smallest breakpoint capacity**
  (`maxVisible = min(desktop slots, tablet slots, mobile slots)`), so the CMS
  row count stays exact on every device. With the current payload that is
  `min(10, 10, 8) = 8` tiles: desktop/tablet render 5 + 3 (two empty cells),
  mobile renders a full 4×2.
- `balance_last_row` is now ignored (kept in the type for backward
  compatibility; it can be removed from the dashboard contract later).
- The loading skeleton mirrors the same `maxVisible` count.
- Consequence: raising the endpoint `limit` above 8 will not show more than
  8 tiles until the mobile grid grows — the smallest breakpoint is the cap.

### 5.4 Still open

| Item | Status |
|---|---|
| `BANNER_ART_OVERRIDES` for `black-friday-deals-s2` | ❌ Still overrides the CMS image |
| `coupons` hardcoded 3-item layout | ❌ Not setting-driven (no settings sent today) |
| `section.is_active` / `section.order` | ❌ Still not enforced client-side |

**Verification:** `npx.cmd tsc --noEmit` and `npx.cmd eslint` pass after the changes above.
