# Nest

An AI-powered transition navigator for Georgia foster youth aging out of care.

KSU CCSE C-Day Spring 2026 · Project **UC-151-197** · [cmt3.research.microsoft.com/CDAY2026](https://cmt3.research.microsoft.com/CDAY2026)

## The problem

Every year, hundreds of Georgia foster youth age out of the system at 18 with little more than a trash bag of belongings and a packet of phone numbers. Within a year, nearly 1 in 4 will experience homelessness; a third will be arrested; fewer than 3% will earn a college degree by 26. The services they need — Chafee ETV, Medicaid extension, HUD Family Unification Vouchers, HB 136 tuition waivers — exist. What's missing is a single place to understand what applies to **them**, by county, by age, by status, at the moment they need it.

## What Nest does

A mobile-first app that turns a 250-page DFCS transition handbook and a dozen scattered benefit programs into a personalized 90-day plan. Youth onboard in under two minutes, and from there the app:

- Answers eligibility questions in plain language with cited sources (RAG over Georgia foster-care policy documents)
- Routes crisis queries ("I'm not safe tonight") straight to 988 / 211 Georgia / local support instead of chatting back
- Surfaces the six GA programs they most likely qualify for as a checklist, not a dense PDF
- Holds copies of their vital documents (birth certificate, SSN card, high-school transcript) in a vault they keep when they age out
- Celebrates each completed task so the work of preparing for independence feels earned, not endless

Demo persona: **Maria, 18, Cobb County**, aging out of a group home, no birth certificate, wants to enroll at KSU.

## Features

| # | Feature | What it does |
|---|---------|--------------|
| 1 | Onboarding | 8-step guided intake: name, age, county, documents, education, housing, health, review |
| 2 | Home — 90-day plan | Top three tasks ranked by urgency (coral = critical, amber = soon, sage = done) |
| 3 | Path | Five Georgia zones surfacing the next step in housing, benefits, education, health, and community |
| 4 | Benefits | Six curated GA programs: Chafee ETV, EYSS, GA Medicaid Extension, KSU ASCEND, HUD FYI, HB 136 tuition waiver |
| 5 | Ask Navigator | RAG-backed chat that cites the source document for every answer, with a human-escalation path for crisis prompts |
| 6 | Emergency | 988, 211 Georgia, Crisis Text Line, Wellroot — one tap, no nav bar to distract |
| 7 | Document Vault | Encrypted stub for vital records youth can carry past the end of state care |
| 8 | Success Cards | Framer Motion micro-celebrations when a 90-day task flips to done |

## Stack

**Frontend** (`frontend/`): React 18, Vite 5, TypeScript, Tailwind 3, shadcn/ui, framer-motion, zustand, react-router, sonner, react-hook-form + zod.

**Backend** (`backend/`): FastAPI, LangChain, ChromaDB, HuggingFace sentence-transformers (`all-MiniLM-L6-v2`) for embeddings, Groq `llama-3.3-70b-versatile` for generation.

**RAG corpus:** Georgia DFCS Transitional Living handbook + curated county-level resource JSON.

## Running locally

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # http://localhost:8080
npm run build      # production bundle
npm run lint       # clean: 0 errors, 0 warnings
```

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then paste your Groq key (console.groq.com/keys)
uvicorn app.main:app --reload --port 8000
```

API surface:

- `GET /health` → `{ ok, environment, model, groq_api_key_configured }`
- `POST /chat` → `{ answer, sources[], fallback, route_to_emergency }`. Request body is `{ query, user_profile }`. The `route_to_emergency` flag triggers the Emergency screen on crisis keywords; `fallback: true` indicates the retriever had no confident match and the answer points the user to 211 Georgia.
- `POST /intake` → `{ normalized_profile, eligibility[], tasks[], bestfit_url, days_remaining }`. Used by the Benefits page to surface the BestFit deep link (Georgia public benefits screener) and by the app's planning layer for days-until-aging-out. Request body is `{ user_profile }`.

See `backend/app/schemas.py` for the canonical Pydantic shapes; `frontend/src/lib/api.ts` mirrors them in TypeScript. The frontend's zustand `Profile` maps into `UserProfile` via `frontend/src/lib/profileMap.ts`.

## Repo layout

```
frontend/              React + Vite + TypeScript (Stephen)
  src/pages/           Home, Path, Benefits, Navigator, Vault, Emergency, Onboarding/, NotFound
  src/components/      layout (AppShell, BottomNav, TopBar), ui/ (shadcn primitives)
  src/store/           zustand slices — profile (persisted), chat, intake, theme
  src/lib/             api client, profile→backend mapper, personalize rules, safeStorage
  src/data/            benefits + task fixture content used by the client rules engine

backend/               FastAPI + LangChain + ChromaDB (Tylin)
  app/                 FastAPI entry, Pydantic schemas, services/ (eligibility, tasks, intake)
  rag/                 ingest, retriever, chain, prompt
  data/                georgia_resources.json
  tests/               pytest — /intake, eligibility, chat-logic

Background Info/       Shared reference PDFs (DFCS handbook, CMT templates, etc.)
PLAN.md                Living coordination doc — who is working on what
scripts/plan           CLI helper for claiming / completing tasks in PLAN.md
.githooks/             pre-commit warning when editing files under someone else's active task
```

## Coordination

Every teammate reads **PLAN.md** before starting work. Status updates (🟡 in progress, ✅ done, ⛔ blocked) commit as their own atomic changes and push to `main`. The pre-commit hook warns when you touch a file that's claimed by someone else. Full protocol is in PLAN.md.

Helper CLI for lazy typists:

```bash
./scripts/plan claim 2.1       # mark a task as yours (🟡)
./scripts/plan done 2.1        # mark complete (✅)
./scripts/plan block 2.1 "reason"
./scripts/plan handoff 2.1 Tylin
./scripts/plan ls --mine
```

## Team

- **Stephen Sookra** — frontend + pitch lead
- **Tylin Delaney** — backend RAG + FastAPI
- **Brenden Bryant** — poster + light coding
- **Advisor:** Dr. Richard Gesick (KSU CCSE)
- **Institutional partner:** Lauren Padgett, KSU ASCEND (Advancing Scholarship to Complete Education for Navigating Differences)

## C-Day 2026

- **Submission:** Monday **April 20, 2026 · 5:00 PM ET** (CMT + SharePoint UC-151-197)
- **Event:** Wednesday **April 29, 2026 · 4:00–7:30 PM ET** · Marietta Event Center (check-in 3:30 PM)
- **Project page:** [cmt3.research.microsoft.com/CDAY2026](https://cmt3.research.microsoft.com/CDAY2026) (Paper ID 197)

Reviewer feedback (CMT round 1) called out three things judges will ask about on the floor:

1. Usability-study numbers (target: 10× reduction in time-to-first-benefit vs. the DFCS packet)
2. UI screenshots of the 90-day Home dashboard and the Emergency screen
3. AI-safety handling — what happens if the RAG returns incorrect eligibility information. Nest answers this with source citation on every response, deterministic crisis routing, and a fallback to 211 Georgia when the model is uncertain.
