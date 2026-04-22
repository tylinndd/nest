import { describe, it, expect } from "vitest";
import { migrateProfile } from "./profile";

describe("migrateProfile", () => {
  it("returns an empty profile for null/undefined", () => {
    expect(migrateProfile(null)).toEqual({
      name: "",
      age: null,
      county: "",
      documentsHave: [],
      uploadedDocs: [],
      education: null,
      housing: "",
      health: [],
      completedTaskIds: [],
      trustedAdult: null,
    });
    expect(migrateProfile(undefined)).toEqual({
      name: "",
      age: null,
      county: "",
      documentsHave: [],
      uploadedDocs: [],
      education: null,
      housing: "",
      health: [],
      completedTaskIds: [],
      trustedAdult: null,
    });
  });

  it("returns an empty profile for malformed shapes", () => {
    expect(migrateProfile("garbage")).toMatchObject({ name: "", age: null });
    expect(migrateProfile(42)).toMatchObject({ name: "", age: null });
    expect(migrateProfile([])).toMatchObject({ name: "", age: null });
  });

  it("migrates a v0 blob with just a name", () => {
    const v0 = { name: "Maria" };
    const result = migrateProfile(v0);
    expect(result.name).toBe("Maria");
    expect(result.age).toBeNull();
    expect(result.completedTaskIds).toEqual([]);
  });

  it("migrates a v1 blob (name + age + county)", () => {
    const v1 = { name: "Maria", age: 18, county: "Cobb" };
    const result = migrateProfile(v1);
    expect(result).toMatchObject({
      name: "Maria",
      age: 18,
      county: "Cobb",
      completedTaskIds: [],
    });
  });

  it("migrates a v2 blob with documents + education", () => {
    const v2 = {
      name: "Maria",
      age: 19,
      county: "Fulton",
      documentsHave: ["birth", "id"],
      uploadedDocs: ["birth"],
      education: "college",
    };
    const result = migrateProfile(v2);
    expect(result).toMatchObject({
      name: "Maria",
      age: 19,
      county: "Fulton",
      documentsHave: ["birth", "id"],
      uploadedDocs: ["birth"],
      education: "college",
      completedTaskIds: [],
    });
  });

  it("migrates a v3 blob with housing + health but no completedTaskIds", () => {
    const v3 = {
      name: "Maria",
      age: 20,
      county: "DeKalb",
      documentsHave: ["ssc"],
      uploadedDocs: [],
      education: "trade",
      housing: "Foster home",
      health: ["I have Medicaid right now", "I take prescriptions"],
    };
    const result = migrateProfile(v3);
    expect(result).toMatchObject({
      housing: "Foster home",
      health: ["I have Medicaid right now", "I take prescriptions"],
      completedTaskIds: [],
    });
  });

  it("migrates a v4 blob (no trustedAdult yet)", () => {
    const v4 = {
      name: "Maria",
      age: 18,
      county: "Cobb",
      documentsHave: ["birth", "id", "ssc"],
      uploadedDocs: ["birth"],
      education: "working",
      housing: "Independent living program",
      health: ["None of these apply"],
      completedTaskIds: ["task-1", "task-2"],
    };
    expect(migrateProfile(v4)).toEqual({ ...v4, trustedAdult: null });
  });

  it("preserves a v5 blob round-trip (with trustedAdult)", () => {
    const v5 = {
      name: "Maria",
      age: 18,
      county: "Cobb",
      documentsHave: ["birth"],
      uploadedDocs: [],
      education: "college",
      housing: "Foster home",
      health: [],
      completedTaskIds: [],
      trustedAdult: { name: "Ms. Carter", phone: "(470) 555-0198" },
    };
    expect(migrateProfile(v5)).toEqual(v5);
  });

  it("drops trustedAdult when shape is malformed", () => {
    expect(migrateProfile({ trustedAdult: {} }).trustedAdult).toBeNull();
    expect(
      migrateProfile({ trustedAdult: { name: "", phone: "555" } })
        .trustedAdult,
    ).toBeNull();
    expect(
      migrateProfile({ trustedAdult: { name: "Ms. Carter", phone: "" } })
        .trustedAdult,
    ).toBeNull();
    expect(migrateProfile({ trustedAdult: "not an object" }).trustedAdult)
      .toBeNull();
  });

  it("drops unknown document ids", () => {
    const result = migrateProfile({
      documentsHave: ["birth", "not-a-real-doc", "id"],
      uploadedDocs: ["garbage"],
    });
    expect(result.documentsHave).toEqual(["birth", "id"]);
    expect(result.uploadedDocs).toEqual([]);
  });

  it("drops unknown health flags", () => {
    const result = migrateProfile({
      health: ["I have Medicaid right now", "fake-flag"],
    });
    expect(result.health).toEqual(["I have Medicaid right now"]);
  });

  it("clears unknown housing values", () => {
    expect(migrateProfile({ housing: "mansion" }).housing).toBe("");
    expect(migrateProfile({ housing: 42 }).housing).toBe("");
  });

  it("clears unknown education values", () => {
    expect(migrateProfile({ education: "phd" }).education).toBeNull();
    expect(migrateProfile({ education: null }).education).toBeNull();
  });

  it("coerces non-string / non-number scalars to safe defaults", () => {
    const result = migrateProfile({
      name: 42,
      age: "eighteen",
      county: false,
    });
    expect(result.name).toBe("");
    expect(result.age).toBeNull();
    expect(result.county).toBe("");
  });

  it("filters non-string completedTaskIds", () => {
    const result = migrateProfile({
      completedTaskIds: ["a", 2, null, "b", { id: "c" }],
    });
    expect(result.completedTaskIds).toEqual(["a", "b"]);
  });

  it("caps oversized name at 80 chars", () => {
    const huge = "a".repeat(10_000);
    expect(migrateProfile({ name: huge }).name).toBe("a".repeat(80));
  });

  it("caps oversized county at 40 chars", () => {
    const huge = "b".repeat(500);
    expect(migrateProfile({ county: huge }).county).toBe("b".repeat(40));
  });

  it("coerces non-string name/county to empty string", () => {
    expect(migrateProfile({ name: { foo: "bar" } }).name).toBe("");
    expect(migrateProfile({ county: [1, 2, 3] }).county).toBe("");
  });

  it("caps trustedAdult name at 80 chars and phone at 40", () => {
    const result = migrateProfile({
      trustedAdult: {
        name: "c".repeat(500),
        phone: "d".repeat(500),
      },
    });
    expect(result.trustedAdult).toEqual({
      name: "c".repeat(80),
      phone: "d".repeat(40),
    });
  });
});
