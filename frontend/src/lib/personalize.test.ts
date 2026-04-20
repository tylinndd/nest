import { describe, it, expect } from "vitest";
import type { Profile } from "@/store/profile";
import {
  computeDaysUntilAgeOut,
  derivePersonalizedTasks,
  derivePersonalizedVault,
  describeVaultDoc,
} from "./personalize";

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  name: "Test",
  age: 18,
  county: "Cobb",
  documentsHave: [],
  uploadedDocs: [],
  education: null,
  housing: "",
  health: [],
  completedTaskIds: [],
  ...overrides,
});

describe("describeVaultDoc", () => {
  it("returns 'Secured' copy when uploaded", () => {
    expect(
      describeVaultDoc({ id: "birth", title: "Birth certificate", state: "uploaded" }),
    ).toBe("Secured in your vault");
  });

  it("nudges the user to add a photo when they have the doc but haven't secured it", () => {
    expect(
      describeVaultDoc({ id: "birth", title: "Birth certificate", state: "haveNotSecured" }),
    ).toBe("You have this — add a photo to secure it");
  });

  it("returns the catalog's missing-detail copy when the doc still needs to be obtained", () => {
    expect(
      describeVaultDoc({ id: "medicaid", title: "Medicaid card", state: "needToGet" }),
    ).toBe("Call 877-423-4746 to reissue");
  });
});

describe("derivePersonalizedVault", () => {
  it("marks every catalog entry as needToGet when the profile is empty", () => {
    const docs = derivePersonalizedVault(makeProfile());
    expect(docs).toHaveLength(5);
    expect(docs.every((d) => d.state === "needToGet")).toBe(true);
  });

  it("flips docs the user claims to have to haveNotSecured", () => {
    const docs = derivePersonalizedVault(
      makeProfile({ documentsHave: ["birth", "ssc"] }),
    );
    const byId = Object.fromEntries(docs.map((d) => [d.id, d.state]));
    expect(byId.birth).toBe("haveNotSecured");
    expect(byId.ssc).toBe("haveNotSecured");
    expect(byId.id).toBe("needToGet");
  });

  it("prefers uploaded over merely having — uploadedDocs wins", () => {
    const docs = derivePersonalizedVault(
      makeProfile({ documentsHave: ["birth"], uploadedDocs: ["birth"] }),
    );
    expect(docs.find((d) => d.id === "birth")?.state).toBe("uploaded");
  });
});

describe("derivePersonalizedTasks", () => {
  it("recommends the four missing-doc tasks plus overdue extended Medicaid for an 18-year-old with nothing", () => {
    const tasks = derivePersonalizedTasks(makeProfile({ age: 18 }));
    const ids = tasks.map((t) => t.id);
    expect(ids).toContain("doc-birth");
    expect(ids).toContain("doc-ssc");
    expect(ids).toContain("medicaid-extended");
    expect(ids).toContain("doc-id");
    expect(ids).toContain("doc-transcript");
    expect(tasks.find((t) => t.id === "medicaid-extended")?.status).toBe("overdue");
  });

  it("skips extended-Medicaid when the user already has Medicaid", () => {
    const tasks = derivePersonalizedTasks(
      makeProfile({ age: 18, health: ["I have Medicaid right now"] }),
    );
    expect(tasks.map((t) => t.id)).not.toContain("medicaid-extended");
  });

  it("adds Chafee ETV + KSU ASCEND for the college plan", () => {
    const tasks = derivePersonalizedTasks(makeProfile({ education: "college" }));
    const ids = tasks.map((t) => t.id);
    expect(ids).toContain("chafee-etv");
    expect(ids).toContain("ksu-ascend");
  });

  it("adds the tuition waiver for the trade plan", () => {
    const tasks = derivePersonalizedTasks(makeProfile({ education: "trade" }));
    expect(tasks.map((t) => t.id)).toContain("tuition-waiver");
  });

  it("adds HUD FYI coordination for an 18-year-old in a foster home", () => {
    const tasks = derivePersonalizedTasks(
      makeProfile({ age: 18, housing: "Foster home" }),
    );
    expect(tasks.map((t) => t.id)).toContain("hud-fyi");
  });

  it("adds transitional-living when housing is unsure", () => {
    const tasks = derivePersonalizedTasks(
      makeProfile({ housing: "Unsure / something else" }),
    );
    expect(tasks.map((t) => t.id)).toContain("transitional-housing");
  });

  it("adds find-pcp when the user flags needing a primary care doctor", () => {
    const tasks = derivePersonalizedTasks(
      makeProfile({ health: ["I need a primary care doctor"] }),
    );
    expect(tasks.map((t) => t.id)).toContain("find-pcp");
  });

  it("marks completed task IDs as done with sage tone and clears the help CTA", () => {
    const tasks = derivePersonalizedTasks(
      makeProfile({ age: 18, completedTaskIds: ["doc-birth"] }),
    );
    const birth = tasks.find((t) => t.id === "doc-birth");
    expect(birth?.status).toBe("done");
    expect(birth?.tone).toBe("sage");
    expect(birth?.due).toBe("Completed");
    expect(birth?.help).toBeUndefined();
  });
});

describe("computeDaysUntilAgeOut", () => {
  it("returns null when age is unknown", () => {
    expect(computeDaysUntilAgeOut(null)).toBeNull();
  });

  it("counts down to 18 for minors", () => {
    expect(computeDaysUntilAgeOut(16)).toBe(730);
    expect(computeDaysUntilAgeOut(17)).toBe(365);
  });

  it("counts down to 21 once aging-out starts", () => {
    expect(computeDaysUntilAgeOut(18)).toBe(1095);
    expect(computeDaysUntilAgeOut(20)).toBe(365);
  });

  it("returns 0 once the user is past 21", () => {
    expect(computeDaysUntilAgeOut(21)).toBe(0);
    expect(computeDaysUntilAgeOut(25)).toBe(0);
  });
});
