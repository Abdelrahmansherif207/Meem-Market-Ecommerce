# Catch Beauty Homepage — Asset & Art Direction Rules

This document records the image ratios, rendering behavior and brand-asset
validation used by the Phase 4 homepage implementation.

## Brand assets

| Asset | Path | Notes |
|---|---|---|
| Header wordmark | `public/catch-logo.png` | Black “CATCH BEAUTY” wordmark; no red in the mark |
| Footer logo | `public/catch-footer-logo.jpeg` | Uses `#D02020` plus black; decorative only |
| Primary brand color | `--color-primary` `#B81D24` | **Unchanged.** The berry/ivory/charcoal/rose palette is supporting only |

The logo/footer inspection confirmed that `#B81D24` is the correct primary;
the footer’s brighter red is a separate decorative asset and was not promoted
to a global token.

## CMS artwork ratios (live data)

| Surface | Intrinsic ratio used | Source |
|---|---|---|
| Hero slider | `1150 / 368` | Live slider desktop + mobile artwork |
| Wide banner | `1500 / 377` | Live `banners` desktop + mobile artwork |
| Promotion tile | `1500 / 282` | Live `promotions` artwork |
| Category tile | square well | CMS category image, `object-cover` |
| Brand tile | `4 / 3` well | CMS brand logo, `object-contain` |
| Coupon tile | `2 / 1` well | CMS coupon artwork, `object-contain` |
| Product image | square well | Product image, `object-contain` |

These ratios are layout reservations, not crops. The artwork is rendered with
`object-contain` inside the well so merchant creatives are never stretched or
force-cropped. If a future CMS asset has a different ratio, update the
section’s `--media-aspect` value rather than changing the global well.

## Rendering pipeline

- `src/components/ui/CampaignImage.tsx` renders a real `<picture>`:
  - mobile source: `media="(max-width: 767px)"` when the CMS provides a
    different mobile image;
  - desktop image: the fallback `<img>`.
- `src/shared/lib/artDirectedImage.ts` uses Next `getImageProps` to resolve
  the source URL. `next.config.ts` sets `images.unoptimized: true`, so the
  helper intentionally falls back to the raw URL when no `srcSet` is produced.
- `fill` mode positions the image absolutely inside `.catch-media-well`
  (`position: relative`, `aspect-ratio` from CSS custom properties,
  `overflow: hidden`).
- `priority` is used for the hero only; all other campaign images are lazy
  loaded.
- `sizes` is supplied per surface so a future optimizer can pick the right
  width without layout changes.

## Responsive behavior

- Mobile (`< 768px`) uses the mobile art direction when present.
- Tablet and desktop use the desktop art direction.
- The well keeps its reserved height from the first paint, so images do not
  cause layout shift when they finish loading.
- At 320 px the smallest hero well is about 84 px tall; text inside the
  artwork is small but never cropped.
- Category and brand tiles use contained/cover image behavior appropriate to
  their artwork type; product cards always use `object-contain`.

## What not to do

- Do not force a 16:9 crop on campaign artwork.
- Do not replace the CMS mobile asset with the desktop asset when the CMS
  provides both.
- Do not introduce a new image CDN or dependency for art direction; the
  existing Next image stack plus native `<picture>` is sufficient.
- Do not change `#B81D24` when restyling a section; use the `catch-*`
  supporting tokens for berry/ivory/charcoal/rose accents.
