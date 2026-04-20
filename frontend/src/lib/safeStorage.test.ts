import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { safeStorage } from "./safeStorage";
import { usePersistHealth } from "@/store/persistHealth";

describe("safeStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    usePersistHealth.setState({ healthy: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("happy paths", () => {
    it("writes and reads values through localStorage", () => {
      safeStorage.setItem("k", "v");
      expect(safeStorage.getItem("k")).toBe("v");
      expect(localStorage.getItem("k")).toBe("v");
    });

    it("returns null for a missing key", () => {
      expect(safeStorage.getItem("missing")).toBeNull();
    });

    it("removes a key", () => {
      localStorage.setItem("k", "v");
      safeStorage.removeItem("k");
      expect(localStorage.getItem("k")).toBeNull();
    });

    it("leaves persistHealth healthy when writes succeed", () => {
      safeStorage.setItem("k", "v");
      expect(usePersistHealth.getState().healthy).toBe(true);
    });

    it("flips persistHealth back to healthy after a failure then success", () => {
      usePersistHealth.setState({ healthy: false });
      safeStorage.setItem("k", "v");
      expect(usePersistHealth.getState().healthy).toBe(true);
    });
  });

  describe("quota-exceeded + throwing storage", () => {
    it("marks persistHealth failed when setItem throws", () => {
      vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});

      safeStorage.setItem("k", "v");

      expect(usePersistHealth.getState().healthy).toBe(false);
    });

    it("swallows setItem errors and does not rethrow", () => {
      vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new Error("boom");
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(() => safeStorage.setItem("k", "v")).not.toThrow();
    });

    it("marks persistHealth failed when getItem throws", () => {
      vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
        throw new Error("read failed");
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = safeStorage.getItem("k");

      expect(result).toBeNull();
      expect(usePersistHealth.getState().healthy).toBe(false);
    });

    it("marks persistHealth failed when removeItem throws", () => {
      vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
        throw new Error("remove failed");
      });
      vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(() => safeStorage.removeItem("k")).not.toThrow();
      expect(usePersistHealth.getState().healthy).toBe(false);
    });
  });
});
