import { beforeEach, describe, expect, it } from "vitest";
import { usePreferences } from "./preferences";

describe("usePreferences", () => {
  beforeEach(() => {
    usePreferences.setState({
      textSize: "md",
      hasSeenListenHint: false,
      dismissedHintDate: null,
    });
    document.documentElement.style.fontSize = "";
  });

  it("setTextSize updates state and applies to <html>", () => {
    usePreferences.getState().setTextSize("lg");
    expect(usePreferences.getState().textSize).toBe("lg");
    expect(document.documentElement.style.fontSize).toBe("112.5%");
  });

  it("setTextSize to sm produces 93.75%", () => {
    usePreferences.getState().setTextSize("sm");
    expect(document.documentElement.style.fontSize).toBe("93.75%");
  });

  it("markListenHintSeen flips the flag exactly once", () => {
    const { markListenHintSeen } = usePreferences.getState();
    markListenHintSeen();
    expect(usePreferences.getState().hasSeenListenHint).toBe(true);
    markListenHintSeen();
    expect(usePreferences.getState().hasSeenListenHint).toBe(true);
  });

  it("dismissHintForToday writes today's ISO date", () => {
    usePreferences.getState().dismissHintForToday();
    const today = new Date().toISOString().slice(0, 10);
    expect(usePreferences.getState().dismissedHintDate).toBe(today);
  });
});
