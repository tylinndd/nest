import { describe, it, expect } from "vitest";
import { buildPathHtml, profileToPathData } from "./pathExport";
import type { Profile } from "@/store/profile";

const baseProfile: Profile = {
  name: "Maria Gomez",
  age: 18,
  county: "Cobb",
  documentsHave: ["ssc"],
  uploadedDocs: ["birth"],
  education: "college",
  housing: "Foster home",
  health: ["I have Medicaid right now"],
  completedTaskIds: [],
  trustedAdult: { name: "Ms. Rivera", phone: "(404) 555-0101" },
};

describe("profileToPathData", () => {
  it("maps all profile fields", () => {
    const data = profileToPathData(baseProfile);
    expect(data.name).toBe("Maria Gomez");
    expect(data.age).toBe(18);
    expect(data.county).toBe("Cobb");
    expect(data.housing).toBe("Foster home");
    expect(data.education).toBe("Heading to college");
    expect(data.trustedAdult).toEqual({
      name: "Ms. Rivera",
      phone: "(404) 555-0101",
    });
  });

  it("falls back to em-dash for empty strings", () => {
    const data = profileToPathData({
      ...baseProfile,
      name: "  ",
      county: "",
      housing: "",
      education: null,
    });
    expect(data.name).toBe("—");
    expect(data.county).toBe("—");
    expect(data.housing).toBe("—");
    expect(data.education).toBe("—");
  });

  it("classifies document status", () => {
    const data = profileToPathData(baseProfile);
    const ssc = data.documents.find((d) => d.title === "Social Security card");
    const birth = data.documents.find((d) => d.title === "Birth certificate");
    const id = data.documents.find((d) => d.title === "Georgia state ID");
    expect(ssc?.status).toBe("Have");
    expect(birth?.status).toBe("Secured");
    expect(id?.status).toBe("Need to get");
  });

  it("includes all five zones", () => {
    const data = profileToPathData(baseProfile);
    expect(data.zones).toHaveLength(5);
    const titles = data.zones.map((z) => z.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Stabilize documents/),
        expect.stringMatching(/Health/),
        expect.stringMatching(/Housing/),
        expect.stringMatching(/Education/),
        expect.stringMatching(/Money/),
      ]),
    );
  });
});

describe("buildPathHtml", () => {
  it("escapes HTML in name and county", () => {
    const html = buildPathHtml({
      ...profileToPathData(baseProfile),
      name: '<script>alert("x")</script>',
      county: "O'Connor",
    });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders trusted adult row when provided", () => {
    const html = buildPathHtml(profileToPathData(baseProfile));
    expect(html).toContain("Ms. Rivera");
    expect(html).toContain("(404) 555-0101");
  });

  it("omits trusted-adult row entirely when null", () => {
    const html = buildPathHtml(
      profileToPathData({ ...baseProfile, trustedAdult: null }),
    );
    expect(html).not.toContain("Ms. Rivera");
    expect(html).not.toContain("Trusted adult");
    expect(html).not.toContain("(404) 555-0101");
  });

  it("emits the five crisis numbers", () => {
    const html = buildPathHtml(profileToPathData(baseProfile));
    expect(html).toContain("988");
    expect(html).toContain("911");
    expect(html).toContain("211");
    expect(html).toContain("1-855-422-4453");
    expect(html).toContain("(706) 542-3104");
  });

  it("contains privacy footer", () => {
    const html = buildPathHtml(profileToPathData(baseProfile));
    expect(html).toMatch(/nothing on this page was sent to us/i);
  });

  it("includes all document titles from the catalog", () => {
    const html = buildPathHtml(profileToPathData(baseProfile));
    expect(html).toContain("Social Security card");
    expect(html).toContain("Birth certificate");
    expect(html).toContain("Georgia state ID");
    expect(html).toContain("Medicaid card");
    expect(html).toContain("High school transcript");
  });

  it("renders each of the five zone titles", () => {
    const html = buildPathHtml(profileToPathData(baseProfile));
    expect(html).toMatch(/Stabilize documents/);
    expect(html).toMatch(/Health &amp; coverage/);
    expect(html).toMatch(/Housing plan/);
    expect(html).toMatch(/Education or career/);
    expect(html).toMatch(/Money &amp; independence/);
  });

  it("shows age as em-dash when null", () => {
    const data = profileToPathData({ ...baseProfile, age: null });
    const html = buildPathHtml(data);
    expect(html).toMatch(/<span class="label">Age<\/span>\s*<span class="value">—<\/span>/);
  });
});
