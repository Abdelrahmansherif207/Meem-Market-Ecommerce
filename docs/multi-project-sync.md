# Multi-Project Sync Playbook

How the shared codebase serves multiple projects (brands) from one repo,
and how to move changes between `main` and the project branches without
losing anything.

## Model

- `main` is the **source of truth for mutual features and code** shared by all
  projects. It stays generic, reusable, and stable. It never contains
  project-specific branding, tokens, defaults, or features.
- Each project gets its own long-lived branch created from `main`:
  `git checkout -b project/<name> main` (e.g. `project/catch-beauty`,
  `project/meem-market-kuwait`). It starts identical to `main`, then diverges
  with its own design tokens, branding, logos, metadata, defaults, content,
  translations, and feature set (added, simplified, or removed).
- Project-specific work lives **only** on its project branch and is **never**
  merged back into `main`.
- Mutual work (features, fixes, UX improvements every project wants) lands on
  `main` via small pull requests, then each project branch pulls it down.

## Sync direction (one-way, merge only)

- `main` -> project branches via `git merge origin/main`.
- **Never rebase shared history.** Rebase recreates already-published brand
  commits (new hashes), abandons the originals, requires force-push, breaks
  other checkouts/CI/sync tooling, and replays the same conflicts once per
  commit. Merge preserves history, pushes normally, and resolves each conflict
  once.
- Preservation of brand files is decided by **conflict resolution**, not by
  strategy: merge and rebase converge on identical file content. Strategy only
  decides history shape and safety.

## Keeping syncs clean: brand-neutral PRs on main

Every hardcoded brand value in shared code is future conflict debt. Mutual PRs
on `main` must stay brand-neutral so they apply onto any brand untouched:

- CSS variables (e.g. `var(--color-primary)`) instead of hex values.
- i18n keys in `messages/*.json` instead of hardcoded strings.
- No brand names, logos, or project-specific defaults outside the project
  branches.

## Sync procedure (per project branch)

Run on the project branch with a clean tree:

1. `git fetch origin` — local `origin/main` goes stale; never trust it.
2. Recon: `git log --oneline <old>..origin/main` to enumerate incoming work.
   Intersect `git diff --name-only <old>...origin/main` with the files the brand
   touches (tokens, messages, branding, removed features) for the conflict
   surface.
3. Safety ref: `git branch backup/<project>-pre-sync <project>` (rollback
   point, deleted after a successful sync).
4. `git checkout <project> && git merge origin/main`.

## Standing conflict-resolution rule

- **Brand side wins** on design tokens, branding, logos, metadata, content,
  translations wording, and feature removals. A file the brand deleted stays
  deleted: "deleted here, unmodified there" auto-resolves; only a
  modify/delete (main touched a file the brand deleted) needs a human — keep
  the deletion.
- **`main` wins** on shared functionality and its additive changes: new
  components, new i18n keys, refactors of shared code.

## Verification after resolving

- `git status --short --branch`, `git diff --stat`, `npx tsc --noEmit`.
- `messages/*.json` still parse and keep brand wording plus main's new keys.
- Brand tokens intact (e.g. `rg "color-primary" src/app/globals.css`).
- Brand-only files untouched — the merge delta must equal main's delta
  file-for-file:
  `diff <(git diff --name-only <base>..HEAD) <(git diff --name-only <base>..origin/main)`.
- Reference folders absent from the diff; `main` itself untouched.

## Rollback

- Messy merge in progress: `git merge --abort` (branch unchanged).
- Bad merge commit: `git reset --hard backup/<project>-pre-sync`.
- Push only with explicit permission, and never `--force` on a project branch.

## Rolling out a new project

1. `git checkout -b project/<new-name> main` (starts with all mutual features).
2. Apply brand overlay commits (tokens, logos, metadata, content, feature
   set) following the feature-first folder rules in `AGENTS.md`.
3. From then on, sync with `main` using this playbook. The playbook itself
   arrives via the same channel — an ordinary merge.

### Variant: clone an existing project branch

When a new project should be a **literal copy of an existing project**, fork
that project branch instead of `main`. This is the right call when the new
storefront must inherit features that have not been promoted to `main` yet
(e.g. guest checkout, cancellation, cart UX).

```bash
git fetch origin
git checkout project/<source>
git pull --ff-only
git checkout -b project/<new> project/<source>
```

Then apply the brand overlay as the **first commit on the new branch**:
site defaults, contact/social details, translations, info content, phone
country defaults, and backend settings. Do not merge the new branch back into
the source project — both branches diverge from the same base.

`project/meem-kuwait` was created this way from `project/meem-riyadh-new`.
It is a full copy plus the Kuwait overlay; `project/meem-riyadh-new` is
untouched.

## Backend settings are the source of truth

Storefront code (constants, fallback copy) exists only to keep the UI usable
when the API is missing, unreachable, or still returning placeholders. The
real values must always be written to the backend first:

