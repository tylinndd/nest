# Nest — Product Requirements Document
> Version 1.0 | April 18, 2026 | KSU C-Day Spring 2026

---

## 1. Overview

**Product Name:** Nest  
**Tagline:** *The caring adult in your pocket.*  
**Type:** Mobile-first web application (PWA-ready)  
**Demo Date:** April 29, 2026 — KSU CCSE Computing Showcase (C-Day)  
**Poster Deadline:** April 20, 2026 @ 5:00 PM  

### One-Sentence Pitch
Nest is an AI-powered transition navigator that takes a Georgia foster youth's personal profile and generates a personalized 90-day action plan, benefit eligibility results, and local resource map — in under 10 seconds.

### Problem Statement
Every year, approximately 600–700 young people age out of the Georgia foster care system with no permanent family, no housing plan, and no guide beyond a 250-page government PDF. The outcomes are severe: ~20% become homeless immediately upon aging out, fewer than 10% earn a college degree, and 46.9% are unemployed by age 24. No Georgia-specific, AI-personalized, youth-facing transition navigator currently exists.

### Institutional Context
- **KSU ASCEND Program** (CARE Services) — direct campus partner; crisis escalation design validated by Lauren Padgett, ASCEND Director
- **Embark Georgia** — administers the Chafee ETV program (UGA/DFCS partnership)
- **Wellroot Family Services** — emergency housing partner (expanded Decatur TLP, Feb 2026)
- **BestFit** — Atlanta-based free public benefits screener; integrated as handoff for SNAP/general benefits

---

## 2. Goals & Success Criteria

| Goal | Success Metric |
|------|---------------|
| Demo generates a personalized plan | Maria persona → plan in < 10 seconds |
| Eligibility engine is deterministic | Zero LLM calls in eligibility logic; 100% rule-based |
| RAG chatbot stays grounded | Every response cites a source from the KB; "I don't know" fallback fires when no source found |
| Emergency Mode requires no login | Accessible from home screen before any onboarding |
| Institutional partnership is live | Lauren Padgett email sent with feature summary before April 20 |
| BestFit integration | CTA card appears after eligibility results with correct handoff URL |

---

## 3. Users

### Primary User
**Aging-out foster youth in Georgia**, ages 16–24.
- May have limited or no stable adult support
- High likelihood of complex developmental trauma (design must be trauma-informed)
- Primary device: smartphone
- Likely low tolerance for confusing UI or jargon

### Secondary Users (Demo Audience)
- C-Day judges (KSU CCSE faculty + industry reviewers)
- KSU ASCEND staff and students
- Lauren Padgett and CARE Services team

### Demo Persona
**Maria** — 18 years old, Cobb County, leaving a group home in 30 days, no birth certificate, wants to attend KSU.

---

## 4. Core Features

### F1 — 60-Second Conversational Intake
A 7-question chat-style onboarding flow. No dropdown forms, no jargon. Questions are warm and conversational.

**Questions (in order):**
1. How old are you? *(number stepper)*
2. What county are you in? *(searchable select — Georgia counties)*
3. Are you currently in foster care, or have you recently aged out? *(card select)*
4. About how long were you in foster care? *(segmented selector)*
5. Are you thinking about college, already enrolled, or not right now? *(card select)*
6. What's your biggest worry right now? *(multi-select chips)*
7. Do you have these documents? *(checklist toggles: birth certificate, SSN card, state ID, immunization records)*

**Output:** A `UserProfile` JSON object passed to the eligibility engine and RAG pipeline.

```ts
interface UserProfile {
  age: number;
  county: string;
  status: "in_care" | "aged_out";
  months_in_care: number;
  college_intent: "thinking" | "enrolled" | "not_now";
  top_concerns: string[];
  documents: {
    birth_certificate: boolean;
    ssn_card: boolean;
    state_id: boolean;
    immunization_records: boolean;
  };
  aged_out_at_18?: boolean;
  in_foster_care_at_18?: boolean;
  enrolled_at_ksu?: boolean;
}
```

