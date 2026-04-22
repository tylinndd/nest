import type { Task } from "@/data/placeholder";

const CRLF = "\r\n";

const pad2 = (n: number) => n.toString().padStart(2, "0");

const fmtDate = (d: Date) =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

const fmtDateTimeUtc = (d: Date) =>
  `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(
    d.getUTCHours(),
  )}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;

export const escapeIcsText = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "anon";

const addDays = (d: Date, days: number) => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

export const computeTaskDate = (
  task: Task,
  now: Date = new Date(),
): Date | null => {
  if (task.status === "done") return null;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (task.status === "week") d.setDate(d.getDate() + 7);
  return d;
};

export type IcsOptions = {
  profileName?: string;
  now?: Date;
};

export const taskToIcsEvent = (
  task: Task,
  opts: IcsOptions = {},
): string | null => {
  const stampSource = opts.now ?? new Date();
  const date = computeTaskDate(task, stampSource);
  if (!date) return null;
  const next = addDays(date, 1);
  const uid = `nest-${task.id}-${slugify(opts.profileName ?? "anon")}@nestapp.local`;
  const summary = escapeIcsText(`${task.title} (Nest)`);
  const descriptionParts = [
    `From Nest — ${task.due}`,
    task.guide?.source ? `Source: ${task.guide.source}` : null,
    "Open Nest for the step-by-step.",
  ].filter((v): v is string => v !== null);
  const description = escapeIcsText(descriptionParts.join("\n"));
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmtDateTimeUtc(stampSource)}`,
    `DTSTART;VALUE=DATE:${fmtDate(date)}`,
    `DTEND;VALUE=DATE:${fmtDate(next)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
  ].join(CRLF);
};

export const tasksToIcs = (tasks: Task[], opts: IcsOptions = {}): string => {
  const events = tasks
    .map((t) => taskToIcsEvent(t, opts))
    .filter((v): v is string => v !== null);
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nest//Nest Deadlines//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...events,
      "END:VCALENDAR",
    ].join(CRLF) + CRLF
  );
};

export const downloadIcs = (ics: string, filename: string) => {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
