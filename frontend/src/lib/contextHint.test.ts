import { describe, expect, it } from "vitest";
import { getContextHint } from "./contextHint";

const weekdayAt = (hour: number) => {
  const d = new Date("2026-04-22T00:00:00"); // 2026-04-22 is a Wednesday
  d.setHours(hour, 0, 0, 0);
  return d;
};

describe("getContextHint", () => {
  it("returns morning hint at 8am weekday", () => {
    expect(getContextHint(weekdayAt(8))?.id).toBe("morning");
  });

  it("returns evening hint at 6pm weekday", () => {
    expect(getContextHint(weekdayAt(18))?.id).toBe("evening");
  });

  it("returns late-night hint at 11pm weekday", () => {
    expect(getContextHint(weekdayAt(23))?.id).toBe("late-night");
  });

  it("returns late-night hint at 2am weekday", () => {
    expect(getContextHint(weekdayAt(2))?.id).toBe("late-night");
  });

  it("returns null at midday on a weekday (1pm Wed)", () => {
    expect(getContextHint(weekdayAt(13))).toBeNull();
  });

  it("returns weekend hint at 1pm Saturday", () => {
    const sat = new Date("2026-04-25T13:00:00"); // 2026-04-25 is a Saturday
    expect(getContextHint(sat)?.id).toBe("weekend");
  });
});
