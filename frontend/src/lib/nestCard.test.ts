import { describe, it, expect } from "vitest";
import { buildNestCardHtml, profileToCardData } from "./nestCard";
import type { Profile } from "@/store/profile";

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
  trustedAdult: { name: "Ms. Carter · caseworker", phone: "(470) 555-0198" },
};

describe("profileToCardData", () => {
  it("maps a profile to card data", () => {
    const data = profileToCardData(baseProfile);
    expect(data.name).toBe("Maria");
    expect(data.county).toBe("Cobb");
    expect(data.age).toBe(18);
    expect(data.trustedAdult?.phone).toBe("(470) 555-0198");
  });

  it("falls back to em dash when name or county is blank", () => {
    const data = profileToCardData({
      ...baseProfile,
      name: "   ",
      county: "",
    });
    expect(data.name).toBe("—");
    expect(data.county).toBe("—");
  });
});

describe("buildNestCardHtml", () => {
  it("renders a full HTML document with both cards", () => {
    const html = buildNestCardHtml(profileToCardData(baseProfile));
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html.includes('class="card front"')).toBe(true);
    expect(html.includes('class="card back"')).toBe(true);
    expect(html.includes("Maria")).toBe(true);
    expect(html.includes("Cobb")).toBe(true);
    expect(html.includes("988")).toBe(true);
    expect(html.includes("1-855-422-4453")).toBe(true);
    expect(html.includes("(706) 542-3104")).toBe(true);
  });

  it("includes the trusted adult on the back when present", () => {
    const html = buildNestCardHtml(profileToCardData(baseProfile));
    expect(html.includes("Ms. Carter")).toBe(true);
    expect(html.includes("(470) 555-0198")).toBe(true);
  });

  it("omits the trusted adult row when null", () => {
    const html = buildNestCardHtml(
      profileToCardData({ ...baseProfile, trustedAdult: null }),
    );
    expect(html.includes("Trusted adult")).toBe(false);
  });

  it("escapes HTML in profile fields", () => {
    const html = buildNestCardHtml(
      profileToCardData({
        ...baseProfile,
        name: "<script>alert(1)</script>",
        county: "Bath & County",
      }),
    );
    expect(html.includes("<script>alert(1)</script>")).toBe(false);
    expect(html.includes("&lt;script&gt;")).toBe(true);
    expect(html.includes("Bath &amp; County")).toBe(true);
  });

  it("shows em dash for age when null", () => {
    const html = buildNestCardHtml(
      profileToCardData({ ...baseProfile, age: null }),
    );
    const ageSection = html.match(/Age<\/span>\s*<span class="value">([^<]+)</);
    expect(ageSection?.[1]).toBe("—");
  });
});
