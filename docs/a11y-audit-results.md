# Nest accessibility audit — 2026-04-22

Pre-C-Day Lighthouse + axe-core pass against the production build
(`npm run build` → `npm run preview` at 127.0.0.1:4173). Tool:
Lighthouse CLI (`npx lighthouse --only-categories=accessibility`).
Headless Chromium, cold start per page.

## Scope

Public routes — the surfaces an evaluator or foster-youth visitor
lands on before onboarding:

- `/` (Home, authed — tested with persisted demo profile)
- `/privacy`
- `/how-it-works`
- `/about`
- `/glossary`

Authed in-shell routes (`/path`, `/navigator`, `/vault`, `/settings`,
`/saved`, `/your-data`) inherit the `<main id="main-content">`
landmark from `AppShell.tsx` and were not re-scored individually.

## Before

| Route | a11y score | Violations |
|---|---|---|
| `/` | 96 | `color-contrast` — onboarding eyebrow chip `#D97706` on cream `#FBF8F4` at 2.96 — ratio 3.15:1, WCAG AA needs 4.5:1 for small text |
| `/privacy` | 91 | `landmark-one-main` (no `<main>`), `color-contrast` on Live-network-log error chip (`#E07B6A` / `nest-coral` on `bg-nest-coral/15` ≈ 2.34:1 at 10px semi-bold) |
| `/how-it-works` | 94 | `landmark-one-main` |
| `/about` | 94 | `landmark-one-main` |
| `/glossary` | 94 | `landmark-one-main` |

## Fixes

### 1. Darken `nest.amber` token

`tailwind.config.ts` + `src/index.css`: `#D97706` → `#B45309`.
Shifts the onboarding eyebrow, warning state, and every future amber
accent from 3.15:1 → ~4.96:1 on cream. Lightness drop is ~5 points —
still reads as the same warm amber in context.

### 2. Darken Network Log error-chip text

`src/components/NetworkLog.tsx`: swap `text-nest-coral` → a darker
hex `text-[#9B3528]` on the error variant, matching the existing
pattern already in use on the success chip (`text-[#2E7D5B]`
instead of `text-nest-sage` for the same reason). Coral tint
background is preserved. Ratio on the blended chip background
climbs from 2.34:1 → ~5.69:1.

Left the brand `nest.coral` token alone — it's still used for
icons, borders, and larger text where the unadjusted hex reads
fine.

### 3. Add `<main>` landmarks to public routes

Six public-route files had their outer layout `<div>` converted to
`<main>`:

- `src/pages/Privacy.tsx`
- `src/pages/HowItWorks.tsx`
- `src/pages/About.tsx`
- `src/pages/Team.tsx`
- `src/pages/Glossary.tsx`
- `src/pages/Demo.tsx`
- `src/pages/NotFound.tsx`

Authed routes were already wrapped by `AppShell` which renders
`<main id="main-content">` plus a skip-link. Onboarding routes get
the same from `OnboardingLayout`.

## After

All five audited routes now score 100/100 with zero failing
accessibility audits:

| Route | a11y score | Violations |
|---|---|---|
| `/` | 100 | — |
| `/privacy` | 100 | — |
| `/how-it-works` | 100 | — |
| `/about` | 100 | — |
| `/glossary` | 100 | — |

## Not fixed

Nothing carried over — every violation the tool surfaced on public
routes has been addressed. Authed-shell routes share a single
`<main>` landmark via `AppShell`, so they don't re-trigger
`landmark-one-main` either.

## How to re-run

```bash
cd frontend
npm run build
npm run preview -- --port 4173 --host 127.0.0.1 &
npx lighthouse "http://127.0.0.1:4173/<route>" \
  --only-categories=accessibility \
  --output=html \
  --output-path=./lh-<route>.html \
  --chrome-flags="--headless=new --no-sandbox"
```

Raw JSON snapshots from this run are in `/tmp/nest-lh-after/*.json`
(not checked in — regenerate any time).
