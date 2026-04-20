import { describe, it, expect } from "vitest";
import { buildChatSeed } from "./placeholder";

describe("buildChatSeed", () => {
  it("greets by first name when a full name is given", () => {
    const seed = buildChatSeed("Stephen Sookra");
    expect(seed).toHaveLength(1);
    expect(seed[0].role).toBe("assistant");
    expect(seed[0].text).toBe(
      "Hey Stephen. I can help with housing, benefits, school, or your next step.",
    );
  });

  it("greets by the single name when only one word is given", () => {
    const seed = buildChatSeed("Alice");
    expect(seed[0].text.startsWith("Hey Alice.")).toBe(true);
  });

  it("falls back to a bare greeting when the name is empty", () => {
    const seed = buildChatSeed("");
    expect(seed[0].text.startsWith("Hey.")).toBe(true);
  });

  it("falls back to a bare greeting when the name is only whitespace", () => {
    const seed = buildChatSeed("   ");
    expect(seed[0].text.startsWith("Hey.")).toBe(true);
  });

  it("trims surrounding whitespace before picking the first word", () => {
    const seed = buildChatSeed("   Jordan   Smith  ");
    expect(seed[0].text.startsWith("Hey Jordan.")).toBe(true);
  });

  it("collapses multiple internal spaces when splitting", () => {
    const seed = buildChatSeed("Sam   Taylor");
    expect(seed[0].text.startsWith("Hey Sam.")).toBe(true);
  });
});
