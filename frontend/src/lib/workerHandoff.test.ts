import { describe, it, expect } from "vitest";
import type { Profile } from "@/store/profile";
import { buildWorkerHandoffHtml, profileToHandoffData } from "./workerHandoff";

const FIXED_NOW = new Date("2026-04-21T12:00:00Z");

const baseProfile: Profile = {
  name: "Maria Gomez",
  age: 17,
  county: "Cobb",
  documentsHave: ["ssc"],
  uploadedDocs: ["birth"],
  education: "college",
  housing: "Foster home",
  health: ["I have Medicaid right now"],
  completedTaskIds: [],
  trustedAdult: { name: "Ms. Rivera", phone: "(404) 555-0101" },
};

describe("profileToHandoffData", () => {
  it("maps all profile fields into the handoff shape", () => {
    const data = profileToHandoffData(baseProfile, FIXED_NOW);
    expect(data.name).toBe("Maria Gomez");
    expect(data.age).toBe(17);
    expect(data.county).toBe("Cobb");
    expect(data.housing).toBe("Foster home");
    expect(data.education).toBe("Heading to college");
    expect(data.trustedAdult).toEqual({
      name: "Ms. Rivera",
      phone: "(404) 555-0101",
    });
  });

  it("classifies document status using uploaded vs. have vs. need", () => {
    const data = profileToHandoffData(baseProfile, FIXED_NOW);
    const ssc = data.documents.find((d) => d.title === "Social Security card");
    const birth = data.documents.find((d) => d.title === "Birth certificate");
    const id = data.documents.find((d) => d.title === "Georgia state ID");
    expect(ssc?.status).toBe("Have");
    expect(birth?.status).toBe("Secured");
    expect(id?.status).toBe("Need to get");
  });

  it("only keeps priority deadlines (urgency: now or soon)", () => {
    const data = profileToHandoffData(baseProfile, FIXED_NOW);
    for (const d of data.priorityDeadlines) {
      expect(d.urgency === "now" || d.urgency === "soon").toBe(true);
    }
  });

  it("deduplicates caseworker questions pulled from askPrompts", () => {
    const data = profileToHandoffData(baseProfile, FIXED_NOW);
    expect(new Set(data.questions).size).toBe(data.questions.length);
  });

  it("returns empty lists when profile has no age", () => {
    const data = profileToHandoffData(
      { ...baseProfile, age: null },
      FIXED_NOW,
    );
    expect(data.priorityDeadlines).toHaveLength(0);
    expect(data.questions).toHaveLength(0);
  });
});

describe("buildWorkerHandoffHtml", () => {
  it("escapes HTML so user content can't inject script tags", () => {
    const data = profileToHandoffData(baseProfile, FIXED_NOW);
    const html = buildWorkerHandoffHtml({
      ...data,
      name: '<script>alert("x")</script>',
      county: "O'Connor",
    });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes identity, priority windows, and worker notes sections", () => {
    const html = buildWorkerHandoffHtml(
      profileToHandoffData(baseProfile, FIXED_NOW),
    );
    expect(html).toMatch(/Priority windows/);
    expect(html).toMatch(/Worker notes/);
    expect(html).toMatch(/Questions to ask/);
  });

  it("renders trusted adult row when provided and omits it when null", () => {
    const withAdult = buildWorkerHandoffHtml(
      profileToHandoffData(baseProfile, FIXED_NOW),
    );
    expect(withAdult).toContain("Ms. Rivera");

    const noAdult = buildWorkerHandoffHtml(
      profileToHandoffData(
        { ...baseProfile, trustedAdult: null },
        FIXED_NOW,
      ),
    );
    expect(noAdult).not.toContain("Ms. Rivera");
    expect(noAdult).not.toContain("Trusted adult");
  });

  it("shows an empty-state note when there are no priority deadlines", () => {
    const html = buildWorkerHandoffHtml(
      profileToHandoffData(
        { ...baseProfile, age: null },
        FIXED_NOW,
      ),
    );
    expect(html).toMatch(/No urgent windows/);
  });

  it("renders the printed date in the header", () => {
    const html = buildWorkerHandoffHtml(
      profileToHandoffData(baseProfile, FIXED_NOW),
    );
    expect(html).toMatch(/Printed April 21, 2026/);
  });

  it("includes the privacy footer", () => {
    const html = buildWorkerHandoffHtml(
      profileToHandoffData(baseProfile, FIXED_NOW),
    );
    expect(html).toMatch(/nothing on this page was sent to a server/i);
  });
});
