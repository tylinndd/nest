import { toast } from "sonner";
import type { EducationPlan, Profile } from "@/store/profile";
import { DOCUMENT_CATALOG } from "@/lib/personalize";
import { deriveDeadlines, type Deadline } from "@/lib/deadlines";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type DocStatus = "Secured" | "Have" | "Need to get";

type HandoffDoc = {
  title: string;
  status: DocStatus;
};

export type WorkerHandoffData = {
  name: string;
  age: number | null;
  county: string;
  housing: string;
  education: string;
  trustedAdult: { name: string; phone: string } | null;
  documents: HandoffDoc[];
  priorityDeadlines: Deadline[];
  questions: string[];
  generatedAt: string;
};

const EDUCATION_LABEL: Record<EducationPlan, string> = {
  college: "Heading to college",
  trade: "Heading to trade school",
  working: "Working — not in school",
};

const formatDate = (d: Date = new Date()): string =>
  d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const profileToHandoffData = (
  profile: Profile,
  now: Date = new Date(),
): WorkerHandoffData => {
  const uploaded = new Set(profile.uploadedDocs);
  const have = new Set(profile.documentsHave);

  const documents: HandoffDoc[] = DOCUMENT_CATALOG.map((d) => ({
    title: d.title,
    status: uploaded.has(d.id)
      ? "Secured"
      : have.has(d.id)
        ? "Have"
        : "Need to get",
  }));

  const deadlines = deriveDeadlines(profile);
  const priorityDeadlines = deadlines.filter(
    (d) => d.urgency === "now" || d.urgency === "soon",
  );

  const questions = Array.from(
    new Set(
      deadlines
        .map((d) => d.askPrompt)
        .filter((q): q is string => typeof q === "string" && q.length > 0),
    ),
  );

  return {
    name: profile.name.trim() || "—",
    age: profile.age,
    county: profile.county.trim() || "—",
    housing: profile.housing || "—",
    education: profile.education ? EDUCATION_LABEL[profile.education] : "—",
    trustedAdult: profile.trustedAdult,
    documents,
    priorityDeadlines,
    questions,
    generatedAt: formatDate(now),
  };
};

const STATUS_SYMBOL: Record<DocStatus, string> = {
  Secured: "✓",
  Have: "◐",
  "Need to get": "○",
};

