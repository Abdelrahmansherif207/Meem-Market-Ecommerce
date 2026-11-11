# Homepage — Static & Layout-Owned Surfaces

The Rawd Al-Aseel homepage is CMS-driven. All commerce sections come from
`GET /general/content-pages/home`; the surfaces below are the only non-CMS
parts of the page shell.

| Surface | File | Type | Notes |
|---|---|---|---|
| Header (desktop + mobile) | `src/features/navigation/components/catch/*` | Layout-owned, dynamic | Search, category menu, currency/auth/wishlist/cart chrome. **Header WIP files were not touched in Phase 4.** |
| Mobile bottom navigation | `src/features/navigation/components/mobile/MobileBottomNav.tsx` | Layout-owned, static routes | Categories / Home / Profile / Cart; real cart count |
| “Do you need help?” banner | `src/features/home/redesign/CatchHelpBanner.tsx` | Static content + settings | Deep-green strip after the CMS sections. Email/phone read site settings; WhatsApp uses the existing constant; the help-center destination remains the existing `#` placeholder |
| Footer | `src/features/navigation/components/catch/CatchFooter.tsx` + `CatchPaymentStrip.tsx` | Mostly dynamic | Company/profile/social/app links stay static or settings-driven; popular categories come from the nav-data endpoint and hide when unavailable |
| Route loading | `src/app/[locale]/loading.tsx` | Static skeleton | Shows the page shell while the CMS manifest streams |
| Section skeletons | `src/features/home/redesign/skeletons.tsx` | Static skeletons | One fallback per CMS section type, using the same reserved ratios as the real sections |
| Section error fallback | `src/features/pages/components/SectionErrorBoundary.tsx` | Shared UI | Compact `ErrorState` with retry; a failed section does not take down the page |
| Global error | `src/features/home/HomePage.tsx` + `ErrorState` | Shared UI | Shown when the homepage manifest cannot load after retries |
| Scroll-to-top | `src/components/ui/ScrollToTopButton.tsx` | Layout-owned | Existing behavior |

## Legacy Stitch static sections

The earlier Stitch implementation used fixed static sections (ribbon ticker,
hero editorial cards, perks strip, beauty journal). They are **not rendered by
the current Catch homepage**. The CMS sections plus the help banner replace
them. If a future phase reintroduces any of them, keep the rules below.

## Static content rules

- Static sections never invent **commerce data** (products, prices, stock,
  discounts). They carry only marketing text/design visuals.
- All static copy ships in both `messages/en.json` and `messages/ar.json`.
- Static links must point at real destinations; when no destination exists,
  keep the existing placeholder rather than inventing a URL.
- The footer’s newsletter/app badges remain decorative until a real endpoint
  or store link is configured.
