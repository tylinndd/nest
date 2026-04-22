import { toast } from "sonner";
import type { Profile } from "@/store/profile";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export type NestCardData = {
  name: string;
  county: string;
  age: number | null;
  trustedAdult: { name: string; phone: string } | null;
};

export const profileToCardData = (profile: Profile): NestCardData => ({
  name: profile.name.trim() || "—",
  county: profile.county.trim() || "—",
  age: profile.age,
  trustedAdult: profile.trustedAdult,
});

export const buildNestCardHtml = (data: NestCardData): string => {
  const name = escapeHtml(data.name);
  const county = escapeHtml(data.county);
  const age = data.age === null ? "—" : String(data.age);
  const trustedName = data.trustedAdult
    ? escapeHtml(data.trustedAdult.name)
    : "";
  const trustedPhone = data.trustedAdult
    ? escapeHtml(data.trustedAdult.phone)
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Nest Card</title>
<style>
  * { box-sizing: border-box; }
  @page { size: letter; margin: 0.5in; }
  body {
    font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a; margin: 0; padding: 0; background: #fff; font-size: 10pt;
  }
  .sheet {
    display: flex; flex-direction: column; gap: 24px; padding: 24px;
  }
  .card {
    width: 3.5in; height: 2in; border: 1.5pt solid #2f5d3a;
    border-radius: 10pt; padding: 10pt 12pt; position: relative;
    page-break-inside: avoid;
  }
  .card.front { background: #f7f6f1; }
  .card.back { background: #2f5d3a; color: #fff; }
  .card.back .label, .card.back .value { color: #fff; }
  .wordmark {
    font-weight: 700; font-size: 10pt; letter-spacing: 0.08em;
    text-transform: uppercase; color: #2f5d3a;
  }
  .card.back .wordmark { color: #fff; }
  .tagline {
    margin-top: 2pt; font-size: 8pt; color: #666;
  }
  .card.back .tagline { color: rgba(255,255,255,0.8); }
  .grid { margin-top: 8pt; display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 10pt; }
  .row { display: flex; flex-direction: column; }
  .label {
    font-size: 6.5pt; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #888;
  }
  .value {
    font-size: 9.5pt; font-weight: 600; color: #1a1a1a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .blank {
    display: inline-block; border-bottom: 1pt dashed #aaa; min-width: 100%;
    height: 11pt;
  }
  .card.back .blank { border-bottom-color: rgba(255,255,255,0.5); }
  .back-row { display: flex; justify-content: space-between; align-items: baseline;
              padding: 2pt 0; border-bottom: 0.5pt solid rgba(255,255,255,0.2); }
  .back-row:last-child { border-bottom: none; }
  .back-label { font-size: 8pt; }
  .back-phone { font-size: 9.5pt; font-weight: 700; font-variant-numeric: tabular-nums; }
  .found {
    margin-top: 6pt; font-size: 7pt; color: rgba(255,255,255,0.85);
    text-align: center; line-height: 1.3;
  }
  .note {
    margin-top: 8pt; font-size: 7pt; color: #777; max-width: 3.5in;
  }
  @media screen {
    body { background: #eee; min-height: 100vh; }
    .sheet { max-width: 6in; margin: 24px auto; background: #fff;
             box-shadow: 0 4px 24px rgba(0,0,0,0.1); border-radius: 4pt; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="card front">
      <div class="wordmark">Nest</div>
      <div class="tagline">Transition card &middot; Georgia foster youth</div>
      <div class="grid">
        <div class="row">
          <span class="label">Name</span>
          <span class="value">${name}</span>
        </div>
        <div class="row">
          <span class="label">County</span>
          <span class="value">${county}</span>
        </div>
        <div class="row">
          <span class="label">Age</span>
          <span class="value">${age}</span>
        </div>
        <div class="row">
          <span class="label">Medicaid ID</span>
          <span class="blank"></span>
        </div>
        <div class="row">
          <span class="label">SSN (last 4)</span>
          <span class="blank"></span>
        </div>
        <div class="row">
          <span class="label">State ID #</span>
          <span class="blank"></span>
        </div>
      </div>
    </div>

    <div class="card back">
      <div class="wordmark">If things get hard</div>
      <div class="tagline">One of these can help right now</div>
      <div style="margin-top: 8pt;">
        <div class="back-row">
          <span class="back-label">Crisis &middot; call or text</span>
          <span class="back-phone">988</span>
        </div>
        <div class="back-row">
          <span class="back-label">Emergency</span>
          <span class="back-phone">911</span>
        </div>
        <div class="back-row">
          <span class="back-label">Georgia help line</span>
          <span class="back-phone">211</span>
        </div>
        <div class="back-row">
          <span class="back-label">DFCS child abuse</span>
          <span class="back-phone">1-855-422-4453</span>
        </div>
        <div class="back-row">
          <span class="back-label">Embark Network</span>
          <span class="back-phone">(706) 542-3104</span>
        </div>
        ${
          data.trustedAdult
            ? `<div class="back-row">
          <span class="back-label">Trusted adult &middot; ${trustedName}</span>
          <span class="back-phone">${trustedPhone}</span>
        </div>`
            : ""
        }
      </div>
      <div class="found">If found, please return to the person named on the front.</div>
    </div>

    <p class="note">
      Cut along the borders. Fold or laminate so the Nest side shows the help
      numbers. Nothing here leaves your device — Nest built this in your
      browser.
    </p>
  </div>
</body>
</html>`;
};

export const printNestCard = (data: NestCardData): void => {
  const html = buildNestCardHtml(data);
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
    toast.error("Couldn't open the print view", { id: "nest-card-print" });
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
      toast.error("Couldn't open the print view", { id: "nest-card-print" });
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
        toast.error("Couldn't open the print view", { id: "nest-card-print" });
        iframe.remove();
      }
    }, 5000);
  }
};
