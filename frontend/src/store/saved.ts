import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";
import type { Passage } from "@/lib/api";

export type SavedAnswer = {
  id: string;
  answer: string;
  source?: string;
  question?: string;
  savedAt: number;
  passages?: Passage[];
};

export const SAVED_CAP = 50;

type SavedState = {
  items: SavedAnswer[];
  add: (item: SavedAnswer) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useSaved = create<SavedState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          if (s.items.some((x) => x.id === item.id)) return s;
          const next = [item, ...s.items];
          return { items: next.length > SAVED_CAP ? next.slice(0, SAVED_CAP) : next };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "nest.saved",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            "[nest.saved] rehydrate failed, starting fresh:",
            error,
          );
        }
      },
    },
  ),
);
