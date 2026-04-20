import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { linkify } from "./linkify";

const renderLinkify = (text: string) => render(<div>{linkify(text)}</div>);

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
});
