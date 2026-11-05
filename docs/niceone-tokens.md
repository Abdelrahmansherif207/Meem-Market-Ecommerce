# Nice One design tokens → Catch Beauty mapping

Source mirrors in `niceone-src/` (gitignored): `home-en.html`, `home-ar.html`, `css/*.css`, digests in `niceone-src/digest/`.
These are the exact values extracted from niceonesa.com (SSR HTML + compiled Tailwind v3 bundles) and how each maps into our `@theme` tokens in `src/app/globals.css`.

## 1. Typography

| Nice One | Value | Our mapping |
|---|---|---|
| Desktop font | `font-niceone` custom family; weights 400/500/700 utilities | Not copied (proprietary files). **IBM Plex Sans Arabic** — the same family Nice One serves via Google Fonts (`css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500`) — already wired as `--font-ibm-arabic` in `[locale]/layout.tsx` |
| Section title | `font-niceone-medium text-lg` (18px / weight 500) | `text-lg` + `font-medium` |
| "View all" link | `text-sm underline` | `text-sm underline` |
| Footnote | `text-[#222] text-xs`, muted `text-[#ababab] text-xs` | `text-xs`, `text-text-muted` |

## 2. Color semantics (their classes → ours)

| Nice One class | Exact value | Our token |
|---|---|---|
| `text-primary` | `#222` | `text-primary` #222222 |
| `bg-dark-grey` (mega-menu rail) | `#f9f9f9` | `text-secondary` region / `border-light` family |
| `soft-grey` borders | `#ededed` | `border` family = #ede4e2 (Catch warm grey, per reference) |
| `bg-secondary` (footer help band, near-black) | ~`#1c1a1a` | `secondary` #1c1a1a |
| Deal red / badges | `#ee0a24` (Vant default red) | `discount` — Catch uses its brand red #b81d24 |
| Rose accents | `#ffedee`, `#FFD3DA`, `#feaebb`, `#e0b0b0` | `primary-surface` #fbeeed, `accent` #e0b0b0 |
| `text-footer` | white @ 85% | `text-inverse` + opacity |
| Footer footnote | `#ababab` | `text-muted` #9b8f8f |

## 3. Structure & spacing (the "pixel" core)

| Element | Nice One classes (verbatim) |
|---|---|
| Page container | `.container { max-width: 1440px }`, `.custom-container { mx-auto w-full }` (640/768/… breakpoints) |
| Section wrapper | `py-1.5 px-3 md:px-0`, or `grid px-3 md:px-0 py-1.5 banner` |
| Section header row | `flex justify-between items-center mb-3` |
| Card rail | `flex items-center hide-scrollbar overflow-x-auto gap-4 mb-3` inside `flex flex-col gap-4` |
| Product/deal card | `flex flex-col w-full min-w-[160px] max-w-[450px] min-h-[270px] rounded-md bg-white relative` |
| Banner slides | `swiper rounded-md desktop-custom-swiper-banner` + `swiper-slide banner` |
| Slider arrows | `swiper-button-prev !w-[44px] flip-icon` (RTL flip) / `-next` |
| Slider pagination | `--swiper-pagination-bullet-size: 8px`, gap 2px, `bottom: 12px` on desktop banner variant |
| Mega menu panel | `bg-white ltr:left-0 rtl:right-0 custom-container top-14 shadow-cus absolute z-10 group-hover` + `grid grid-cols-12 w-full` |
| Mega menu left rail | `col-span-12 lg:col-span-2 bg-dark-grey flex flex-col pt-2 max-h-[70vh] overflow-y-auto` |
| Mega menu item | `hover:bg-[#f4f4f4] flex items-center justify-between py-3 px-4`, active = `text-primary text-sm font-niceone-medium` |
| Footer help band | `bg-secondary text-white custom-container p-4` → `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 xl:gap-x-4 gap-y-6` |
| Footer icon circle | `bg-ftIcon h-12 w-12 rounded-full` (white 17% alpha) |
| Footer link hover | `transition-all delay-[.2s] border-b-2 border-b-white pb-1 group-hover:border-b-[#000]` under `text-black text-sm group` |
| Footer row gap | `space-y-[30px]`, columns `flex flex-col gap-5 lg:flex-row justify-between` |
| Bottom bar | `bg-white mt-3 py-[15px] border-t-[1px] border-t-soft-grey` + `justify-center md:justify-between` |
| Card shadow | `.shadow-cus { box-shadow: 0 0 5px 0 rgba(0,0,6,.14) }` |

## 4. Radii / misc

- Radius scale: sm 2px / md 4px (`rounded-md` used everywhere) / lg 8px / pill 999px
- `.main-section { min-height: 950px }` (md+ home shell)
- Currency symbol uses a dedicated 1-glyph TTF (`niceone-currency`, `font-size: calc(1em + 4px); line-height: 0`) → replicate visually with SAR armour text, not the font file
- `.hide-scrollbar`, `.flip-icon { transform: scaleX(-1) }` utilities — both easy to add

## 5. What was deliberately NOT copied

- Nice One logo, wording ("Best Makeup website in Saudi Arabia"), imagery/product data, their proprietary `niceone` font binary and `niceone-currency` TTF.
- Everything else (spacing, type scale, radii, shadow, layout geometry) is 1:1.

## Digests (raw extraction output)

- `niceone-src/digest/tokens.md` — 351 Vant + 98 `--vc-` + 58 misc custom properties
- `niceone-src/digest/components-en.md` / `components-ar.md` — per-section class dumps
- `niceone-src/digest/css-rules.md` — selector samples per UI segment
- `niceone-src/digest/en-ar-diff.md` — RTL class delta (mirroring comes from `dir="rtl"` + `ltr:/rtl:` variants)
