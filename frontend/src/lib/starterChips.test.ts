import { describe, expect, it } from "vitest";
import { pickStarterChips } from "./starterChips";
import type { Profile } from "@/store/profile";

const base: Profile = {
  name: "Test",
  age: 18,
  county: "Cobb",
  documentsHave: ["ssc", "id"],
  uploadedDocs: [],
  education: null,
  housing: "",
  health: [],
  completedTaskIds: [],
};

describe("pickStarterChips", () => {
  it("always returns three distinct chips", () => {
    const chips = pickStarterChips(base);
    expect(chips).toHaveLength(3);
    expect(new Set(chips).size).toBe(3);
  });

  it("asks about housing when unset", () => {
    const chips = pickStarterChips(base);
    expect(chips[0]).toMatch(/Where can I live/);
  });

  it("speaks to under-18s as planning, not crisis", () => {
    const chips = pickStarterChips({ ...base, age: 17 });
    expect(chips[1]).toMatch(/before I turn 18/);
    expect(chips[2]).toMatch(/when I age out/);
  });

  it("covers aged-out 22-year-olds with Medicaid-at-22", () => {
    const chips = pickStarterChips({ ...base, age: 22 });
    expect(chips[2]).toMatch(/Medicaid at 22/);
  });

  it("tailors practical slot to education plan", () => {
    const college = pickStarterChips({ ...base, education: "college" });
    expect(college[1]).toMatch(/KSU ASCEND/);
    const trade = pickStarterChips({ ...base, education: "trade" });
    expect(trade[1]).toMatch(/trade school/);
    const working = pickStarterChips({ ...base, education: "working" });
    expect(working[1]).toMatch(/aged-out status to an employer/);
  });

  it("flags missing core documents before school questions", () => {
    const chips = pickStarterChips({
      ...base,
      documentsHave: [],
      education: "college",
    });
    expect(chips[1]).toMatch(/Social Security/);
  });

  it("uses Maria's aging-out framing", () => {
    const chips = pickStarterChips({
      ...base,
      name: "Maria",
      age: 18,
      housing: "Group home",
      education: "college",
      documentsHave: ["ssc", "id", "medicaid"],
      health: ["I have Medicaid right now"],
    });
    expect(chips[0]).toMatch(/housing when I turn 18/);
    expect(chips[1]).toMatch(/KSU ASCEND/);
    expect(chips[2]).toMatch(/Medicaid after I turn 18/);
  });
});
