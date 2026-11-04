# Static Sections on the New Homepage

Per the product decision ("same as Stitch; if the backend doesn't support it,
static is fine"), the following sections render **static content** because the
existing backend provides no equivalent data. All of them live in
`src/features/home/components/static/` and are fully translated (en/ar).

| Static section | File | Why static | Notes |
|---|---|---|---|
| Ribbon ticker (National Beauty Week, code CATCH) | `AnnouncementTicker.tsx` | Marketing copy; no Announcements API | "Explore Deals" links to the real `/categories` page |
| Hero editorial side cards (K-Beauty / Makeup) | `HeroEditorialCards.tsx` | CMS `sliders` returns only the hero creative; there is no "editorial promo" entity | Visuals copied from the approved Stitch design; links go to real pages (`/tags`, `/categories`) |
| Perks strip (Genuine, Express Delivery, Flexible Payments, 14-Day Returns) | `PerksStrip.tsx` | Trust/value-prop copy; no API | "Tabby & Tamara" from the mock is generalized to "Flexible Payments" because the backend reports BNPL disabled — no misleading claims; payment-specific rows appear automatically if BNPL is later enabled in settings (product-card installments) |
| Catch Beauty Journal (3 editorial cards) | `BeautyJournal.tsx` | No blog/articles API exists | Cards intentionally have **no** dead CTA links since no real article destination exists |
| Journal/hero imagery | (same files) | Design-shipped Google-CDN images | Fall back to the section background color asset URLs from the Stitch screen |
| Footer newsletter band | `features/navigation/components/footer/Footer.tsx` | No subscribe endpoint exists | Input + button render disabled with an "Available soon" title — no fake success behavior |
| Footer payments strip | (same file) | Real gateway array is behind `/general/settings`; the visual trust row is decorative | Tabby/Tamara chips appear only when settings enable them |
| Footer app badges | (same file) | No store links configured in settings | Decorative store tiles |
| Header "Download App" chip + authenticity line | `TopUtilityBar.tsx` | Marketing labels | Non-interactive decorative chips |

## Static content rules

- Static sections never invent **commerce data** (products, prices, stock,
  discounts). They carry only marketing text/design visuals.
- All static copy ships in both `messages/en.json` and `messages/ar.json`
  (namespaces `home.ticker`, `home.heroEditorial`, `home.perks`,
  `home.journal`, `footer.*`, `header.utility`).
