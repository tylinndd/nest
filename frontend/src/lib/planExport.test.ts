import { describe, it, expect } from "vitest";
import { buildPlanText, buildPlanHtml } from "./planExport";
import type { Profile } from "@/store/profile";
import type { Task, Benefit } from "@/data/placeholder";

const baseProfile: Profile = {
  name: "Maria",
  age: 18,
  county: "Cobb",
  documentsHave: [],
  uploadedDocs: [],
  education: "college",
  housing: "Group home",
  health: [],
  completedTaskIds: [],
  trustedAdult: null,
};

const tasks: Task[] = [
  {
    id: "t1",
    title: "Request birth certificate",
    due: "Start this first",
    status: "overdue",
  },
  {
    id: "t2",
    title: "Apply for Chafee ETV",
    due: "Due Friday",
    status: "week",
  },
  { id: "t3", title: "Old done thing", due: "Completed", status: "done" },
];

const benefits: Benefit[] = [
  {
    id: "chafee-etv",
    title: "Chafee ETV",
    eligibility: "Through age 26",
    summary: "Tuition + books.",
    source: "DFCS",
    status: "qualify",
    href: "https://example.com/etv",
  },
  {
    id: "hud-fyi",
    title: "HUD FYI",
    eligibility: "Ages 18-24",
    summary: "Rent help.",
    source: "HUD",
    status: "action",
  },
];

describe("buildPlanText", () => {
  it("includes the user's first name in the greeting", () => {
    expect(buildPlanText(baseProfile, tasks, benefits)).toMatch(
      /Maria's Nest plan/,
    );
  });

  it("lists active tasks and skips done ones", () => {
    const txt = buildPlanText(baseProfile, tasks, benefits);
    expect(txt).toMatch(/Request birth certificate/);
    expect(txt).toMatch(/Chafee ETV/);
    expect(txt).not.toMatch(/Old done thing/);
  });

  it("only includes benefits with status=qualify", () => {
    const txt = buildPlanText(baseProfile, tasks, benefits);
    expect(txt).toMatch(/Chafee ETV/);
    expect(txt).not.toMatch(/HUD FYI/);
  });

  it("includes the caveat and origin footer", () => {
    const txt = buildPlanText(baseProfile, tasks, benefits);
    expect(txt).toMatch(/Nest can make mistakes/i);
    expect(txt).toMatch(/Shared from Nest/);
  });

  it("falls back to 'My Nest plan' when the name is blank", () => {
    expect(
      buildPlanText({ ...baseProfile, name: "" }, tasks, benefits),
    ).toMatch(/^My Nest plan/);
  });

  it("handles an empty task + benefit list gracefully", () => {
    const txt = buildPlanText(baseProfile, [], []);
    expect(txt).toMatch(/Maria's Nest plan/);
    expect(txt).toMatch(/Nest can make mistakes/i);
    expect(txt).not.toMatch(/What I'm working on/);
    expect(txt).not.toMatch(/Benefits I qualify for/);
  });
});

describe("buildPlanHtml", () => {
  it("returns a valid HTML doc with tasks and qualifying benefits only", () => {
    const html = buildPlanHtml(baseProfile, tasks, benefits);
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toMatch(/Request birth certificate/);
    expect(html).toMatch(/Chafee ETV/);
    expect(html).not.toMatch(/Old done thing/);
    expect(html).not.toMatch(/HUD FYI/);
  });

  it("escapes script tags in the name so user content can't inject HTML", () => {
    const html = buildPlanHtml(
      { ...baseProfile, name: "<script>alert(1)</script>" },
      tasks,
      benefits,
    );
    expect(html).not.toMatch(/<script>alert/);
    expect(html).toMatch(/&lt;script&gt;/);
  });
});
