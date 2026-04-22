import { describe, it, expect } from "vitest";
import type { Task } from "@/data/placeholder";
import type { Profile } from "@/store/profile";
import type { Deadline } from "./deadlines";
import {
  computeTaskDate,
  deadlineToIcs,
  deadlineToIcsEvent,
  escapeIcsText,
  resolveDeadlineDate,
  taskToIcsEvent,
  tasksToIcs,
} from "./ics";

const FIXED_NOW = new Date("2026-04-21T14:00:00Z");

const overdueTask: Task = {
  id: "doc-birth",
  title: "Request your birth certificate",
  due: "Start this first",
  status: "overdue",
  tone: "coral",
};

const weekTask: Task = {
  id: "doc-id",
  title: "Get your Georgia state ID",
  due: "Due this week",
  status: "week",
  tone: "amber",
};

const doneTask: Task = {
  id: "doc-ssc",
  title: "Replace your Social Security card",
  due: "Completed",
  status: "done",
  tone: "sage",
};

describe("escapeIcsText", () => {
  it("escapes commas, semicolons, backslashes, and newlines", () => {
    expect(escapeIcsText("hello, world; it\\s fine\nnow")).toBe(
      "hello\\, world\\; it\\\\s fine\\nnow",
    );
  });
  it("is a no-op for plain text", () => {
    expect(escapeIcsText("plain text")).toBe("plain text");
  });
});

describe("computeTaskDate", () => {
  it("returns today for overdue tasks", () => {
    const d = computeTaskDate(overdueTask, FIXED_NOW);
    expect(d).not.toBeNull();
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getHours()).toBe(0);
  });
  it("returns today + 7 for week tasks", () => {
    const d = computeTaskDate(weekTask, FIXED_NOW);
    const expected = new Date(FIXED_NOW);
    expected.setHours(0, 0, 0, 0);
    expected.setDate(expected.getDate() + 7);
    expect(d?.getTime()).toBe(expected.getTime());
  });
  it("returns null for done tasks", () => {
    expect(computeTaskDate(doneTask, FIXED_NOW)).toBeNull();
  });
});

describe("taskToIcsEvent", () => {
  it("returns null for done tasks", () => {
    expect(taskToIcsEvent(doneTask, { now: FIXED_NOW })).toBeNull();
  });

  it("produces a VEVENT with all-day DTSTART and DTEND", () => {
    const out = taskToIcsEvent(overdueTask, {
      now: FIXED_NOW,
      profileName: "Maria",
    });
    expect(out).not.toBeNull();
    const lines = out!.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VEVENT");
    expect(lines[lines.length - 1]).toBe("END:VEVENT");
    expect(lines.some((l) => l.startsWith("UID:nest-doc-birth-maria@"))).toBe(
      true,
    );
    expect(lines.some((l) => l.startsWith("DTSTART;VALUE=DATE:"))).toBe(true);
    expect(lines.some((l) => l.startsWith("DTEND;VALUE=DATE:"))).toBe(true);
    expect(lines.some((l) => l.includes("(Nest)"))).toBe(true);
  });

  it("defaults the uid suffix to 'anon' when no profile name", () => {
    const out = taskToIcsEvent(weekTask, { now: FIXED_NOW });
    expect(out).toContain("UID:nest-doc-id-anon@");
  });
});

