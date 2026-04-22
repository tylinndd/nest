import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

type PathProgressState = {
  completed: string[];
  toggle: (zoneId: string, itemLabel: string) => void;
  isDone: (zoneId: string, itemLabel: string) => boolean;
  countForZone: (zoneId: string) => number;
  clear: () => void;
};

const keyOf = (zoneId: string, itemLabel: string) => `${zoneId}:${itemLabel}`;

export const usePathProgress = create<PathProgressState>()(
  persist(
    (set, get) => ({
      completed: [],
      toggle: (zoneId, itemLabel) =>
        set((s) => {
          const k = keyOf(zoneId, itemLabel);
          return {
            completed: s.completed.includes(k)
              ? s.completed.filter((x) => x !== k)
              : [...s.completed, k],
          };
        }),
      isDone: (zoneId, itemLabel) =>
        get().completed.includes(keyOf(zoneId, itemLabel)),
      countForZone: (zoneId) =>
        get().completed.filter((k) => k.startsWith(`${zoneId}:`)).length,
      clear: () => set({ completed: [] }),
    }),
    {
      name: "nest.pathProgress",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ completed: s.completed }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            "[nest.pathProgress] rehydrate failed, starting fresh:",
            error,
          );
        }
      },
    },
  ),
);
