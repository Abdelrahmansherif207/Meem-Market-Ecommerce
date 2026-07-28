## Changes

### Category Detail Page (`/category/[slug]`)
- **page.tsx**: Refactored `BannerPromotionContent` to destructure `links` from `getCategoryPageData` and pass to `ProductsToolbar` and `CategoryProducts`. Added `ActiveFilterChips` to both desktop and mobile views. Added `ActiveFilterChips` import.
- **SidebarContent.tsx**: Changed filter value to `<locale>/category/<slug>?key=value` format for client-side navigation.
- **MobileSidebarContent.tsx**: Same filter value change as SidebarContent.

### New components
- **ActiveFilterChips.tsx** (`src/features/categories/components/`): Client component that reads active filters from URL search params (`brand`, `height`, `width`, `length`, `weight`, `category`), renders them as removable chips with an X button, and includes a "Clear all" link that preserves `sort`, `search`, and `page` params.
- **Pagination.tsx** (`src/features/categories/components/`): Server component that renders page number buttons (1..N) from `links` metadata. First/last/prev/next are rendered as disabled when not available. Active page is highlighted with `bg-primary` styling. Supports preserving all existing search params via `useSearchParams`.
- **ProductsToolbar.tsx** (`src/features/categories/components/`): Renders search input, sort dropdown (`sort_by=id&order=asc|desc`), and result count (`Showing X of Y`). Handles `search`, `sort`, `page` query params. Search uses Enter key + debounced push via `useEffect`. Shows "No products found" when empty with page param cleared.

### Modified components
- **CategoryProducts.tsx**: Added optional `links` prop (pagination metadata). Renders `Pagination` below the grid when links are provided.
- **ProductsGridContent.tsx**: Added `ActiveFilterChips` above the product grid in the non-toolbar render path.
- **categoryProductsService.ts**: `getCategoryPageData` now returns `links` from API response. `getCategoryPageData` accepts optional `filterKey` parameter (default `"category"`). `getSearchPageData` returns `links` as well.

### Featured Categories (Homepage)
- **FeaturedCategories.tsx** (`src/features/home/components/featuredCategories/`): Fetches `/featured-categories` endpoint (public, no auth required), renders as a grid of circular category images using `ContentItem`.
- **SectionRenderer.tsx**: Registered `"featured_categories"` section type mapping to `FeaturedCategories` component.

