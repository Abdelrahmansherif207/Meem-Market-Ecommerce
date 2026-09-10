> **Feature Progress:** Cart (Not Yet Completed)
# Project Architecture & Constraints Blueprint (Feature-First)

This file is the architectural single source of truth for all AI agents, assistants, and LLMs working on this repository. Follow the folder responsibilities and boundary rules below.

## Directory Layout

```text
.
|-- AGENTS.md
|-- CLAUDE.md
|-- messages/                 # next-intl JSON messages (repo root)
|-- public/                   # static assets
|-- next.config.ts            # Next + next-intl plugin config
|-- tsconfig.json             # `@/*` points to `src/*`
+-- src/
    |-- app/                  # Next.js App Router (routing + layouts only)
    |-- components/
    |   +-- ui/               # reusable, presentational primitives ONLY
    |-- features/             # business/domain ownership (feature-first)
    |   |-- auth/
    |   |-- cart/
    |   |-- checkout/
    |   |-- home/
    |   |-- navigation/
    |   |-- products/
    |   |-- categories/
    |   +-- ...               # new ecommerce features go here
    |-- shared/               # reusable infrastructure (no domain logic)
    |   |-- lib/              # shared clients (fetch wrappers, SDK instances)
    |   |-- hooks/            # generic reusable hooks (non-domain)
    |   |-- utils/            # helpers like `cn`, formatters, etc.
    |   |-- constants/        # cross-feature constants (keys, enums)
    |   +-- types/            # cross-feature types (API response, core models)
    |-- stores/               # global cross-feature state only
    +-- i18n/                 # next-intl routing/navigation helpers
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
  - Cross-feature imports are allowed, but prefer the owning feature's public surface:
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
  - If the code \"speaks ecommerce\" (cart totals, product pricing rules), it belongs in that feature.

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

Pages in `src/app/` should mostly compose feature-level \"page components\".

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
- It's tied to a domain (cart, checkout, auth, products, categories).
- It changes when that domain evolves.
- It uses feature state, feature services, or feature-specific types.

Put it in **shared** when:
- It's infrastructure (API client), a generic helper (`cn`, `formatMoney`), or cross-feature types (`ApiResponse`).
- It has no knowledge of ecommerce concepts.

Put it in **components/ui** when:
- It's a pure presentational primitive with no domain ownership.
- It can be used anywhere without importing business logic.

## Ecommerce Examples (Where New Code Goes)

- Add \"Wishlist\":
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

- Putting domain logic in `src/app/` (pages/layouts become \"god components\").
- Creating global folders by file type (e.g. `src/services/*`, `src/hooks/*`) instead of feature ownership.
- A giant `shared/components` dumping ground.
- Feature stores placed in `src/stores/`.
- Deep cross-feature imports into another feature's internals (prefer feature public exports).
- Deep route-only component folders that duplicate features (keep folders shallow).

## Git Workflow (Base -> Client Branches)

### Branch model
- `main` = shared/base project. Generic, reusable, stable. Never contains client-specific changes.
- Each client gets its own branch created from `main`: `git checkout -b project/<name> main`
  (e.g. `project/catch-beauty`). It starts identical to Base (all features).
- Daily work: commit directly on `project/<name>`, or use sub-branches
  `project/<name>/feature-x` merged back into it. Both allowed.

### Reference folder
- `Catch-Beauty-Ecommerce/` is a gitignored reference implementation for comparison only.
  Never copy it as a starting point, never `git add` it. Verify ignore with
  `git check-ignore -v Catch-Beauty-Ecommerce/`.

### What a client branch may do
- Add, remove, modify, or simplify Base features; change CSS tokens, branding,
  logos, metadata, content, translations. Goal is NOT to stay identical to Base.
- Before implementing, check whether Base already covers the need; keep changes
  minimal and follow the folder-boundary rules above.

### Merge direction (one-way)
- `main` -> project branches (via `git fetch origin; git merge origin/main`). Never rebase shared history.
- Project -> `main` is forbidden, except intentional promotion of shared functionality:
  make the fix on `main` via small PR, then merge `main` into the project branch.

### Commit convention
- `chore: ...` for repo hygiene, `feat(<project>): ...` / `fix(<project>): ...` for client work
  (e.g. `feat(catch-beauty): remove fast-shipping, single cart`). `main` history stays generic.

### Verification before commit/push
- `git status --short --branch`, `git diff --stat`, `npx tsc --noEmit`,
  confirm reference folder absent from diff and `main` untouched.

### Assistant permission rule
- AI agents must never commit or push without the user's explicit permission
  (e.g. `go`, `commit`, `push`). Plan and show diffs first, wait for approval.

