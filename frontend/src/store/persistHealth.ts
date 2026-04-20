import { create } from "zustand";

type PersistHealthState = {
  healthy: boolean;
  markFailed: () => void;
  markOk: () => void;
};

export const usePersistHealth = create<PersistHealthState>((set, get) => ({
  healthy: true,
  markFailed: () => {
    if (get().healthy) set({ healthy: false });
  },
  markOk: () => {
    if (!get().healthy) set({ healthy: true });
  },
}));
