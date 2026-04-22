import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { DeadlineTimeline } from "./DeadlineTimeline";
import type { Profile } from "@/store/profile";
import type { Deadline } from "@/lib/deadlines";

const baseProfile: Profile = {
  name: "Maria",
  age: 17,
  county: "Cobb",
  documentsHave: [],
  uploadedDocs: [],
  education: "college",
  housing: "Foster home",
  health: [],
  completedTaskIds: [],
  trustedAdult: null,
};

const ffcm: Deadline = {
  id: "ffcm",
  title: "Former Foster Care Medicaid",
  when: "Coverage until age 26",
  urgency: "later",
  category: "health",
  description: "Medicaid until 26.",
};

const turning18: Deadline = {
  id: "turning-18",
  title: "Your 18th birthday",
  when: "Within a year",
  urgency: "now",
  category: "planning",
  description: "The hardest day to be unprepared.",
};

describe("DeadlineTimeline", () => {
  it("renders nothing when age is null", () => {
    const { container } = render(
      <DeadlineTimeline
        profile={{ ...baseProfile, age: null }}
        deadlines={[ffcm]}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when there are no deadlines", () => {
    const { container } = render(
      <DeadlineTimeline profile={baseProfile} deadlines={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders age landmarks including 18, 21, and 26 for a 17-year-old", () => {
    const { container } = render(
      <DeadlineTimeline
        profile={baseProfile}
        deadlines={[ffcm, turning18]}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("18");
    expect(text).toContain("21");
    expect(text).toContain("26");
  });

  it("renders one button per deadline", () => {
    const { container } = render(
      <DeadlineTimeline
        profile={baseProfile}
        deadlines={[ffcm, turning18]}
      />,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
  });

  it("fires onSelect with the deadline when a dot is clicked", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <DeadlineTimeline
        profile={baseProfile}
        deadlines={[turning18]}
        onSelect={onSelect}
      />,
    );
    const button = container.querySelector("button");
    button?.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].id).toBe("turning-18");
  });

  it("shows the start age and end age in the header", () => {
    const { container } = render(
      <DeadlineTimeline
        profile={baseProfile}
        deadlines={[ffcm]}
      />,
    );
    expect(container.textContent).toMatch(/17\s*→\s*27/);
  });

  it("includes the three urgency legend labels", () => {
    const { container } = render(
      <DeadlineTimeline
        profile={baseProfile}
        deadlines={[ffcm, turning18]}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Now");
    expect(text).toContain("Soon");
    expect(text).toContain("Later");
  });
});
