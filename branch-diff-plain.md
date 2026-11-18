# Branch diff in plain English

**What this is:** a human-readable explanation of `branch-diff.patch`.

**What the patch contains:** every difference between the current Catch Beauty
storefront and the current Meem Market Riyadh storefront. It is not a history
of who changed what — only the end-state difference.

**Compared refs (both current as of this report)**

| Side | Ref | Commit | Date |
|---|---|---|---|
| Catch Beauty | `project/catch-beauty` | `e337ffc` | Nov 16 |
| Meem Riyadh | `project/meem-riyadh` | `c7a8b0a` | Nov 17 |

Both local branches match their origin refs. The Meem tip includes a merge
commit that pulled two small Riyadh defaults from `origin/project/meem-riyadh`.

**How to read the raw patch:** `-` lines are what Catch has now, `+` lines are
what Meem has. Applying the patch to Catch produces Meem.

---

## The patch in one sentence

Applying this patch to Catch Beauty produces Meem Market Riyadh. It is a full
rebrand plus one new delivery feature — not a set of shared improvements.

---

## Size, in plain terms

| Measure | Value |
|---|---|
| Files touched | 165 |
| Lines added | ~5,048 |
| Lines removed | ~1,779 |
| Files added | 30 |
| Files modified | 90 |
| Files deleted | 14 |
| Files renamed | 31 |

About 2,110 of the added lines are old documentation that Catch deleted and
Meem still has. Excluding docs: 153 files, ~2,938 lines added.

No dependencies, environment variables, backend code, or database migrations
are changed.

---

## What the patch actually does

### 1. Swaps the brand everywhere

- Store name: Catch Beauty → Meem Market Riyadh.
- Arabic name: كاتش بيوتي → سوق ميم الرياض.
- 31 files renamed from `Catch*` to `Meem*` (headers, footer, home sections,
  cards).
- Translation keys renamed from `catchHome` / `catchHeader` / `catchFooter`
  to `meemHome` / `meemHeader` / `meemFooter`.
- 7 Catch logo and video files deleted.
- 12 old planning documents restored (Catch had deleted them).

### 2. Swaps the colors

- Crimson `#b81d24` and warm ivory → blue `#0e5aa7` and gold `#cf9e36`.
- Product badges change from one brand color to 11 different dark colors
  chosen by badge text.
- The header's black announcement strip becomes blue.
- Buttons and cart counters switch from black to blue.

### 3. Swaps the market details

- Phone: `+974 9636 7199` → `+966 55 000 0000`.
- Email: `cs@catchbeauty.com` → `info@meemmarket.com`.
- Static legal pages: Qatari Riyal / Qatar → Saudi Riyal / Saudi Arabia.
- Map defaults: checkout fallback moves from Kuwait City to Riyadh; the
  location picker moves from Cairo to Riyadh. Neither is Doha.
- Delivery promise: "3–5 business days" → "NOW delivery within hours, or
  3–7 days".

### 4. Adds NOW / fast delivery (the biggest real feature)

- 9 new files under `fast-shipping`.
- The cart becomes two carts in one: scheduled items and NOW items.
- Every cart request gains an `X-Channel` header so the backend knows which
  group it touches.
- Checkout supports `?type=fast`: it skips the payment step and calls a
  separate fast-checkout endpoint.
- Settings start reading a `fast_shipping` block (enabled, fee, time window).
- The header gets a scheduled/NOW toggle where Catch's award badge used to be.

### 5. Changes checkout and cart behavior

- Cart line identity includes delivery type, so the same product can exist
  twice.
- Guest checkout stays scheduled-only.
- Checkout shows "this covers NOW items only" / "this covers scheduled items
  only" notices.
- Coupons are disabled for NOW checkout.

### 6. Changes the product card

- Add-to-cart becomes a full-width solid quantity control instead of a small
  pill button.
- The automatic "Only X left" low-stock badge comes back.
- Badge colors become text-driven and multi-colored.

### 7. Changes the homepage

- A fallback hero is re-enabled. Catch currently has it commented out.
- The hero stops using Catch's built-in videos and CTA.
- A new `legacyBrand` helper rewrites "Catch Beauty" text found in CMS content
  to "Meem Market Riyadh".
- The category grid switches back from "render rows and columns exactly as
  configured" to "balance the columns automatically".

### 8. Small but real reversions

- Catch's guest-CSRF proxy guards are removed.
- A file named `test` (contents: `test`) is added.
- A few skeleton loading states go back to the older version.
- The checkout coordinate fallback changes from Kuwait City to Riyadh.

---

## What Catch would lose if this patch were applied

1. The Qatar award badge ("Best Makeup website in Qatar").
2. The 7 Catch brand assets.
3. The home-sections audit fixes: literal category grid, backend-only badges,
   banner `with_products` handling.
4. The guest CSRF guards in `proxy.ts`.
5. The single-cart simplicity (it becomes a two-group cart).

---

## What would break

1. **The legacy-brand helper would rewrite Catch's own copy into Meem.** This
   is the most dangerous line in the patch.
2. **Deleted Catch images** would 404 anywhere the CMS or settings still point
   at `/catch-logo.png` or the hero videos.
3. **The `primary` badge tone disappears.** Any code still asking for it fails
   to compile.
4. **The `catchHome` translation keys disappear.** Any leftover reference shows
   missing text.
5. **NOW delivery needs backend support** (`fast_items`, `X-Channel`,
   `fast_shipping` settings). Without it, cart and checkout break.

---

## What the patch does not touch

- No `package.json` or dependency changes.
- No Next.js config changes.
- No environment variable changes and no new `.env.example`.
- No backend, database, or migrations — they are not in this repo.
- No secrets. The only hardcoded URLs are WhatsApp numbers and
  `placehold.co` placeholders.

---

## Bottom line

This is not a "sync the branches" patch. Applying it to Catch is a full rebrand
and would undo Catch's audit fixes.

If the goal is to bring Catch's fixes into Meem, use the 14-file audit block
(`fc9d3b7`), not this patch.

If the goal is to bring Meem's delivery feature into Catch, port the
`fast-shipping` feature and its cart/checkout hooks, not the branding.

---

## Traceability

| View | Command | Files | Added | Deleted |
|---|---|---|---:|---:|
| Meem-only since divergence | `git diff project/catch-beauty...project/meem-riyadh` | 150 | 2,778 | 1,415 |
| Catch-only since divergence | `git diff project/meem-riyadh...project/catch-beauty` | 26 | 373 | 2,279 |
| Current states | `git diff project/catch-beauty..project/meem-riyadh` | 165 | 5,048 | 1,779 |

Patch file: `D:\Meem-Market-Ecommerce\branch-diff.patch`
