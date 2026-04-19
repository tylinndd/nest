# Nest

AI-Powered Transition Navigator for aging-out Georgia foster youth. KSU CCSE C-Day Spring 2026 · UC-151-197.

## Structure

```
frontend/    React + Vite + TypeScript + Tailwind (Stephen)
backend/     FastAPI + LangChain + ChromaDB (Tylin)
scripts/     plan CLI (PLAN.md helper)
.githooks/   pre-commit ownership warning
PLAN.md      Single source of truth — who's working on what
```

## Getting started

**Frontend:**
```
cd frontend
npm install
npm run dev
```

**Backend:**
```
cd backend
pip install -r requirements.txt
```

## Coordination

Before starting any task, read `PLAN.md` and use `./scripts/plan claim <task#>` to take ownership. The pre-commit hook warns if you edit files under someone else's active (🟡) task. See PLAN.md for the full protocol.

## Team

- Stephen Sookra — frontend + pitch
- Tylin Delaney — backend RAG + FastAPI
- Brenden Bryant — poster + light coding
- Advisor: Dr. Richard Gesick · Institutional partner: Lauren Padgett (KSU ASCEND)
