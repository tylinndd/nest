import { toast } from "sonner";
import type { Task } from "@/data/placeholder";
import type { Deadline } from "./deadlines";
import type { Profile } from "@/store/profile";

const CRLF = "\r\n";

const pad2 = (n: number) => n.toString().padStart(2, "0");

const byteLength = (s: string) => new TextEncoder().encode(s).length;

/**
 * RFC 5545 §3.1 content-line folding. Lines > 75 octets must be split by
 * inserting CRLF + a space. We fold at character boundaries (never mid
 * UTF-8 sequence), which is stricter than the RFC but safe for every client.
 */
export const foldLine = (line: string): string => {
  if (byteLength(line) <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  let first = true;
  while (remaining.length > 0) {
    const limit = first ? 75 : 74;
    let take = remaining.length;
    while (take > 0 && byteLength(remaining.slice(0, take)) > limit) take--;
    if (take === 0) take = 1;
    parts.push(remaining.slice(0, take));
    remaining = remaining.slice(take);
    first = false;
  }
  return parts.join("\r\n ");
};

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
    foldLine(`UID:${uid}`),
    foldLine(`DTSTAMP:${fmtDateTimeUtc(stampSource)}`),
    foldLine(`DTSTART;VALUE=DATE:${fmtDate(date)}`),
    foldLine(`DTEND;VALUE=DATE:${fmtDate(next)}`),
    foldLine(`SUMMARY:${summary}`),
    foldLine(`DESCRIPTION:${description}`),
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
  try {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch {
    toast.error(
      "Couldn't save the calendar file. Try again, or screenshot the deadline.",
      { id: "ics-download" },
    );
  }
};

/**
 * Resolve a concrete calendar date for a Deadline.
 *
 * Nest stores age as an integer (no DOB), so "turning 18" is a relative
 * window, not a date. This function picks a single sensible date per
 * deadline so the .ics export is usable as a reminder even when the
 * real answer is "within a year."
 *
 * - FAFSA: October 1 (opens) or March 1 (Georgia priority), whichever is next.
 * - turning-18 / FFCM: today + (target age - current age) years.
 * - ilp-review: today + 1 year.
 * - Everything else: urgency-based offset from today
 *   (now: +30d, soon: +90d, later: +180d).
 */
export const resolveDeadlineDate = (
  deadline: Deadline,
  profile: Profile,
  now: Date = new Date(),
): Date => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (deadline.id === "fafsa") {
    const thisOct = new Date(today.getFullYear(), 9, 1);
    if (today.getTime() <= thisOct.getTime()) return thisOct;
    return new Date(today.getFullYear() + 1, 2, 1);
  }

  if (deadline.id === "turning-18" && profile.age !== null) {
    const yearsLeft = Math.max(0, 18 - profile.age);
    const b = new Date(today);
    b.setFullYear(b.getFullYear() + yearsLeft);
    return b;
  }

  if (deadline.id === "ffcm" && profile.age !== null) {
    const yearsLeft = Math.max(0, 26 - profile.age);
    const b = new Date(today);
    b.setFullYear(b.getFullYear() + yearsLeft);
    return b;
  }

  if (deadline.id === "ilp-review") {
    const b = new Date(today);
    b.setFullYear(b.getFullYear() + 1);
    return b;
  }

  const offsetDays =
    deadline.urgency === "now" ? 30 : deadline.urgency === "soon" ? 90 : 180;
  const b = new Date(today);
  b.setDate(b.getDate() + offsetDays);
  return b;
};

export const deadlineToIcsEvent = (
  deadline: Deadline,
  profile: Profile,
  now: Date = new Date(),
): string => {
  const date = resolveDeadlineDate(deadline, profile, now);
  const next = addDays(date, 1);
  const uid = `nest-deadline-${deadline.id}-${slugify(
    profile.name || "anon",
  )}@nestapp.local`;
  const summary = escapeIcsText(`${deadline.title} (Nest)`);
  const descLines = [
    `When: ${deadline.when}`,
    "",
    deadline.description,
    "",
    "Reminder generated by Nest — verify specifics with your caseworker.",
  ];
  const description = escapeIcsText(descLines.join("\n"));
  return [
    "BEGIN:VEVENT",
    foldLine(`UID:${uid}`),
    foldLine(`DTSTAMP:${fmtDateTimeUtc(now)}`),
    foldLine(`DTSTART;VALUE=DATE:${fmtDate(date)}`),
    foldLine(`DTEND;VALUE=DATE:${fmtDate(next)}`),
    foldLine(`SUMMARY:${summary}`),
    foldLine(`DESCRIPTION:${description}`),
    "END:VEVENT",
  ].join(CRLF);
};

export const deadlineToIcs = (
  deadline: Deadline,
  profile: Profile,
  now: Date = new Date(),
): string =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nest//Nest Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    deadlineToIcsEvent(deadline, profile, now),
    "END:VCALENDAR",
  ].join(CRLF) + CRLF;
