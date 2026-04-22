import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { glossify, linkify } from "./linkify";

const renderLinkify = (text: string) => render(<div>{linkify(text)}</div>);
const renderGlossify = (text: string) => render(<div>{glossify(text)}</div>);

describe("linkify", () => {
  it("returns plain text when no patterns match", () => {
    const { container } = renderLinkify("just some words");
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container.textContent).toBe("just some words");
  });

  it("wraps emails as mailto links", () => {
    const { container } = renderLinkify("email help@example.com today");
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("mailto:help@example.com");
    expect(links[0].textContent).toBe("help@example.com");
  });

  it("wraps (xxx) xxx-xxxx phones as tel links and strips non-digits from href", () => {
    const { container } = renderLinkify("Call (470) 578-6777 today");
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("tel:4705786777");
    expect(link?.textContent).toBe("(470) 578-6777");
  });

  it("wraps xxx-xxx-xxxx phones as tel links", () => {
    const { container } = renderLinkify("Call 470-578-6777");
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "tel:4705786777",
    );
  });

  it("wraps xxx.xxx.xxxx phones as tel links", () => {
    const { container } = renderLinkify("Call 470.578.6777 today");
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "tel:4705786777",
    );
  });

  it("wraps 211 short code as tel link", () => {
    const { container } = renderLinkify("Dial 211 for help.");
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("tel:211");
    expect(link?.textContent).toBe("211");
  });

  it("wraps 988 and 911 short codes together", () => {
    const { container } = renderLinkify("Call 988 or 911");
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("href")).toBe("tel:988");
    expect(links[1].getAttribute("href")).toBe("tel:911");
  });

  it("ignores bare 3-digit numbers that aren't recognized short codes", () => {
    const { container } = renderLinkify("There are 250 forms");
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });

  it("preserves surrounding text when linking a single match in the middle", () => {
    const { container } = renderLinkify("Dial 211 or email help@x.co anytime");
    expect(container.querySelectorAll("a")).toHaveLength(2);
    expect(container.textContent).toBe("Dial 211 or email help@x.co anytime");
  });

  it("handles match at start of string", () => {
    const { container } = renderLinkify("help@example.com is the line");
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "mailto:help@example.com",
    );
  });

  it("wraps glossary acronyms as interactive buttons", () => {
    const { container } = renderLinkify("Contact DFCS about your ILP case");
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const labels = Array.from(buttons).map((b) => b.getAttribute("aria-label"));
    expect(labels.some((l) => l?.includes("DFCS"))).toBe(true);
    expect(labels.some((l) => l?.includes("ILP"))).toBe(true);
  });

  it("ignores acronym-like text that is not in the glossary", () => {
    const { container } = renderLinkify("Look at RANDOMACR for details");
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("keeps phone links and acronyms side by side", () => {
    const { container } = renderLinkify("Call (470) 578-6777 about your DFCS case");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelectorAll("button").length).toBeGreaterThanOrEqual(1);
  });
});

describe("glossify", () => {
  it("returns plain text when no acronyms match", () => {
    const { container } = renderGlossify("just some plain words");
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.textContent).toBe("just some plain words");
  });

  it("wraps known acronyms in a popover trigger", () => {
    const { container } = renderGlossify("Your ILP coordinator handles this.");
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT linkify phone numbers or emails", () => {
    const { container } = renderGlossify(
      "Call 211 or email help@example.com for DFCS questions.",
    );
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container.querySelectorAll("button").length).toBeGreaterThanOrEqual(1);
  });

  it("ignores unknown acronyms", () => {
    const { container } = renderGlossify("Look at RANDOMACR today");
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.textContent).toBe("Look at RANDOMACR today");
  });
});
