import type { Profile } from "@/store/profile";
import type { Task, Benefit } from "@/data/placeholder";
import { escapeHtml } from "@/lib/print";

const prettyTask = (t: Task): string => `• ${t.title} — ${t.due}`;

const prettyBenefit = (b: Benefit): string =>
  `• ${b.title}${b.href ? ` — ${b.href}` : ""}\n  ${b.eligibility}`;

const planTitle = (profile: Profile): string => {
  const first = profile.name.trim().split(/\s+/)[0];
  return first ? `${first}'s Nest plan` : "My Nest plan";
};

export const buildPlanText = (
  profile: Profile,
  tasks: Task[],
  benefits: Benefit[],
): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const activeTasks = tasks.filter((t) => t.status !== "done").slice(0, 6);
  const qualifying = benefits.filter((b) => b.status === "qualify").slice(0, 3);

  const lines = [planTitle(profile), ""];

  if (activeTasks.length > 0) {
    lines.push("What I'm working on:");
    lines.push(...activeTasks.map(prettyTask));
    lines.push("");
  }

  if (qualifying.length > 0) {
    lines.push("Benefits I qualify for:");
    lines.push(...qualifying.map(prettyBenefit));
    lines.push("");
  }

  lines.push(
    "Nest can make mistakes. Please double-check with a caseworker before acting on anything here.",
    "",
    `Shared from Nest · ${origin}`,
  );
  return lines.join("\n");
};

export const buildPlanHtml = (
  profile: Profile,
  tasks: Task[],
  benefits: Benefit[],
): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const title = planTitle(profile);
  const activeTasks = tasks.filter((t) => t.status !== "done").slice(0, 6);
  const qualifying = benefits.filter((b) => b.status === "qualify").slice(0, 3);

  const taskItems = activeTasks
    .map(
      (t) =>
        `<li><input type="checkbox" disabled /><span><strong>${escapeHtml(
          t.title,
        )}</strong><br /><em>${escapeHtml(t.due)}</em></span></li>`,
    )
    .join("");

  const benefitItems = qualifying
    .map(
      (b) =>
        `<li><strong>${escapeHtml(b.title)}</strong><br />${escapeHtml(
          b.eligibility,
        )}${b.href ? `<br /><a href="${escapeHtml(b.href)}">${escapeHtml(b.href)}</a>` : ""}</li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
         color: #1a1a1a; margin: 0; padding: 48px; line-height: 1.55; font-size: 14px; }
  .wordmark { font-weight: 700; color: #2f5d3a; font-size: 18px; letter-spacing: 0.02em; }
  h1 { font-size: 22px; font-weight: 700; margin: 8px 0 20px; color: #2f5d3a; }
  h2 { font-size: 14px; font-weight: 700; margin: 24px 0 10px; color: #2f5d3a;
       text-transform: uppercase; letter-spacing: 0.08em; }
  ol, ul { list-style: none; padding: 0; margin: 0; }
  li { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eee; }
  input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; accent-color: #2f5d3a; }
  .caveat { margin-top: 24px; padding: 10px 14px; background: #f5efe2; border-radius: 8px;
            font-size: 12px; color: #3a3a3a; }
  footer { margin-top: 32px; font-size: 11px; color: #777; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="wordmark">Nest</div>
  <h1>${escapeHtml(title)}</h1>
  ${activeTasks.length > 0 ? `<h2>What I'm working on</h2><ol>${taskItems}</ol>` : ""}
  ${qualifying.length > 0 ? `<h2>Benefits I qualify for</h2><ul>${benefitItems}</ul>` : ""}
  <div class="caveat">Nest can make mistakes. Please double-check with a caseworker before acting on anything here.</div>
  <footer>Shared from Nest &middot; ${escapeHtml(origin)}</footer>
</body>
</html>`;
};
