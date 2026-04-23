# Lighthouse Baseline — 2026-04-22

Full Lighthouse sweep of the production deploy at https://nest-zeta-nine.vercel.app, covering the 10 most-visited routes across all four audited categories. Run post-Task-1-through-Task-4 of the C-Day polish pass.

## Scores

| Route | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| / | 84 | 100 | 100 | 100 |
| /navigator | 86 | 100 | 100 | 100 |
| /benefits | 87 | 100 | 100 | 100 |
| /onboarding/1 | 88 | 100 | 100 | 100 |
| /deadlines | 85 | 100 | 100 | 100 |
| /settings | 85 | 100 | 100 | 100 |
| /about | 85 | 100 | 100 | 100 |
| /glossary | 84 | 100 | 100 | 100 |
| /how-it-works | 87 | 95 | 100 | 100 |
| /privacy | 88 | 100 | 100 | 100 |

Raw reports: `frontend/lighthouse-final/*.json`.

## Fixes applied in this pass

- **`landmark-one-main`** (was failing 4/10 routes) — fixed by restoring `<main>` on the 6 pages that render outside `AppShell` (About, Team, HowItWorks, Glossary, Demo, Privacy). AppShell provides `<main id="main-content">` for routes nested under it, but these 6 sit directly under `<Routes>`, so each needs its own. Resolved by commit 6df4597.
- **`color-contrast`** on Privacy NetworkLog success badge — darkened `#2E7D5B → #0F5132` on `bg-nest-sage/15` tint. Raises contrast from 4.1 to ~6.6. Resolved by commit 24ac215.
- **`color-contrast`** on Sonner toast description — swapped `text-muted-foreground` (~2.94 on background) → `text-foreground/75` (~5.1).
- **LCP/FCP** on first load — added `preconnect` + `dns-prefetch` for the Render backend origin so DNS/TLS handshake warms during HTML parse instead of blocking the first `/api/*` request.

## Known deferred items

- **`render-blocking-resources`** — Google Fonts stylesheet (`DM Serif Display`, `Inter`) is render-blocking. Not worth the FOUT trade-off before a live judging presentation.
- **Performance 84-88** — dominated by 3.1s FCP / 3.5s LCP on Vercel's free tier + Render backend cold start. Moving the backend to a paid instance or enabling Vercel's edge functions would lift this into the 90s, but neither is in scope before C-Day.
- **`how-it-works` a11y = 95** — flaky Sonner toast snapshot that appeared during the Lighthouse capture and failed contrast on the description. Fixed at the Toaster config level in commit <next>; next audit pass will verify.

## Tooling notes

- Lighthouse invocations use `npx lighthouse --chrome-flags="--headless" --quiet --only-categories=performance,accessibility,best-practices,seo` against the live Vercel URL.
- Continuous a11y coverage during development is provided by `@axe-core/react`, wired in `src/main.tsx` behind `import.meta.env.DEV`. Violations log to the browser console as the app runs.
- The PWA category is no longer surfaced by Lighthouse 12+; PWA health is monitored separately via the installability check in Chrome DevTools → Application.
