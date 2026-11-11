# Rawd Al-Aseel Homepage — Asset & Art Direction Rules

This document records the image ratios, rendering behavior and brand-asset
validation used by the Phase 4 homepage implementation.

## Brand assets

| Asset | Path | Notes |
|---|---|---|
| Brand logo / favicon | `public/raowdalaseel-logo.png` | Square transparent mark with Arabic and English Rawd Al-Aseel wordmark |
| Primary brand color | `--color-primary` `#16834B` | Brand green; supporting surfaces use the fresh green/neutral palette |
| Temporary hero fallback | `public/hero/catch-*` | Retained only until Rawd Al-Aseel campaign video/artwork is supplied |

The supplied Rawd Al-Aseel mark is used for the header, sticky/mobile lockups,
auth screens, favicon and social metadata.

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
- Do not change `#16834B` when restyling a section; use the `catch-*`
  supporting tokens for green/orange/neutral accents.