---

### F2 — 90-Day Countdown Dashboard
The app's primary screen post-onboarding. Georgia law requires a 90-day transition plan before aging out — Nest turns this into an actionable visual countdown.

**Components:**
- Days remaining pill (`primary` background)
- Horizontally scrollable eligibility result cards (see F3)
- Vertically stacked task cards, sorted by urgency:
  - Green dot = complete
  - Yellow dot = due this week
  - Red dot = overdue
- Each task has a "Help me do this →" button that opens a step-by-step conversational guide via the RAG chatbot (F4)

---

### F3 — Eligibility Engine ("Am I Eligible?")
A **deterministic Python rules engine** — no LLM calls. Each result is explainable, testable, and reproducible.

**Programs covered by Nest's engine:**

| Program | Eligibility Trigger | What It Provides |
|---------|-------------------|-----------------|
| Chafee ETV | Age 18–25, 6+ months in care at age 14+ | Up to $5,000/year for education |
| EYSS (Extended Foster Care) | Aged out at 18, voluntary re-enrollment | Housing + services until age 21 |
| Georgia Medicaid Extended | Was in foster care at age 18 | Health insurance through age 26 |
| KSU ASCEND | Former foster youth enrolling at KSU | Full campus wraparound support |

**BestFit handoff** (not Nest's engine):
- After Nest's 4 results, a CTA card links to BestFit for SNAP, general Medicaid, WIC, TANF, and other public benefits
- Pitch framing: *"Nest handles what BestFit doesn't — the foster-youth-specific programs most screeners miss."*

**Each eligibility result returns:**
```ts
interface EligibilityResult {
  program: string;
  qualified: boolean;
  reason: string;          // plain language explanation
  what_it_provides: string;
  documents_needed: string[];
  next_step: string;
  apply_url?: string;
}
```

---

### F4 — RAG-Powered Conversational AI ("Ask Nest")
A chatbot grounded exclusively in a curated Georgia resource database. Cannot hallucinate — every response must cite a source from the knowledge base.

**Stack:** LangChain + ChromaDB + GPT-4o-mini or Claude Haiku

**Behavior rules:**
- Every response cites the source document: `[Source: Embark Georgia]`
- If no relevant source exists in the KB: *"I don't have that specific information. Please call 211 Georgia: dial 2-1-1."*
- User profile context is passed with every query for personalized responses
- No general internet access — grounded only in the curated KB

**Knowledge Base:** ~50 Georgia resource entries (JSON), categories:
- Housing (Wellroot, local shelters by county)
- Education (Embark Georgia, Chafee ETV, KSU ASCEND)
- Food assistance (SNAP via BestFit handoff, food banks)
- Legal aid
- Employment

**Demo query:**
> *"I'm 19, I aged out last year, I'm sleeping on a friend's couch in Cobb County, and I dropped out of KSU. What help can I get?"*

Expected: specific names, phone numbers, and a 3-step action plan in < 5 seconds.

---

### F5 — Document Vault *(MVP-optional)*
Users photograph and upload their vital documents. Stored locally (no cloud in MVP).

**Document checklist:** Birth certificate · Social Security card · State ID · Immunization records

Each missing document shows: *"Here's how to get this in Georgia"* with step-by-step instructions.

---

### F6 — Emergency Mode
Accessible with **zero account setup** — visible on the home screen before any onboarding begins.

**Trigger:** "I Need Help RIGHT NOW" button (always visible on entry screen)

**Content (static, no backend required):**
- 211 Georgia (tap-to-call)
- 988 Crisis Line (tap-to-call)
- Nearest shelter by county (Cobb County default for demo)
- DFCS 24-hour emergency line (tap-to-call)
- Wellroot emergency housing link

**Design note:** This screen must NOT look alarming. Calm, warm, clear. Destructive color used only for the badge label — not the background.

**Pitch language:** *"Crisis escalation design validated in consultation with KSU CARE Services."*

---

### F7 — Georgia Path Roadmap *(bonus layer)*
A visual, interactive road map from today to stable adulthood. Five zones:
`Right Now → Getting Stable → Moving Forward → Building → Thriving`

As tasks are completed, zones fill with color. Built with React + Framer Motion.

---

### F8 — Success Cards *(bonus layer)*
When a task is completed, the app generates a shareable celebration card. Small effort, high emotional impact.

---

## 5. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + Vite + Tailwind CSS | Mobile-first, team's existing skill set |
| Animations | Framer Motion | Roadmap visual, smooth transitions |
| Backend | FastAPI (Python) | Async, clean, matches team's Python experience |
| AI / RAG | LangChain + ChromaDB | Free, local vector DB; no paid infrastructure |
| LLM | GPT-4o-mini or Claude Haiku | < $0.01 per query |
| Eligibility Engine | Pure Python rules engine | Deterministic, testable, no hallucination risk |
| Resource DB | JSON (~50 curated Georgia entries) | Seeded via 211 Georgia API + manual curation |
| Hosting | Vercel (frontend) + Render (backend) | Both free tier, deployable in minutes |

---

## 6. API Endpoints

### `POST /intake`
Accepts `UserProfile`, returns eligibility results + initial task list.

**Request:**
```json
{
  "age": 18,
  "county": "Cobb",
  "status": "aged_out",
  "months_in_care": 36,
  "college_intent": "thinking",
  "top_concerns": ["housing", "school"],
  "aged_out_at_18": true,
  "in_foster_care_at_18": true,
  "enrolled_at_ksu": false
}
```

**Response:**
```json
{
  "eligibility": [...],       // EligibilityResult[]
  "tasks": [...],             // Task[], sorted by urgency
  "bestfit_url": "https://bestfit.org/?...",
  "days_remaining": 87
}
```

---

### `POST /eligibility`
Standalone eligibility check from a `UserProfile`.

**Response:** `EligibilityResult[]`

---

### `POST /chat`
RAG chatbot query, personalized with user profile context.

**Request:**
```json
{
  "query": "I'm on a friend's couch in Cobb County. What help can I get?",
  "user_profile": { ... }
}
```

**Response:**
```json
{
  "answer": "...",
  "sources": ["Wellroot Family Services", "211 Georgia"],
  "fallback": false
}
```

If `fallback: true`, the frontend displays the standard 211 Georgia message instead of the answer field.

---

## 7. Design System

**Theme:** Warm parchment / sage green — trauma-informed, never clinical.

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#e4d7b0` | `#3a3529` |
| `card` | `#e7dbbf` | `#413c33` |
| `primary` | `#8d9d4f` | `#8a9f7b` |
| `foreground` | `#5c4b3e` | `#ede4d4` |
| `destructive` | `#d98b7e` | `#b5766a` |
| `border` | `#b19681` | `#5a5345` |
| `muted-foreground` | `#85766a` | `#a8a096` |

**Fonts:**
- Headings: `Source Serif 4` (Google Fonts)
- Body / UI: `Merriweather` (Google Fonts)
- Data / codes: `JetBrains Mono` (Google Fonts)

**Border radius:** `0.425rem` globally  
**Shadows:** `3px 3px 2px 0px hsl(88 22% 35% / 15%)`

**Trauma-informed design rules:**
1. No sudden alerts or alarming red screens
2. Progress is always visible — user always knows where they are
3. Every question has a "Skip for now" escape hatch (except age and county)
4. Emergency Mode never requires login
5. Language is plain, warm, and second-person ("you qualify" not "the applicant qualifies")

---

## 8. Non-Goals (MVP Scope)

The following are explicitly **out of scope** for the April 29 demo:

- User authentication / accounts (demo uses local state only)
- Real document storage (Document Vault is UI-only, local storage)
- Push notifications
- Case manager / admin portal
- Native iOS/Android app (web only for MVP)
- Real-time shelter availability data
- Multi-language support (English only for MVP)
- Georgia Path Roadmap and Success Cards (bonus only if core is complete)

---

## 9. Cursor + Claude Agent Prompts

Use these prompts directly in Cursor to scaffold each feature:

### Eligibility Engine
```
Build a FastAPI endpoint POST /eligibility that accepts a UserProfile JSON body
and returns a list of EligibilityResult objects. Use pure Python deterministic logic —
no LLM calls. Programs: Chafee ETV (age 18-25, 6+ months in care at 14+),
EYSS (aged_out_at_18=true), Georgia Medicaid Extended (in_foster_care_at_18=true),
KSU ASCEND (enrolled_at_ksu=true). Each result includes: program name, qualified bool,
reason string, what_it_provides, documents_needed list, next_step string.
Also return a bestfit_url field pointing to https://bestfit.org.
```

### RAG Pipeline
```
Build a LangChain RAG pipeline that:
1. Loads ./data/georgia_resources.json (list of resources with: name, type, county,
   phone, address, description, url)
2. Embeds into ChromaDB using HuggingFace sentence-transformers (free, no API key)
3. Exposes POST /chat via FastAPI accepting {query: str, user_profile: dict}
4. Returns {answer: str, sources: list[str], fallback: bool}
5. If no relevant source found, returns fallback: true and answer:
   "I don't have that specific information. Please call 211 Georgia: dial 2-1-1."
6. Every answer must end with a sources list from the retrieved documents only.
```

### Intake Flow (React)
```
Build a React component <IntakeFlow /> that renders 7 conversational questions
sequentially in a chat-style interface (not a form). Use Tailwind CSS.
Each question appears after the previous answer is submitted.
Questions: age (number input), county (searchable select), care status (card select),
months in care (segmented selector), college intent (card select),
top concerns (multi-select chips), documents (checklist toggles).
On completion POST to /intake and navigate to /dashboard.
Show a progress bar (primary color fill) and step counter at the top.
```

---

## 10. C-Day Judging Alignment

| C-Day Criterion | Nest's Evidence |
|----------------|----------------|
| Completed Goals | Working RAG chatbot + deterministic eligibility engine + deployed live site |
| Methodology | Rules engine tied to U.S. Code § 675; NIST AI RMF "I don't know" behavior; BestFit integration |
| Verbal Presentation | 250-page PDF vs. 10-second plan contrast; Maria persona demo; QR code to live site |
| Evidence of Rigor | KSU CARE crisis validation; ASCEND usability feedback; Georgia Senate Study Committee data; citation enforcement |
| Merit & Broader Impact | 673 Georgia youth ages 18–20 on countdown clock; KSU institutional partnership; HB 136 alignment |

---

## 11. Key Contacts

| Partner | Contact | Role |
|---------|---------|------|
| KSU CARE Services / ASCEND | Lauren Padgett, 470-578-5260 | Crisis validation; feature review; usability testing |
| Embark Georgia | embarkgeorgia.org | Chafee ETV program pipeline |
| Wellroot Family Services | wabe.org/wellroot | Emergency housing partner |
| BestFit | Atlanta-based | General public benefits screening handoff |

---

## 12. Timeline

| Date | Milestone |
|------|-----------|
| April 18 (today) | Intake flow + eligibility engine + RAG pipeline scaffolded |
| April 18 (evening) | End-to-end Maria demo working locally |
| April 19 (morning) | Dashboard UI polished, mobile-responsive |
| April 19 (afternoon) | Deployed: Vercel (frontend) + Render (backend) |
| April 19 (evening) | Emergency Mode + chatbot "I don't know" fallback finalized |
| April 20 (morning) | Feature summary email sent to Lauren Padgett |
| April 20 by 5 PM | Poster file submitted via CCSE template |
| April 29 | C-Day demo @ Marietta Event Center, 4:00–7:30 PM |

---

*This PRD is a living document. Update the version number and date at the top when making significant changes.*
