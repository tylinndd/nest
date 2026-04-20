import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
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
