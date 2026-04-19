import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn("[nest.theme] read failed:", err);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn("[nest.theme] write failed:", err);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("[nest.theme] remove failed:", err);
    }
  },
};

const applyTheme = (t: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
};

const systemPreferred = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemPreferred(),
      setTheme: (t) => {
        applyTheme(t);
        set({ theme: t });
      },
      toggle: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "nest.theme",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[nest.theme] rehydrate failed:", error);
          return;
        }
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
