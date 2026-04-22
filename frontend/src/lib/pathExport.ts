import { toast } from "sonner";
import type { EducationPlan, Profile } from "@/store/profile";
import { DOCUMENT_CATALOG } from "@/lib/personalize";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type DocStatus = "Secured" | "Have" | "Need to get";

type ExportDoc = {
  title: string;
  status: DocStatus;
};

type ExportZone = {
  title: string;
  subtitle: string;
  tasks: readonly string[];
};

export type PathExportData = {
  name: string;
  age: number | null;
  county: string;
  housing: string;
  education: string;
  trustedAdult: { name: string; phone: string } | null;
  documents: ExportDoc[];
  zones: readonly ExportZone[];
  generatedAt: string;
};

const EDUCATION_LABEL: Record<EducationPlan, string> = {
  college: "Heading to college",
  trade: "Heading to trade school",
  working: "Working — not in school",
};

// Zone task labels mirror Path.tsx exactly. If you rename a task there,
// update it here too so the printed plan doesn't drift from the screen.
const ZONES: readonly ExportZone[] = [
  {
    title: "01 · Stabilize documents",
    subtitle: "Every adult task wants one of these. Lock them down first.",
    tasks: [
      "Request birth certificate",
      "Social Security card replacement",
      "Georgia state ID or permit",
    ],
  },
  {
    title: "02 · Health & coverage",
    subtitle: "Extended Medicaid, primary care, mental health.",
    tasks: [
      "Confirm Former Foster Care Medicaid",
      "Find a primary care doctor",
      "Connect with a therapist",
    ],
  },
  {
    title: "03 · Housing plan",
    subtitle: "Transitional, shared, or campus — secure a bed.",
    tasks: [
      "Apply for HUD FYI voucher",
      "Tour a transitional living program",
      "Line up emergency shelter backup",
    ],
  },
  {
    title: "04 · Education or career",
    subtitle: "School, trade, or work — with the right funding.",
    tasks: [
      "Submit Chafee ETV application",
      "Check Georgia Post-Secondary Tuition Waiver",
      "Book KSU ASCEND intake call",
    ],
  },
  {
    title: "05 · Money & independence",
    subtitle: "Banking, budgeting, first credit.",
    tasks: [
      "Open a checking + savings account",
      "Build a first monthly budget",
      "Claim EYSS monthly stipend",
    ],
  },
];

const formatDate = (d: Date = new Date()): string =>
  d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const profileToPathData = (profile: Profile): PathExportData => {
  const uploaded = new Set(profile.uploadedDocs);
  const have = new Set(profile.documentsHave);

  const documents: ExportDoc[] = DOCUMENT_CATALOG.map((d) => ({
    title: d.title,
    status: uploaded.has(d.id)
      ? "Secured"
      : have.has(d.id)
        ? "Have"
        : "Need to get",
  }));

  return {
    name: profile.name.trim() || "—",
    age: profile.age,
    county: profile.county.trim() || "—",
    housing: profile.housing || "—",
    education: profile.education ? EDUCATION_LABEL[profile.education] : "—",
    trustedAdult: profile.trustedAdult,
    documents,
    zones: ZONES,
    generatedAt: formatDate(),
  };
};

const STATUS_SYMBOL: Record<DocStatus, string> = {
  Secured: "✓",
  Have: "◐",
  "Need to get": "○",
};

