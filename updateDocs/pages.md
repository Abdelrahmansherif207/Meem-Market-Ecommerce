## Changes

1. **Fixed homePageService endpoint** — Changed from `/general/content-pages/home` (404) to `/general/pages/home` (working). The home page now correctly fetches its section config.

2. **Extracted SectionRenderer into shared component** — Moved the section rendering logic from `src/features/home/HomePage.tsx` into a reusable `SectionSuspense` component in `src/features/pages/components/SectionRenderer.tsx`. Both `HomePage` and `PageRenderer` now use the same component, eliminating duplication.

3. **Created `src/features/pages/` feature** with:
   - `services/pageService.ts` — fetches any page by slug via `GET /general/pages/{slug}`
   - `components/PageRenderer.tsx` — async server component that fetches a page config and renders its sections with loading/empty/error states
   - `components/SectionRenderer.tsx` — shared section block registry + skeleton mapper
   - `types.ts` — re-exports `HomeContentPage` and `HomePageSection` from home feature
   - `index.ts` — public API exports

4. **Added dynamic route** `src/app/[locale]/pages/[slug]/page.tsx` — renders any CMS page by slug

5. **Added static page routes** — Created route files under `src/app/[locale]/` for common footer links:
   - `/about`, `/contact`, `/privacy`, `/terms`, `/faq`, `/shipping`, `/returns`
   - Each renders via `PageRenderer` with the corresponding slug (no duplicate content to maintain)

6. **Refactored HomePage** — Simplified to import `SectionSuspense` from pages feature instead of maintaining its own renderer/skeleton logic.

## API Bugs

1. **`GET /general/content-pages/home`** — Returns 404. Frontend `homePageService` was calling this incorrect path. Fixed to `/general/pages/home`.

2. **`GET /general/sections`** — Returns 404. Section management endpoints not yet built on backend.

3. **`GET /general/section-types`** — Returns 404. Section type registry not yet built on backend.

4. **`GET /puck/page`** — Returns database error. Puck page builder backend not functioning.

5. **`GET /cms-pages`** — Returns database error. CMS pages admin endpoint not functioning.

6. **`GET /general/pages/{slug}`** — Only "home" slug exists. Other pages (about, contact, etc.) need to be created in the backend before the static routes will render content.
