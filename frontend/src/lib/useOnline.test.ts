import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnline } from "./useOnline";

const setOnlineProperty = (value: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
};

describe("useOnline", () => {
  afterEach(() => {
    setOnlineProperty(true);
  });

  it("returns true when navigator reports online", () => {
    setOnlineProperty(true);
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);
  });

  it("returns false when navigator reports offline at mount", () => {
    setOnlineProperty(false);
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(false);
  });

  it("updates when the window dispatches offline then online events", () => {
    setOnlineProperty(true);
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);

    act(() => {
      setOnlineProperty(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    act(() => {
      setOnlineProperty(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
