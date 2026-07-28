## Changes

1. **Fixed category menu API endpoint** — Changed `categoryMenuService` from `/general/categories-with-children?level=3` (404) to `/general/nav-data?level=3` (working). Response structure already matched `CategoryMenuItem[]`.

2. **Fixed navbar service** — Updated `navbarService` endpoint from `/general/navbar` (404) to `/general/nav-data`. Updated `NavbarMenu` type to match the actual API response (added `level`, `image`, `children` fields).

3. **Added category images to navbar** — `CategoryNavClient` now renders category thumbnails from the `nav-data` response next to L1 links in the top category bar.

4. **Added mobile hamburger menu with accordion** — New `MobileHamburgerMenu` client component in `src/features/navigation/components/mobile/`. Slides in from the left with a backdrop overlay. Shows full category tree as an accordion with expand/collapse for L2/L3 items. Uses client-side caching (5-min TTL) to avoid redundant API calls. Accessible via hamburger icon in `MobileHeader`.

5. **Added breadcrumb navigation component** — New `Breadcrumbs` component in `src/features/navigation/components/`. Accepts a `BreadcrumbItem[]` array with label + optional href. Supports RTL (Arabic) with correct chevron direction. Renders last item as plain text with `aria-current="page"`.

6. **Added loading/empty/error skeleton states** — Created `NavSkeleton` component with shimmer placeholders matching nav bar dimensions. `CategoryNav` now shows skeleton during SSR loading, and a fallback text on error (instead of `return null`).

7. **Added client-side caching** — Created `categoryMenuCache` service with a 5-minute TTL in-memory cache wrapper. Used by the mobile hamburger menu for client-side data fetching.

8. **Footer API remains pending** — `GET /general/footer` still returns 404. Frontend continues using hardcoded mock data with a TODO comment in `footerService.ts`.

## API Bugs

1. **`GET /general/navbar`** — Returns 404. Endpoint does not exist. Replaced with `/general/nav-data`.

2. **`GET /general/categories-with-children?level=3`** — Returns 404. Endpoint does not exist. Replaced with `/general/nav-data?level=3`.

3. **`GET /general/footer`** — Returns 404. Backend endpoint not yet built. Frontend continues using mock data.
