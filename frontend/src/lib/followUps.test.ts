import { describe, it, expect } from "vitest";
import { suggestFollowUps } from "./followUps";

describe("suggestFollowUps", () => {
  it("returns at most 3 chips", () => {
    const chips = suggestFollowUps(
      "How do I get my birth certificate?",
      "In Georgia you request your birth certificate from Vital Records. There's a fee. Your caseworker can sometimes help.",
    );
    expect(chips.length).toBeLessThanOrEqual(3);
    expect(chips.length).toBeGreaterThan(0);
  });

  it("matches topic from answer text", () => {
    const chips = suggestFollowUps(
      "Tell me about health coverage",
      "Former Foster Care Medicaid covers you in Georgia until you turn 26. You just need to be enrolled.",
    );
    expect(chips.some((c) => /medicaid/i.test(c) || /doctor/i.test(c))).toBe(
      true,
    );
  });

  it("falls back to question topic when answer is short", () => {
    const chips = suggestFollowUps(
      "How do I apply for the Chafee ETV?",
      "See the ETV coordinator.",
    );
    expect(chips.some((c) => /chafee|etv|deadline|money/i.test(c))).toBe(true);
  });

  it("returns generic chips when nothing matches", () => {
    const chips = suggestFollowUps(
      "Hi",
      "Hello — I'm here to help you navigate life after foster care.",
    );
    expect(chips.length).toBeGreaterThan(0);
    expect(chips).toEqual(
      expect.arrayContaining([expect.stringMatching(/next step|help|walk/i)]),
    );
  });

  it("does not echo the user's own question back", () => {
    const question = "What's my next step?";
    const chips = suggestFollowUps(question, "You have no data filled out.");
    expect(chips).not.toContain(question);
  });

  it("dedupes suggestions across multiple matched rules", () => {
    const chips = suggestFollowUps(
      "Tell me about Medicaid and doctors",
      "Medicaid covers you. A primary care doctor can help you stay healthy.",
    );
    const unique = new Set(chips);
    expect(unique.size).toBe(chips.length);
  });

  it("handles punctuation and case in triggers", () => {
    const chips = suggestFollowUps(
      "Help",
      "The FAFSA is due before you start college.",
    );
    expect(chips.some((c) => /fafsa|deadline/i.test(c))).toBe(true);
  });

  it("prioritizes answer-matched chips over generic", () => {
    const chips = suggestFollowUps(
      "Help me",
      "You should talk to your caseworker about getting a birth certificate.",
    );
    expect(chips.some((c) => /caseworker|document|first|cost/i.test(c))).toBe(
      true,
    );
  });

  it("never returns an empty list", () => {
    expect(suggestFollowUps("", "")).not.toHaveLength(0);
  });
});
