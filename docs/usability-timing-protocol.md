# Usability Timing Protocol — Pre-C-Day

Purpose: produce real timing numbers for the C-Day poster and verbal demo.
Addresses CMT Reviewer #1's first ask: "complete and report your usability
study results — showing actual timed results would be a powerful closing
argument for judges."

Target completion: **before 2026-04-28** (24h ahead of demo).
Owner: Stephen (runs the trial). Brenden (updates the poster with results).

---

## The three test questions

Picked to match Maria's demo persona (18, Cobb County, aging out, no birth
certificate, wants KSU). Each represents a different information-retrieval
shape the judges might imagine.

| # | Question | Info type | Why this one |
|---|----------|-----------|--------------|
| Q1 | "How do I replace my birth certificate in Georgia as a foster youth?" | Procedural (multi-step + fee waiver) | Matches Maria's stated gap. Covers DPH Vital Records + DFCS fee-waiver letter. |
| Q2 | "What is Chafee ETV and how much can I get?" | Program + dollar amount | Dollar amounts are where hallucination risk is highest — strongest accuracy story. |
| Q3 | "When is the FAFSA deadline for Georgia foster youth?" | Date + foster-specific status | Tests the "independent student" nuance unique to aging-out youth. |

Do not substitute questions. Comparability across the two conditions depends
on identical wording.

---

## Test conditions

**Baseline — "PDF search":**

- Open `Nest_Project_Background.pdf` and `250-page Georgia DFCS transition
  PDF` (the physical demo prop) in a local viewer with Cmd-F.
- Answer each question using only the PDF(s). You may scan, skim, jump,
  use find — but no Google, no Nest, no outside source.
- The answer is "found" when you can say the answer out loud with
  confidence *and* cite a page number.

**Nest:**

- Fresh incognito browser window. Open the production app URL.
- Complete the onboarding with Maria's persona (18, Cobb County, no birth
  cert, group home, wants KSU, has social security card).
- Go to /navigator. Type the question exactly as worded above. Submit.
- The answer is "found" when Navigator returns a non-fallback response
  and you can repeat the answer back.

---

## Timing rules

- **Start the clock** when you finish reading the question aloud.
- **Stop the clock** when you can verbally answer the question and cite a
  source (page number for PDF; source pill text for Nest).
- If the answer doesn't arrive within **180 seconds (3 minutes)**, stop
  and record "DNF" (did not finish). Counts as 180s for averaging.
- Run each question in **both conditions back-to-back**. Randomize the
  order per question (coin flip: heads = PDF first, tails = Nest first)
  to control for question-order memory.
- **Clear state between conditions.** Close the PDF viewer; close and
  reopen the incognito window.
- Record the trial **once.** No retries. Real user doesn't get a retry.

---

## Results template

Fill this in. Save a copy as `docs/usability-timing-results.md` when done.

```
Date: YYYY-MM-DD
Tester: Stephen Sookra
Device: [MacBook / phone / etc]
Nest version: [git hash at time of trial]

Q1 — Birth certificate replacement
  PDF baseline:   ___ seconds   (found: yes / no / DNF)
  Nest:           ___ seconds   (found: yes / no / DNF)
  Speedup:        ___x

Q2 — Chafee ETV + dollar amount
  PDF baseline:   ___ seconds
  Nest:           ___ seconds
  Speedup:        ___x

Q3 — FAFSA deadline (foster-specific)
  PDF baseline:   ___ seconds
  Nest:           ___ seconds
  Speedup:        ___x

Averages
  PDF baseline:   ___ seconds (mean)
  Nest:           ___ seconds (mean)
  Aggregate speedup: ___x
```

---

## Poster snippet (pre-written; Brenden fills in numbers)

Paste this into the poster's "Usability Testing" block. Leave the ___
placeholders until the trial produces numbers.

> We measured how long it took to answer three concrete questions a youth
> aging out of Georgia foster care would realistically ask — once using the
> 250-page DFCS transition PDF, and once using Nest.
>
> - Birth certificate replacement: PDF baseline ___s → Nest ___s
> - Chafee ETV dollar amount:     PDF baseline ___s → Nest ___s
> - FAFSA deadline (foster-specific): PDF baseline ___s → Nest ___s
>
> Across the three tasks, Nest answered **___x faster** than the PDF — and
> returned a cited source every time. Our original poster target of a 10x
> reduction was the aspirational goal; this is the measured result.

---

## Verbal demo snippet

For C-Day: a one-sentence answer if a judge asks "did you actually measure
this?"

> "Yes — we timed three questions on the canonical DFCS transition PDF
> versus Nest. Nest was N times faster on average, and it cited its source
> on every one. The PDF takes minutes; Nest takes seconds."

---

## If the numbers come back weak

If Nest is only 2x faster or less, don't fake it. Options:

1. Report honestly. "2x faster with a cited source beats 10x faster without
   one" is still defensible if the judge trusts your AI-safety story (which
   is why we built the corpus + SourceReveal + HowItWorks trust page).
2. Pick a fourth question that plays to retrieval's strengths (e.g., a
   cross-document question requiring synthesis from 3+ source documents).
   But report all four, not just the best three.
3. If PDF baseline keeps winning, the honest read is: our edge is citation
   and personalization, not raw speed. Refocus the poster narrative on
   that.

Do not cherry-pick. Judges can spot it.

---

## Related

- [[Projects/Nest - CMT Reviewer Feedback]]
- [[Project - Nest]]
- Demo persona (D3): Maria, 18, Cobb County, aging out of group home
