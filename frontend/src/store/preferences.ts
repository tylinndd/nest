import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

export const TEXT_SIZES = ["sm", "md", "lg"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export const FONT_FACES = ["default", "dyslexia"] as const;
export type FontFace = (typeof FONT_FACES)[number];

const SCALE_FOR: Record<TextSize, number> = {
  sm: 0.9375,
  md: 1,
  lg: 1.125,
};

const FONT_FACE_STACK: Record<FontFace, string> = {
  default: "",
  dyslexia: "'Lexend', 'Inter', ui-sans-serif, system-ui, sans-serif",
};

const applyTextSize = (size: TextSize) => {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = `${SCALE_FOR[size] * 100}%`;
};

const applyFontFace = (face: FontFace) => {
  if (typeof document === "undefined") return;
  const stack = FONT_FACE_STACK[face];
  if (stack) {
    document.documentElement.style.setProperty("--nest-font-body", stack);
  } else {
    document.documentElement.style.removeProperty("--nest-font-body");
  }
};

type PreferencesState = {
  textSize: TextSize;
  fontFace: FontFace;
  hasSeenListenHint: boolean;
  dismissedHintDate: string | null;
  setTextSize: (size: TextSize) => void;
  setFontFace: (face: FontFace) => void;
  markListenHintSeen: () => void;
  dismissHintForToday: () => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      textSize: "md",
      fontFace: "default",
      hasSeenListenHint: false,
      dismissedHintDate: null,
      setTextSize: (size) => {
        applyTextSize(size);
        set({ textSize: size });
      },
      setFontFace: (face) => {
        applyFontFace(face);
        set({ fontFace: face });
      },
      markListenHintSeen: () => set({ hasSeenListenHint: true }),
      dismissHintForToday: () =>
        set({ dismissedHintDate: new Date().toISOString().slice(0, 10) }),
    }),
    {
      name: "nest.preferences",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        textSize: s.textSize,
        fontFace: s.fontFace,
        hasSeenListenHint: s.hasSeenListenHint,
        dismissedHintDate: s.dismissedHintDate,
      }),
      migrate: (persisted, version) => {
        const p = (persisted as Partial<PreferencesState>) ?? {};
        if (version < 2) {
          return { ...p, fontFace: "default" as FontFace };
        }
        return p;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[nest.preferences] rehydrate failed:", error);
          return;
        }
        if (state) {
          applyTextSize(state.textSize);
          applyFontFace(state.fontFace);
        }
      },
    },
  ),
);