describe("tasksToIcs", () => {
  it("wraps events inside VCALENDAR and ends with CRLF", () => {
    const ics = tasksToIcs([overdueTask, weekTask, doneTask], {
      now: FIXED_NOW,
      profileName: "Maria",
    });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("skips done tasks", () => {
    const ics = tasksToIcs([overdueTask, doneTask], {
      now: FIXED_NOW,
      profileName: "Maria",
    });
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBe(1);
  });

  it("renders an empty calendar when no actionable tasks", () => {
    const ics = tasksToIcs([doneTask], { now: FIXED_NOW });
    expect(ics.includes("BEGIN:VEVENT")).toBe(false);
    expect(ics.includes("BEGIN:VCALENDAR")).toBe(true);
  });
});

const makeProfile = (partial: Partial<Profile> = {}): Profile => ({
  name: "Maria",
  age: 17,
  county: "Cobb",
  documentsHave: [],
  uploadedDocs: [],
  education: null,
  housing: "",
  health: [],
  completedTaskIds: [],
  trustedAdult: null,
  ...partial,
});

const fafsaDeadline: Deadline = {
  id: "fafsa",
  title: "FAFSA",
  when: "Opens October 1 · Georgia priority March 1",
  urgency: "soon",
  category: "education",
  description: "Federal aid application.",
};

const turning18Deadline: Deadline = {
  id: "turning-18",
  title: "Your 18th birthday",
  when: "Within a year",
  urgency: "now",
  category: "planning",
  description: "The hardest day to be unprepared.",
};

const ffcmDeadline: Deadline = {
  id: "ffcm",
  title: "Former Foster Care Medicaid (FFCM)",
  when: "Coverage until age 26",
  urgency: "later",
  category: "health",
  description: "Coverage until 26.",
};

const eyssDeadline: Deadline = {
  id: "eyss",
  title: "EYSS",
  when: "Sign up before 18",
  urgency: "now",
  category: "benefits",
  description: "Georgia's extended foster-care program.",
};

describe("resolveDeadlineDate", () => {
  it("picks the next Oct 1 for FAFSA when today is before Oct 1", () => {
    const now = new Date("2026-04-21T12:00:00Z");
    const d = resolveDeadlineDate(fafsaDeadline, makeProfile(), now);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(1);
  });

  it("picks the next Mar 1 for FAFSA when today is after Oct 1", () => {
    const now = new Date("2026-11-15T12:00:00Z");
    const d = resolveDeadlineDate(fafsaDeadline, makeProfile(), now);
    expect(d.getFullYear()).toBe(2027);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(1);
  });

  it("schedules turning-18 at today + (18 - age) years", () => {
    const now = new Date("2026-04-21T12:00:00Z");
    const d = resolveDeadlineDate(turning18Deadline, makeProfile({ age: 16 }), now);
    expect(d.getFullYear()).toBe(2028);
  });

  it("schedules ffcm at today + (26 - age) years", () => {
    const now = new Date("2026-04-21T12:00:00Z");
    const d = resolveDeadlineDate(ffcmDeadline, makeProfile({ age: 20 }), now);
    expect(d.getFullYear()).toBe(2032);
  });

  it("uses urgency-based offsets as a fallback", () => {
    const now = new Date("2026-04-21T12:00:00Z");
    const d = resolveDeadlineDate(eyssDeadline, makeProfile(), now);
    const expected = new Date(now);
    expected.setHours(0, 0, 0, 0);
    expected.setDate(expected.getDate() + 30);
    expect(d.getTime()).toBe(expected.getTime());
  });
});

describe("deadlineToIcsEvent / deadlineToIcs", () => {
  const now = new Date("2026-04-21T12:00:00Z");

  it("produces a VEVENT with the deadline title + (Nest) suffix", () => {
    const out = deadlineToIcsEvent(eyssDeadline, makeProfile(), now);
    const lines = out.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VEVENT");
    expect(lines[lines.length - 1]).toBe("END:VEVENT");
    expect(lines.some((l) => l.includes("SUMMARY:EYSS (Nest)"))).toBe(true);
  });

  it("includes the when-text in the DESCRIPTION for timeline context", () => {
    const out = deadlineToIcsEvent(eyssDeadline, makeProfile(), now);
    expect(out).toContain("When: Sign up before 18");
  });

  it("wraps the event in a VCALENDAR envelope", () => {
    const ics = deadlineToIcs(eyssDeadline, makeProfile(), now);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
  });

  it("uses the profile name (slugified) in the UID", () => {
    const ics = deadlineToIcs(
      eyssDeadline,
      makeProfile({ name: "Ana Luiza" }),
      now,
    );
    expect(ics).toContain("UID:nest-deadline-eyss-ana-luiza@");
  });
});
