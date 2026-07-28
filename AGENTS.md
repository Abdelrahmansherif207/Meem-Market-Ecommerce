> **Feature Progress:** Cart (Not Yet Completed)
# Project Architecture & Constraints Blueprint (Feature-First)

This file is the architectural single source of truth for all AI agents, assistants, and LLMs working on this repository. Follow the folder responsibilities and boundary rules below.

## Directory Layout

```text
.
â”œâ”€â”€ AGENTS.md
â”œâ”€â”€ CLAUDE.md
â”œâ”€â”€ messages/                 # next-intl JSON messages (repo root)
â”œâ”€â”€ public/                   # static assets
â”œâ”€â”€ next.config.ts            # Next + next-intl plugin config
â”œâ”€â”€ tsconfig.json             # `@/*` points to `src/*`
â””â”€â”€ src/
    â”œâ”€â”€ app/                  # Next.js App Router (routing + layouts only)
    â”œâ”€â”€ components/
    â”‚   â””â”€â”€ ui/               # reusable, presentational primitives ONLY
    â”œâ”€â”€ features/             # business/domain ownership (feature-first)
    â”‚   â”œâ”€â”€ auth/
    â”‚   â”œâ”€â”€ cart/
    â”‚   â”œâ”€â”€ checkout/
    â”‚   â”œâ”€â”€ home/
    â”‚   â”œâ”€â”€ navigation/
    â”‚   â”œâ”€â”€ products/
    â”‚   â”œâ”€â”€ categories/
    â”‚   â””â”€â”€ ...               # new ecommerce features go here
    â”œâ”€â”€ shared/               # reusable infrastructure (no domain logic)
    â”‚   â”œâ”€â”€ lib/              # shared clients (fetch wrappers, SDK instances)
    â”‚   â”œâ”€â”€ hooks/            # generic reusable hooks (non-domain)
    â”‚   â”œâ”€â”€ utils/            # helpers like `cn`, formatters, etc.
    â”‚   â”œâ”€â”€ constants/        # cross-feature constants (keys, enums)
    â”‚   â””â”€â”€ types/            # cross-feature types (API response, core models)
    â”œâ”€â”€ stores/               # global cross-feature state only
    â””â”€â”€ i18n/                 # next-intl routing/navigation helpers
```

## Folder Responsibilities

### `src/app/` (routing shell only)
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, route composition, metadata.
- Rules:
  - Keep pages/layouts thin.
  - No feature business logic (domain calculations, feature state, API orchestration) in `app/`.
  - `app/` may import from `features/*`, `shared/*`, and `components/ui/*`.
  - `features/*` must never import from `app/`.

### `src/features/` (business ownership)
- Organize by ecommerce domain: `auth`, `cart`, `checkout`, `products`, `categories`, `home`, `navigation`, etc.
- Each feature may contain (as needed): `components/`, `hooks/`, `services/`, `store/`, `types.ts`, `utils.ts`, `constants.ts`.
- Rules:
  - Prefer colocation: put feature UI + state + services together.
  - Feature code can import from `shared/*` and `components/ui/*`.
  - Cross-feature imports are allowed, but prefer the owning featureâ€™s public surface:
    - Prefer `src/features/<feature>/index.ts` over deep internal paths.

### `src/components/ui/` (presentational primitives only)
- Only reusable primitives: `Button`, `Input`, `Modal`, `Badge`, `Sheet`, `Skeleton`, etc.
- Rules:
  - No business logic, no API calls, no feature stores.
  - Can depend on `shared/utils` (e.g. `cn`) and styling libraries.
  - Must not import from `features/*`.

### `src/shared/` (generic reusable infrastructure)
- Put things here only when they are genuinely cross-feature and non-domain:
  - API/fetch clients, generic hooks, formatting helpers, shared constants, shared base types.
- Rules:
  - `shared/*` must not import from `features/*`.
  - If the code â€œspeaks ecommerceâ€‌ (cart totals, product pricing rules), it belongs in that feature.

### `src/stores/` (global cross-feature state)
- Only for state shared across multiple features (rare).
- Rules:
  - Feature-specific stores live in `src/features/<feature>/store/`.
  - Avoid turning `src/stores` into a dumping ground.

### `src/i18n/`
- Owns i18n routing, locale-aware Link/navigation helpers, and request config.
- Rules:
  - Domain translations/messages stay in `messages/*.json`.

## Page Composition Philosophy

Pages in `src/app/` should mostly compose feature-level â€œpage componentsâ€‌.

Example:
```ts
// src/app/[locale]/page.tsx
import { HomePage } from "@/features/home";

export default function Page() {
  return <HomePage />;
}
```

## Shared vs Feature: How to Decide

Put it in a **feature** when:
- Itâ€™s tied to a domain (cart, checkout, auth, products, categories).
- It changes when that domain evolves.
- It uses feature state, feature services, or feature-specific types.

Put it in **shared** when:
- Itâ€™s infrastructure (API client), a generic helper (`cn`, `formatMoney`), or cross-feature types (`ApiResponse`).
- It has no knowledge of ecommerce concepts.

Put it in **components/ui** when:
- Itâ€™s a pure presentational primitive with no domain ownership.
- It can be used anywhere without importing business logic.

## Ecommerce Examples (Where New Code Goes)

- Add â€œWishlistâ€‌:
  - `src/features/wishlist/components/WishlistButton.tsx`
  - `src/features/wishlist/store/useWishlistStore.ts`
  - `src/features/wishlist/services/wishlistService.ts`

- Add a product card:
  - `src/features/products/components/ProductCard.tsx` (domain-owned)
  - Generic primitives used by the card (e.g. `Button`) go in `src/components/ui/`.

- Add cart totals logic:
  - `src/features/cart/utils/calcCartTotals.ts`

- Add an API client wrapper:
  - `src/shared/lib/api.ts`

- Add category tree types:
  - `src/features/categories/types.ts`

## Anti-Patterns (Do Not Do)

- Putting domain logic in `src/app/` (pages/layouts become â€œgod componentsâ€‌).
- Creating global folders by file type (e.g. `src/services/*`, `src/hooks/*`) instead of feature ownership.
- A giant `shared/components` dumping ground.
- Feature stores placed in `src/stores/`.
- Deep cross-feature imports into another featureâ€™s internals (prefer feature public exports).
- Deep route-only component folders that duplicate features (keep folders shallow).