export const buildPathHtml = (data: PathExportData): string => {
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

  const zoneBlocks = data.zones
    .map((z) => {
      const items = z.tasks
        .map(
          (t) =>
            `<li class="task"><span class="task-dot" aria-hidden>○</span>${escapeHtml(t)}</li>`,
        )
        .join("");
      return `<section class="zone">
        <h3 class="zone-title">${escapeHtml(z.title)}</h3>
        <p class="zone-sub">${escapeHtml(z.subtitle)}</p>
        <ul class="task-list">${items}</ul>
      </section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Your Path · Nest</title>
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
    font-size: 20pt; margin: 2pt 0 4pt; color: #2f5d3a; font-weight: 600;
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
    font-size: 11pt; margin: 14pt 0 6pt; color: #2f5d3a; font-weight: 700;
    letter-spacing: 0.02em; text-transform: uppercase;
  }
  .docs { list-style: none; padding: 0; margin: 0; }
  .doc-row {
    display: grid; grid-template-columns: 14pt 1fr auto; gap: 6pt;
    padding: 4pt 0; border-bottom: 0.5pt solid #eee; align-items: baseline;
    page-break-inside: avoid;
  }
  .doc-row:last-child { border-bottom: none; }
  .doc-mark { font-size: 11pt; text-align: center; font-weight: 700; }
  .doc-done .doc-mark { color: #2f5d3a; }
  .doc-partial .doc-mark { color: #c98a28; }
  .doc-todo .doc-mark { color: #aaa; }
  .doc-title { font-size: 10pt; font-weight: 500; }
  .doc-status {
    font-size: 7.5pt; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: #888; white-space: nowrap;
  }
  .doc-done .doc-status { color: #2f5d3a; }
  .doc-partial .doc-status { color: #c98a28; }
  .zones {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10pt;
    margin-top: 4pt;
  }
  .zone {
    border: 1pt solid #e4e4e0; border-radius: 6pt; padding: 8pt 10pt;
    page-break-inside: avoid; background: #fff;
  }
  .zone-title {
    font-size: 9.5pt; font-weight: 700; color: #2f5d3a;
    margin: 0 0 2pt; letter-spacing: 0.02em;
  }
  .zone-sub { font-size: 8pt; color: #666; margin: 0 0 5pt; }
  .task-list { list-style: none; padding: 0; margin: 0; }
  .task {
    font-size: 9pt; padding: 2pt 0; display: flex; gap: 5pt;
    align-items: baseline;
  }
  .task-dot { color: #c98a28; font-size: 10pt; line-height: 1; }
  .emergency {
    margin-top: 14pt; border: 1.5pt solid #2f5d3a; border-radius: 6pt;
    padding: 10pt 12pt; background: #f4f8f4; page-break-inside: avoid;
  }
  .emergency h2 { margin-top: 0; color: #2f5d3a; }
  .emergency-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 4pt 16pt;
    font-size: 9pt;
  }
  .em-row {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 4pt; padding: 2pt 0;
    border-bottom: 0.5pt solid rgba(47, 93, 58, 0.12);
  }
  .em-row:last-child { border-bottom: none; }
  .em-label { color: #555; }
  .em-phone { font-weight: 700; font-variant-numeric: tabular-nums; }
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
      <span class="wordmark">Nest</span>
      <span class="generated">Printed ${generatedAt}</span>
    </div>

    <h1>Your Path</h1>
    <p class="subtitle">A one-page plan for aging out of Georgia foster care &mdash; yours to keep, print, or hand to a trusted adult.</p>

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

    <h2>Documents</h2>
    <ul class="docs">${docRows}</ul>

    <h2>Five zones to stabilize</h2>
    <div class="zones">${zoneBlocks}</div>

    <section class="emergency">
      <h2>If things get hard</h2>
      <div class="emergency-grid">
        <div class="em-row"><span class="em-label">Crisis &middot; call or text</span><span class="em-phone">988</span></div>
        <div class="em-row"><span class="em-label">Emergency</span><span class="em-phone">911</span></div>
        <div class="em-row"><span class="em-label">Georgia help line</span><span class="em-phone">211</span></div>
        <div class="em-row"><span class="em-label">DFCS child abuse</span><span class="em-phone">1-855-422-4453</span></div>
        <div class="em-row"><span class="em-label">Embark Network</span><span class="em-phone">(706) 542-3104</span></div>
        ${
          data.trustedAdult
            ? `<div class="em-row"><span class="em-label">${escapeHtml(data.trustedAdult.name)}</span><span class="em-phone">${escapeHtml(data.trustedAdult.phone)}</span></div>`
            : ""
        }
      </div>
    </section>

    <p class="footer">
      Generated on your device by Nest. Nothing on this page was sent to us,
      stored on a server, or shared with anyone else &mdash; your private
      browser built it locally. Mark it up. Fold it. Give a copy to someone
      you trust.
    </p>
  </div>
</body>
</html>`;
};

export const printPath = (data: PathExportData): void => {
  const html = buildPathHtml(data);
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
    toast.error("Couldn't open the print view", { id: "path-print" });
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
      toast.error("Couldn't open the print view", { id: "path-print" });
      iframe.remove();
      return;
    }
    window.setTimeout(cleanup, 2000);
  };
  if (doc.readyState === "complete") {
    runPrint();
  } else {
    iframe.onload = runPrint;
    window.setTimeout(() => {
      if (iframe.isConnected && doc.readyState !== "complete") {
        toast.error("Couldn't open the print view", { id: "path-print" });
        iframe.remove();
      }
    }, 5000);
  }
};
