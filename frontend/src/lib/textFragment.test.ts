import { describe, it, expect } from "vitest";
import { buildPassageHref } from "./textFragment";

describe("buildPassageHref", () => {
  it("returns null when url is null", () => {
    expect(buildPassageHref(null, "anything")).toBeNull();
  });

  it("returns the original url when snippet is empty", () => {
    expect(buildPassageHref("https://x.com/", "")).toBe("https://x.com/");
    expect(buildPassageHref("https://x.com/", "   ")).toBe("https://x.com/");
  });

  it("appends a text fragment with percent-encoded snippet for html urls", () => {
    const out = buildPassageHref(
      "https://embarkgeorgia.org/about-etv/",
      "Chafee ETV provides up to $5,000 per year for tuition",
    );
    expect(out).toMatch(/^https:\/\/embarkgeorgia\.org\/about-etv\/#:~:text=/);
    expect(out).toContain("Chafee%20ETV%20provides");
  });

  it("truncates long snippets to word boundary under ~120 chars", () => {
    const long = "The quick brown fox jumps over the lazy dog. ".repeat(10);
    const out = buildPassageHref("https://x.com/", long);
    const decoded = decodeURIComponent(out!.split("#:~:text=")[1]);
    expect(decoded.length).toBeLessThanOrEqual(120);
    expect(long).toContain(decoded);
    // char immediately after the truncation boundary must be whitespace,
    // proving a clean word-boundary cut (not a mid-word hack-job)
    expect(long[decoded.length]).toMatch(/\s/);
  });

  it("hard-cuts at 120 chars when no word boundary is available", () => {
    const unbreakable = "x".repeat(200);
    const out = buildPassageHref("https://x.com/", unbreakable);
    const decoded = decodeURIComponent(out!.split("#:~:text=")[1]);
    expect(decoded.length).toBeLessThanOrEqual(120);
  });

  it("strips leading/trailing ellipsis from snippet", () => {
    const out = buildPassageHref("https://x.com/", "…Chafee ETV provides…");
    expect(out).not.toContain("%E2%80%A6");
    expect(out).toContain("Chafee%20ETV%20provides");
  });

  it("encodes dashes as %2D to avoid fragment-directive collision", () => {
    const out = buildPassageHref("https://x.com/", "age-out rules");
    expect(out).toContain("age%2Dout");
  });

  it("collapses internal whitespace and strips zero-width chars", () => {
    const messy = "Chafee\u00A0ETV  provides\u200Bup";
    const out = buildPassageHref("https://x.com/", messy);
    const decoded = decodeURIComponent(out!.split("#:~:text=")[1]);
    expect(decoded).toBe("Chafee ETV provides up");
  });

  it("returns base url (no fragment) for pdf pathnames", () => {
    expect(
      buildPassageHref(
        "https://dfcs.georgia.gov/division-5.pdf",
        "Section 12 covers…",
      ),
    ).toBe("https://dfcs.georgia.gov/division-5.pdf");
    expect(
      buildPassageHref(
        "https://dfcs.georgia.gov/div5.PDF?v=2",
        "Section 12 covers…",
      ),
    ).toBe("https://dfcs.georgia.gov/div5.PDF?v=2");
  });

  it("returns base url (no fragment) for binary pathnames", () => {
    for (const path of [
      "https://x.com/f.docx",
      "https://x.com/f.xlsx",
      "https://x.com/f.zip",
      "https://x.com/f.png",
    ]) {
      const out = buildPassageHref(path, "snippet");
      expect(out).toBe(path);
    }
  });

  it("strips an existing fragment before appending the text fragment", () => {
    const out = buildPassageHref(
      "https://x.com/doc#section-3",
      "hello world",
    );
    expect(out).toBe("https://x.com/doc#:~:text=hello%20world");
  });

  it("never throws on malformed input", () => {
    const bad = [
      "",
      "http://",
      "not a url",
      "javascript:alert(1)",
      "://relative",
    ];
    for (const url of bad) {
      expect(() => buildPassageHref(url, "snippet")).not.toThrow();
    }
  });
});
