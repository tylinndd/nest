import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

type State = {
  visits: number;
  dismissed: boolean;
  increment: () => void;
  dismiss: () => void;
  reset: () => void;
};

export const useInstallPrompt = create<State>()(
  persist(
    (set) => ({
      visits: 0,
      dismissed: false,
      increment: () => set((s) => ({ visits: s.visits + 1 })),
      dismiss: () => set({ dismissed: true }),
      reset: () => set({ visits: 0, dismissed: false }),
    }),
    {
      name: "nest.installPrompt",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ visits: s.visits, dismissed: s.dismissed }),
    },
  ),
);
