import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

export const TEXT_SIZES = ["sm", "md", "lg"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

const SCALE_FOR: Record<TextSize, number> = {
  sm: 0.9375,
  md: 1,
  lg: 1.125,
};

const applyTextSize = (size: TextSize) => {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = `${SCALE_FOR[size] * 100}%`;
};

type PreferencesState = {
  textSize: TextSize;
  hasSeenListenHint: boolean;
  dismissedHintDate: string | null;
  setTextSize: (size: TextSize) => void;
  markListenHintSeen: () => void;
  dismissHintForToday: () => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      textSize: "md",
      hasSeenListenHint: false,
      dismissedHintDate: null,
      setTextSize: (size) => {
        applyTextSize(size);
        set({ textSize: size });
      },
      markListenHintSeen: () => set({ hasSeenListenHint: true }),
      dismissHintForToday: () =>
        set({ dismissedHintDate: new Date().toISOString().slice(0, 10) }),
    }),
    {
      name: "nest.preferences",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        textSize: s.textSize,
        hasSeenListenHint: s.hasSeenListenHint,
        dismissedHintDate: s.dismissedHintDate,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[nest.preferences] rehydrate failed:", error);
          return;
        }
        if (state) applyTextSize(state.textSize);
      },
    },
  ),
);
