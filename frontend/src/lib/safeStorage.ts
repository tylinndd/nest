import type { StateStorage } from "zustand/middleware";
import { usePersistHealth } from "@/store/persistHealth";

export const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn(`[nest.storage] read failed (${key}):`, err);
      usePersistHealth.getState().markFailed();
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      usePersistHealth.getState().markOk();
    } catch (err) {
      console.warn(`[nest.storage] write failed (${key}):`, err);
      usePersistHealth.getState().markFailed();
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[nest.storage] remove failed (${key}):`, err);
      usePersistHealth.getState().markFailed();
    }
  },
};
