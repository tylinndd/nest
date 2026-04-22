import { describe, it, expect, beforeEach } from "vitest";
import { useTour, TOUR_STOPS, TOUR_TOTAL_MS } from "./tour";

describe("useTour store", () => {
  beforeEach(() => {
    useTour.setState({ active: false, paused: false, stepIndex: 0 });
  });

  it("covers all three personas across 9 stops", () => {
    expect(TOUR_STOPS).toHaveLength(9);
    const personas = new Set(TOUR_STOPS.map((s) => s.persona));
    expect(personas).toEqual(new Set(["maria", "marcus", "jade"]));
  });

  it("total duration fits in a reasonable demo window (<=75s)", () => {
    expect(TOUR_TOTAL_MS).toBeLessThanOrEqual(75_000);
    expect(TOUR_TOTAL_MS).toBeGreaterThanOrEqual(45_000);
  });

  it("start activates tour at step 0", () => {
    useTour.getState().start();
    const s = useTour.getState();
    expect(s.active).toBe(true);
    expect(s.paused).toBe(false);
    expect(s.stepIndex).toBe(0);
  });

  it("next advances stepIndex", () => {
    useTour.getState().start();
    useTour.getState().next();
    expect(useTour.getState().stepIndex).toBe(1);
  });

  it("next at last step ends the tour", () => {
    useTour.setState({
      active: true,
      paused: false,
      stepIndex: TOUR_STOPS.length - 1,
    });
    useTour.getState().next();
    const s = useTour.getState();
    expect(s.active).toBe(false);
    expect(s.stepIndex).toBe(0);
  });

  it("prev cannot go below 0", () => {
    useTour.getState().start();
    useTour.getState().prev();
    expect(useTour.getState().stepIndex).toBe(0);
  });

  it("stop deactivates and resets", () => {
    useTour.setState({ active: true, paused: true, stepIndex: 3 });
    useTour.getState().stop();
    const s = useTour.getState();
    expect(s.active).toBe(false);
    expect(s.paused).toBe(false);
    expect(s.stepIndex).toBe(0);
  });

  it("togglePause flips paused state", () => {
    useTour.getState().start();
    useTour.getState().togglePause();
    expect(useTour.getState().paused).toBe(true);
    useTour.getState().togglePause();
    expect(useTour.getState().paused).toBe(false);
  });
});
