import { describe, it, expect } from "vitest";
import { deriveDeadlines } from "./deadlines";
import type { Profile } from "@/store/profile";

const baseProfile: Profile = {
  name: "Test",
  age: 17,
  county: "Cobb",
  documentsHave: [],
  uploadedDocs: [],
  education: "college",
  housing: "Foster home",
  health: [],
  completedTaskIds: [],
  trustedAdult: null,
};

describe("deriveDeadlines", () => {
  it("returns empty list when age is unknown", () => {
    expect(deriveDeadlines({ ...baseProfile, age: null })).toEqual([]);
  });

  it("shows turning-18 for youth under 18", () => {
    const dl = deriveDeadlines({ ...baseProfile, age: 17 });
    expect(dl.find((d) => d.id === "turning-18")).toBeDefined();
  });

  it("hides turning-18 for 18 and up", () => {
    const dl = deriveDeadlines({ ...baseProfile, age: 18 });
    expect(dl.find((d) => d.id === "turning-18")).toBeUndefined();
  });

  it("shows EYSS window only in the 17–20 range", () => {
    expect(
      deriveDeadlines({ ...baseProfile, age: 17 }).some(
        (d) => d.id === "eyss",
      ),
    ).toBe(true);
    expect(
      deriveDeadlines({ ...baseProfile, age: 20 }).some(
        (d) => d.id === "eyss",
      ),
    ).toBe(true);
    expect(
      deriveDeadlines({ ...baseProfile, age: 16 }).some(
        (d) => d.id === "eyss",
      ),
    ).toBe(false);
    expect(
      deriveDeadlines({ ...baseProfile, age: 22 }).some(
        (d) => d.id === "eyss",
      ),
    ).toBe(false);
  });

  it("surfaces FAFSA only when going to college or trade school", () => {
    expect(
      deriveDeadlines({ ...baseProfile, age: 17, education: "college" }).some(
        (d) => d.id === "fafsa",
      ),
    ).toBe(true);
    expect(
      deriveDeadlines({ ...baseProfile, age: 17, education: "working" }).some(
        (d) => d.id === "fafsa",
      ),
    ).toBe(false);
  });

  it("shows FFCM while under 26 and hides it at 26+", () => {
    expect(
      deriveDeadlines({ ...baseProfile, age: 22 }).some((d) => d.id === "ffcm"),
    ).toBe(true);
    expect(
      deriveDeadlines({ ...baseProfile, age: 26 }).some((d) => d.id === "ffcm"),
    ).toBe(false);
  });

  it("labels FFCM as 'now' urgency when close to 26", () => {
    const dl = deriveDeadlines({ ...baseProfile, age: 25 });
    const ffcm = dl.find((d) => d.id === "ffcm");
    expect(ffcm?.urgency).toBe("now");
  });

  it("sorts by urgency with now first", () => {
    const dl = deriveDeadlines({ ...baseProfile, age: 17 });
    const urgencies = dl.map((d) => d.urgency);
    const firstLater = urgencies.indexOf("later");
    const firstNow = urgencies.indexOf("now");
    if (firstLater !== -1 && firstNow !== -1) {
      expect(firstNow).toBeLessThan(firstLater);
    }
  });

  it("includes ILP review for 14–20 range", () => {
    expect(
      deriveDeadlines({ ...baseProfile, age: 14 }).some(
        (d) => d.id === "ilp-review",
      ),
    ).toBe(true);
    expect(
      deriveDeadlines({ ...baseProfile, age: 21 }).some(
        (d) => d.id === "ilp-review",
      ),
    ).toBe(false);
  });

  it("attaches askPrompt strings to deadlines", () => {
    const dl = deriveDeadlines({ ...baseProfile, age: 17 });
    const withPrompts = dl.filter((d) => d.askPrompt);
    expect(withPrompts.length).toBeGreaterThan(0);
    for (const d of withPrompts) {
      expect(d.askPrompt).toMatch(/\?$/);
    }
  });

  it("surfaces ASCEND only for college-bound youth", () => {
    expect(
      deriveDeadlines({ ...baseProfile, age: 17, education: "college" }).some(
        (d) => d.id === "ascend",
      ),
    ).toBe(true);
    expect(
      deriveDeadlines({ ...baseProfile, age: 17, education: "trade" }).some(
        (d) => d.id === "ascend",
      ),
    ).toBe(false);
  });
});