- `GET /api/v1/general/settings` — public, localized, used by the app.
- `GET /api/v1/settings` — admin read (Sanctum bearer, `view-settings`).
- `PUT /api/v1/settings` — admin write (Sanctum bearer, `update-settings`).

A settings write flushes the settings cache immediately, so the public
storefront reflects the new values without a redeploy or restart.

### Admin authentication

```bash
API="${API_URL:-https://meem.mohammedtareq.me/api/v1}"

TOKEN=$(curl -sS -X POST "$API/admin-login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.token")
```

- Token is a Sanctum bearer token valid for 7 days.
- Login is rate-limited to 5 requests/minute.
- Never commit the admin password. Pass it through `$ADMIN_PASSWORD`.

### Read the current settings

```bash
curl -sS "$API/settings" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Translatable fields are `{ "ar": "...", "en": "..." }` objects on the admin
endpoint; the public endpoint returns a single string resolved by the `lang`
header.

### Write the brand overlay

```bash
curl -sS -X PUT "$API/settings" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @settings-kuwait.json
```

Example payload (values in the Kuwait table below):

```json
{
  "site_name": { "ar": "سوق ميم الكويت", "en": "Meem Market Kuwait" },
  "site_desc": { "ar": "...", "en": "..." },
  "meta_desc": { "ar": "...", "en": "..." },
  "site_copy_right": { "ar": "...", "en": "..." },
  "site_email": "admin@meem.market",
  "email_support": "admin@meem.market",
  "facebook": "https://www.facebook.com/meemmarketkw1",
  "instagram": "https://www.instagram.com/meemmarketkw",
  "tiktok": "https://www.tiktok.com/@meemmarketkw",
  "snapchat": "https://www.snapchat.com/@meemmarketkw",
  "youtube": "https://www.youtube.com/@meemmarket6493",
  "phone": "22281130",
  "minimum_order_amount": 5,
  "options": { "currency": "KWD", "...": "full options object" }
}
```

Rules that save time:

- **Write `minimum_order_amount`**, not `minimumOrderAmount`. The response
  exposes `minimumOrderAmount`; only the snake_case key is writable.
- **`options` replaces the whole object** (except when
  `currency_selection_enabled` is present, which merges). Read the current
  `options` first, change only `currency`, and send the full object back.
- **Media is not written as JSON strings.** `logo`, `footer_logo`, and
  `favicon` are file uploads (`multipart/form-data`, ≤2 MB). Reuse the
  existing URLs unless the brand has new artwork.
- Extra keys are silently ignored; unknown payment-gateway codes are a 422.
- After the write, verify the public payload:
  `curl -sS "$API/general/settings" -H "Accept: application/json"`.

## Kuwait overlay reference

Values used by `project/meem-kuwait` (verified against the public Kuwait
site and social profiles):

| Setting | Kuwait value |
| --- | --- |
| Site name | `سوق ميم الكويت` / `Meem Market Kuwait` |
| Email | `admin@meem.market` |
| Phone | `22281130` (`+965 2228 1130`) |
| WhatsApp | `https://wa.me/96522281130` |
| Instagram | `https://www.instagram.com/meemmarketkw` |
| Facebook | `https://www.facebook.com/meemmarketkw1` |
| TikTok | `https://www.tiktok.com/@meemmarketkw` |
| Snapchat | `https://www.snapchat.com/@meemmarketkw` |
| YouTube | `https://www.youtube.com/@meemmarket6493` |
| Location | Al Rai, Kuwait |
| Currency | KWD displayed by default (`options.currency`); backend base/catalog stays USD |
| Delivery | Same day before 12:00 PM, next day after; fees from KWD 1.750 |
| App (Android) | `https://play.google.com/store/apps/details?id=market.meem` |

Currency note: the backend stores prices in its base currency (USD here) and
converts per request through `X-Currency`. Setting `options.currency: KWD`
makes KWD the storefront default; `src/app/[locale]/layout.tsx` prioritizes
`options.currency` over `base_currency_code` when resolving that default, so
do not switch the backend base currency just to change the displayed one.

Overlay files on the branch:

- `src/features/settings/constants.ts` — name, description, copyright,
  email, phone, WhatsApp, social fallbacks.
- `src/features/settings/lib/normalize.ts` — `buildWhatsAppUrl` country code
  (`965`) and local-number normalization.
- `src/app/[locale]/layout.tsx` — default display currency priority
  (`options.currency` → `base_currency_code`).
- `src/features/currencies/components/CurrencySwitcher.tsx` — SSR label uses
  the server-resolved default until the client store hydrates.
- `src/shared/utils/legacyBrand.ts` — localized brand replacement.
- `src/features/navigation/services/footerService.ts` — footer about link,
  contact fallbacks, app link.
- `src/features/navigation/components/meem/*` and
  `src/features/auth/components/*` — logo `alt` fallbacks.
- `src/features/auth/components/PhoneInputWithCountry.tsx` — default country.
- `messages/{en,ar}.json` — announcement, brand name, hero copy, footer title.
- `src/features/info/content/pageContent.ts` — contact, company, shipping,
  returns, stores, terms, and loyalty copy.