export const buildWorkerHandoffHtml = (data: WorkerHandoffData): string => {
  const name = escapeHtml(data.name);
  const county = escapeHtml(data.county);
  const age = data.age === null ? "—" : String(data.age);
  const housing = escapeHtml(data.housing);
  const education = escapeHtml(data.education);
  const generatedAt = escapeHtml(data.generatedAt);
  const trustedRow = data.trustedAdult
    ? `<div class="row">
         <span class="label">Trusted adult</span>
         <span class="value">${escapeHtml(data.trustedAdult.name)} &middot; ${escapeHtml(data.trustedAdult.phone)}</span>
       </div>`
    : "";

  const docRows = data.documents
    .map(
      (d) =>
        `<li class="doc-row doc-${d.status === "Secured" ? "done" : d.status === "Have" ? "partial" : "todo"}">
           <span class="doc-mark" aria-hidden>${STATUS_SYMBOL[d.status]}</span>
           <span class="doc-title">${escapeHtml(d.title)}</span>
           <span class="doc-status">${escapeHtml(d.status)}</span>
         </li>`,
    )
    .join("");

  const deadlineRows = data.priorityDeadlines.length
    ? data.priorityDeadlines
        .map(
          (d) =>
            `<li class="deadline deadline-${d.urgency}">
               <div class="deadline-head">
                 <span class="deadline-title">${escapeHtml(d.title)}</span>
                 <span class="deadline-when">${escapeHtml(d.when)}</span>
               </div>
               <p class="deadline-desc">${escapeHtml(d.description)}</p>
             </li>`,
        )
        .join("")
    : `<li class="deadline-empty">No urgent windows based on what Nest knows. Ask your worker to confirm.</li>`;

  const questionRows = data.questions.length
    ? data.questions
        .map(
          (q) =>
            `<li class="question"><span class="q-mark" aria-hidden>☐</span><span class="q-text">${escapeHtml(q)}</span></li>`,
        )
        .join("")
    : `<li class="question-empty">Add your own questions before the meeting.</li>`;

  const noteLines = Array.from({ length: 8 })
    .map(() => `<div class="note-line"></div>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Caseworker handoff · Nest</title>
<style>
  * { box-sizing: border-box; }
  @page { size: letter; margin: 0.5in; }
  body {
    font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a; margin: 0; padding: 0; background: #fff; font-size: 10pt;
    line-height: 1.4;
  }
  .sheet { padding: 24px; max-width: 7.5in; margin: 0 auto; }
  .header {
    border-bottom: 1.5pt solid #2f5d3a; padding-bottom: 8pt;
    margin-bottom: 14pt;
    display: flex; justify-content: space-between; align-items: baseline;
  }
  .wordmark {
    font-weight: 700; font-size: 11pt; letter-spacing: 0.1em;
    text-transform: uppercase; color: #2f5d3a;
  }
  .generated { font-size: 8pt; color: #666; }
  h1 {
    font-size: 18pt; margin: 2pt 0 4pt; color: #2f5d3a; font-weight: 600;
    letter-spacing: -0.01em;
  }
  .subtitle { font-size: 9.5pt; color: #555; margin: 0 0 14pt; }
  .identity {
    border: 1pt solid #e4e4e0; border-radius: 6pt; padding: 10pt 12pt;
    margin-bottom: 14pt; background: #fafaf7;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8pt 12pt;
    page-break-inside: avoid;
  }
  .row { display: flex; flex-direction: column; min-width: 0; }
  .label {
    font-size: 6.5pt; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #888;
  }
  .value {
    font-size: 10pt; font-weight: 600; color: #1a1a1a; margin-top: 1pt;
    word-wrap: break-word;
  }
  h2 {
    font-size: 10.5pt; margin: 14pt 0 6pt; color: #2f5d3a; font-weight: 700;
    letter-spacing: 0.02em; text-transform: uppercase;
  }
  .deadlines { list-style: none; padding: 0; margin: 0; display: grid; gap: 6pt; }
  .deadline {
    border: 1pt solid #e4e4e0; border-left: 3pt solid #c98a28;
    border-radius: 4pt; padding: 6pt 10pt; page-break-inside: avoid;
    background: #fffdf7;
  }
  .deadline-now { border-left-color: #c62828; background: #fdf4f3; }
  .deadline-soon { border-left-color: #c98a28; background: #fffdf7; }
  .deadline-head {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 8pt;
  }
  .deadline-title { font-size: 10pt; font-weight: 700; color: #1a1a1a; }
  .deadline-when {
    font-size: 7.5pt; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: #777; white-space: nowrap;
  }
  .deadline-desc { font-size: 9pt; color: #555; margin: 2pt 0 0; }
  .deadline-empty {
    font-size: 9pt; color: #888; font-style: italic; padding: 4pt 0;
    list-style: none;
  }
  .docs { list-style: none; padding: 0; margin: 0; }
  .doc-row {
    display: grid; grid-template-columns: 14pt 1fr auto; gap: 6pt;
    padding: 3pt 0; border-bottom: 0.5pt solid #eee; align-items: baseline;
    page-break-inside: avoid;
  }
  .doc-row:last-child { border-bottom: none; }
  .doc-mark { font-size: 11pt; text-align: center; font-weight: 700; }
  .doc-done .doc-mark { color: #2f5d3a; }
  .doc-partial .doc-mark { color: #c98a28; }
  .doc-todo .doc-mark { color: #aaa; }
  .doc-title { font-size: 9.5pt; font-weight: 500; }
  .doc-status {
    font-size: 7.5pt; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: #888; white-space: nowrap;
  }
  .doc-done .doc-status { color: #2f5d3a; }
  .doc-partial .doc-status { color: #c98a28; }
  .two-col {
    display: grid; grid-template-columns: 1.2fr 1fr; gap: 14pt;
    page-break-inside: avoid;
  }
  .questions { list-style: none; padding: 0; margin: 0; }
  .question {
    display: flex; gap: 6pt; align-items: baseline; padding: 3pt 0;
    border-bottom: 0.5pt dashed #e4e4e0; font-size: 9.5pt;
    page-break-inside: avoid;
  }
  .question:last-child { border-bottom: none; }
  .q-mark {
    font-size: 11pt; color: #2f5d3a; line-height: 1; width: 14pt;
    text-align: center; flex-shrink: 0;
  }
  .q-text { color: #1a1a1a; }
  .question-empty {
    font-size: 9pt; color: #888; font-style: italic; padding: 4pt 0;
    list-style: none;
  }
  .notes {
    border: 1pt solid #e4e4e0; border-radius: 6pt; padding: 10pt 12pt;
    background: #fafaf7; page-break-inside: avoid;
  }
  .note-line {
    border-bottom: 0.5pt solid #d4d4ce; height: 18pt;
  }
  .note-line:last-child { border-bottom: 0.5pt solid #d4d4ce; }
  .signoff {
    margin-top: 10pt; display: grid; grid-template-columns: 1fr 1fr;
    gap: 14pt; page-break-inside: avoid;
  }
  .sig {
    border-top: 0.75pt solid #888; padding-top: 3pt; font-size: 7.5pt;
    color: #666; letter-spacing: 0.06em; text-transform: uppercase;
    font-weight: 700;
  }
  .footer {
    margin-top: 16pt; padding-top: 8pt; border-top: 0.5pt solid #ddd;
    font-size: 7.5pt; color: #888; text-align: center; line-height: 1.4;
  }
  @media screen {
    body { background: #eee; min-height: 100vh; }
    .sheet {
      background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      margin: 24px auto; border-radius: 4pt;
    }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <span class="wordmark">Nest &middot; Caseworker handoff</span>
      <span class="generated">Printed ${generatedAt}</span>
    </div>

    <h1>For my next meeting</h1>
    <p class="subtitle">A one-page handoff to bring to my caseworker, ILP coordinator, or trusted adult. Review together &mdash; rules change and every county runs it a little differently.</p>

    <section class="identity">
      <div class="row">
        <span class="label">Name</span>
        <span class="value">${name}</span>
      </div>
      <div class="row">
        <span class="label">Age</span>
        <span class="value">${age}</span>
      </div>
      <div class="row">
        <span class="label">County</span>
        <span class="value">${county}</span>
      </div>
      <div class="row">
        <span class="label">Housing now</span>
        <span class="value">${housing}</span>
      </div>
      <div class="row">
        <span class="label">Plan</span>
        <span class="value">${education}</span>
      </div>
      ${trustedRow}
    </section>

    <h2>Priority windows</h2>
    <ul class="deadlines">${deadlineRows}</ul>

    <div class="two-col" style="margin-top: 14pt;">
      <div>
        <h2 style="margin-top: 0;">Documents</h2>
        <ul class="docs">${docRows}</ul>
      </div>
      <div>
        <h2 style="margin-top: 0;">Questions to ask</h2>
        <ul class="questions">${questionRows}</ul>
      </div>
    </div>

    <h2>Worker notes</h2>
    <section class="notes">${noteLines}</section>

    <section class="signoff">
      <div class="sig">Youth signature &middot; date</div>
      <div class="sig">Worker signature &middot; date</div>
    </section>

    <p class="footer">
      Generated by Nest on this device. Nothing on this page was sent to a server or stored outside your browser. Verify any benefit, deadline, or phone number with your caseworker before acting on it.
    </p>
  </div>
</body>
</html>`;
};

export const printWorkerHandoff = (data: WorkerHandoffData): void => {
  const html = buildWorkerHandoffHtml(data);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    toast.error("Couldn't open the print view", { id: "handoff-print" });
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 200);
  };
  win.onafterprint = cleanup;
  const runPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      toast.error("Couldn't open the print view", { id: "handoff-print" });
      iframe.remove();
      return;
    }
    window.setTimeout(cleanup, 2000);
  };
  if (doc.readyState === "complete") {
    runPrint();
  } else {
    iframe.onload = runPrint;
  }
};
