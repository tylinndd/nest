# Nest — Plan & Coordination

> Living status doc for Stephen, Tylin, Brenden. Updated on every task change and pushed to `main`. This file is the single source of truth for who is working on what.

**Project:** AI-Powered Transition Navigator for aging-out Georgia foster youth (KSU CCSE C-Day Spring 2026 · UC-151-197).
**Team:**
- Stephen Sookra — frontend + pitch lead
- Tylin Delaney — backend RAG + FastAPI
- Brenden Bryant — poster + light coding
- Advisor: Dr. Richard Gesick · Institutional partner: Lauren Padgett (KSU ASCEND)

**Deadline:** Monday April 20, 2026 · 5:00 PM ET (SharePoint + CMT submission). C-Day event Wed April 29, 2026 · Marietta Event Center, 4–7:30 PM (check-in 3:30 PM).
**Repo:** https://github.com/tylinndd/nest (monorepo — `frontend/` + `backend/`)

---

## Status Dashboard

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked

| # | Component | File(s) | Owner | Status | Deps | Notes |
|---|-----------|---------|-------|--------|------|-------|
| 1.1 | Brand palette + typography | `frontend/tailwind.config.ts`, `frontend/src/index.css` | Stephen | ✅ | — | Nest green #1B4332, amber #D97706, cream #FAF7F2, sage #52B788, coral #E07B6A |
| 1.2 | Onboarding 8-step flow | `frontend/src/pages/Onboarding/*` | Stephen | ✅ | 1.1 | name → age → county → documents → education → housing → health → review |
| 1.3 | Home + 90-day plan hero | `frontend/src/pages/Home.tsx` | Stephen | ✅ | 1.1 | Coral/amber/sage task borders; Success Card |
| 1.4 | Path — 5 Georgia zones | `frontend/src/pages/Path.tsx` | Stephen | ✅ | 1.1 | Zone 1 amber active, 2–5 locked |
| 1.5 | Benefits — 6 programs + badges | `frontend/src/pages/Benefits.tsx` | Stephen | ✅ | 1.1 | Chafee ETV, EYSS, GA Medicaid Ext, KSU ASCEND, HUD FYI, HB 136 |
| 1.6 | Ask Navigator chat UI | `frontend/src/pages/Navigator.tsx` | Stephen | ✅ | 1.1 | Gray SOURCE pill, cream input bar |
| 1.7 | Document Vault stub | `frontend/src/pages/Vault.tsx` | Stephen | ✅ | 1.1 | 5-doc demo, encrypted copy |
| 1.8 | Emergency screen | `frontend/src/pages/Emergency.tsx` | Stephen | ✅ | 1.1 | 988, 211 GA, Crisis Text, Wellroot; hides bottom nav |
| 1.9 | BottomNav + AppShell | `frontend/src/components/layout/*` | Stephen | ✅ | 1.1 | Emergency tab in coral; route-aware hide |
| 1.10 | Success Cards micro-interaction | `frontend/src/components/ui/SuccessCard.tsx` | Stephen | ✅ | 1.1 | Framer Motion; Task #22 on poster/demo |
| 1.11 | Frontend cleanup pass (a11y + dead code + lint) | `frontend/` | Stephen | ✅ | 1.1–1.10 | Global focus-visible ring, progressbar ARIA, stripped Lovable scaffold, deleted ~1500 lines of unused shadcn primitives. Lint 0/0, typecheck clean, CSS bundle 50.97 → 44.80 kB |
| 2.1 | FastAPI `/chat` endpoint | `backend/app/main.py` | Tylin | 🟡 | — | Scaffold in place. Contract updated to `/chat` — see Shared Contracts. Known import paths need fixing (`app.rag.*` references don't match `backend/rag/` layout; `retreiver.py` filename typo) |
| 2.2 | LangChain RAG pipeline | `backend/rag/` | Tylin | 🟡 | 2.1 | `chain.py` + `retreiver.py` scaffolded (crisis keyword routing, county rerank, MiniLM embeddings, GPT-4o-mini). Needs working imports + corpus indexed |
| 2.3 | ChromaDB indexing of 250-page DFCS PDF | `backend/data/`, `backend/rag/ingest.py` | Tylin | CHECK | — | `ingest.py` stub exists; corpus not yet chunked / embedded |
| 2.4 | Rules engine for 6 benefit programs | `backend/rules/` | Tylin | CHECK | — | Deterministic eligibility from profile |
| 3.1 | Wire Navigator → `/chat` | `frontend/src/pages/Navigator.tsx` | Stephen | check | 2.1 | Replace stub reply with fetch; honor `route_to_emergency` flag |
| 3.2 | Wire Benefits → rules JSON | `frontend/src/data/benefits.json` | Stephen | ⬜ | 2.4 | Replace placeholder.ts shape with rules output |
| 4.1 | Poster PDF | `/deliverables/poster.pdf` | Brenden | ⬜ | 1.* | 8-feature layout + demo persona Maria |
| 4.2 | 30-sec flash video | `/deliverables/flash.mp4` | Brenden + Stephen | ⬜ | 1.* | Optional, targets C-Day loop |
| 4.3 | CMT submission (cmt3.research.microsoft.com/CDAY2026) | — | Stephen | ⬜ | 4.1 | Title/abstract/authors confirmed |
| 4.4 | SharePoint UC-151-197 deposit | kennesawedu.sharepoint.com | Stephen | ⬜ | 4.1, 4.2 | Final artifacts |
| 4.5 | Lauren Padgett feedback pass | — | Stephen | ⬜ | 1.* | Target Sunday April 19 evening |

---

## Coordination Protocol

1. **Before starting a task:** set status to 🟡, commit PLAN.md, push. This is your lock.
2. **After finishing:** flip to ✅, commit PLAN.md, push.
3. **If blocked:** set to ⛔, add a one-line note explaining why.
4. **Before starting ANY task:** run `git pull` and check this file. If someone else has 🟡 on overlapping files, coordinate first.
5. **Hotfixes:** skip the protocol — commit the fix directly, update PLAN.md after. Don't let process block a real emergency.
6. **PLAN.md commits are atomic.** Never bundle a status update with code changes. One-line status change → commit → push.
7. **Commit messages:** use `status: [task #] [emoji] [description]` for plan updates (e.g., `status: 2.1 🟡 starting FastAPI /ask`).
8. **Handoffs:** when your part is done and someone else continues, add `→ [Name]` in the Notes column.
9. **Stale locks:** a 🟡 task requires a timestamp in Notes (e.g., `🟡 Apr 18 11pm`). If no code or PLAN.md commit happens within 24 hours, the lock is stale. Any teammate can claim it by updating to their name + new timestamp and pinging the original owner.
10. **Contract changes require announcement.** If you modify anything in the Shared Contracts table, you MUST notify all consumers listed before committing. Mark contract changes with `⚠️ CONTRACT` in the commit message.

---

## Shared Contracts

> Document field names, data formats, API shapes, or any interface that multiple people depend on. Drift here causes bugs that neither person sees until integration.

| Contract | Owner | Consumers | Definition |
|----------|-------|-----------|------------|
| `POST /chat` | Tylin | Stephen | Request: `{ query: string, user_profile: UserProfile }`. Response: `{ answer: string, sources: string[], fallback: boolean, route_to_emergency: boolean }`. See `backend/app/schemas.py` — ground truth lives in Pydantic. |
| `GET /benefits` | Tylin | Stephen | Response: `Benefit[]` where `Benefit = { id, title, eligibility, summary, source, status: "qualify" \| "action" \| "auto", cta? }`. Matches `frontend/src/data/placeholder.ts` Benefit type. _Not yet implemented._ |
| `UserProfile` envelope | Stephen | Tylin | `{ age?: number, county?: string, status?: string, months_in_care?: number, college_intent?: string, top_concerns: string[], enrolled_at_ksu?: boolean, aged_out_at_18?: boolean, in_foster_care_at_18?: boolean, documents: Record<string, boolean> }` — sent on `/chat`. Frontend store needs a mapper; current zustand store shape differs from backend `UserProfile` and will need reconciliation before wiring 3.1. |
| Crisis routing | Tylin | Stephen | Backend flips `route_to_emergency: true` on crisis keywords (`suicide`, `kill myself`, `unsafe`, `homeless tonight`, etc.). Frontend must navigate to `/emergency` when flag is true instead of rendering the chat reply. |

---

## Decisions

> Numbered decisions with rationale. Lock them with a date and who approved. Reference by number (D1, D2) in the status table or code comments.

### D1 — 6 MVP features + Vault stub + Success Cards = 8 on the poster

PDF 1 (4/18) is authoritative for MVP cuts: no community forum, no skills builder, no full benefits screener (link out to BestFit). The poster and C-Day submission show 8 features (6 MVP + Document Vault stub + Success Cards); the live demo uses a 3-moment script (PDF→plan, 4 benefits, couch-surfing chatbot). Keeps C-Day narrative tight while matching the aspirational feature list from the 4/12 .docx.

**Locked 2026-04-19 by Stephen.**

### D2 — Single monorepo at `tylinndd/nest` (supersedes prior two-repo plan)

All team work lives in one repo: `frontend/` (Stephen), `backend/` (Tylin), `Background Info/` (shared reference PDFs), with `PLAN.md`, `.githooks/`, and `scripts/` at root so the pre-commit coordination hook fires on every teammate's commits. Earlier two-repo plan (Stephen/nest + tylinndd/nest) abandoned because PLAN.md can only be authoritative when it sits in the same repo everyone commits to.

**Locked 2026-04-19 by Stephen.**

### D3 — Demo persona Maria, 18, Cobb County

All placeholder data uses Maria aging out of a Cobb County group home, no birth certificate, wants KSU. Keeps the story consistent across onboarding defaults, tasks, Navigator reply, and pitch.

**Locked 2026-04-19 by Stephen.**

### D4 — Emergency palette: nest-green field, coral CTA (not red)

Trauma-informed design — red destructive tone feels alarming. Full nest-green screen signals safety; coral Call 911 button carries the urgency without the fear response.

**Locked 2026-04-19 by Stephen.**

---

## Open Questions

> Things that need a decision before work can proceed. Tag the person who needs to decide.

- [ ] **Q1:** Backend hosting URL for `/chat` during C-Day demo — needs Tylin's input. Ngrok, Vercel, or Render?
- [ ] **Q2:** Whether to ship public repo before C-Day or after — needs Stephen's call after poster finalized.
- [ ] **Q3:** Flash video script (optional deliverable) — needs Brenden to confirm commit. Deadline to call it: Sun 2026-04-19 EOD.

---

_Last updated: 2026-04-19 by Stephen._
