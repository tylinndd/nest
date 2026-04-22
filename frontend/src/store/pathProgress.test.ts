import { beforeEach, describe, expect, it } from "vitest";
import { usePathProgress } from "./pathProgress";

describe("usePathProgress", () => {
  beforeEach(() => usePathProgress.getState().clear());

  it("toggle adds a completion key", () => {
    usePathProgress
      .getState()
      .toggle("documents", "Request birth certificate");
    expect(
      usePathProgress
        .getState()
        .isDone("documents", "Request birth certificate"),
    ).toBe(true);
  });

  it("toggle on an already-done item removes it", () => {
    const { toggle, isDone } = usePathProgress.getState();
    toggle("health", "Find a doctor");
    toggle("health", "Find a doctor");
    expect(isDone("health", "Find a doctor")).toBe(false);
  });

  it("countForZone only counts keys starting with that zoneId", () => {
    const { toggle, countForZone } = usePathProgress.getState();
    toggle("documents", "A");
    toggle("documents", "B");
    toggle("health", "C");
    expect(countForZone("documents")).toBe(2);
    expect(countForZone("health")).toBe(1);
  });
});
