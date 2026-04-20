import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

export type EducationPlan = "college" | "trade" | "working";

export type Profile = {
  name: string;
  age: number | null;
  county: string;
  documentsHave: string[];
  uploadedDocs: string[];
  education: EducationPlan | null;
  housing: string;
  health: string[];
};

type ProfileActions = {
  setName: (name: string) => void;
  setAge: (age: number | null) => void;
  setCounty: (county: string) => void;
  setDocuments: (docs: string[]) => void;
  toggleDocument: (id: string) => void;
  markUploaded: (id: string) => void;
  unmarkUploaded: (id: string) => void;
  setEducation: (choice: EducationPlan) => void;
  setHousing: (housing: string) => void;
  setHealth: (items: string[]) => void;
  toggleHealth: (option: string) => void;
  reset: () => void;
};

const emptyProfile: Profile = {
  name: "",
  age: null,
  county: "",
  documentsHave: [],
  uploadedDocs: [],
  education: null,
  housing: "",
  health: [],
};

const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn("[nest.profile] read failed:", err);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(
        "[nest.profile] write failed — answers will not persist this session:",
        err,
      );
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("[nest.profile] remove failed:", err);
    }
  },
};

export const useProfile = create<Profile & ProfileActions>()(
  persist(
    (set) => ({
      ...emptyProfile,
      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setCounty: (county) => set({ county }),
      setDocuments: (documentsHave) => set({ documentsHave }),
      toggleDocument: (id) =>
        set((s) => ({
          documentsHave: s.documentsHave.includes(id)
            ? s.documentsHave.filter((x) => x !== id)
            : [...s.documentsHave, id],
        })),
      markUploaded: (id) =>
        set((s) => ({
          uploadedDocs: s.uploadedDocs.includes(id)
            ? s.uploadedDocs
            : [...s.uploadedDocs, id],
        })),
      unmarkUploaded: (id) =>
        set((s) => ({
          uploadedDocs: s.uploadedDocs.filter((x) => x !== id),
        })),
      setEducation: (education) => set({ education }),
      setHousing: (housing) => set({ housing }),
      setHealth: (health) => set({ health }),
      toggleHealth: (option) =>
        set((s) => ({
          health: s.health.includes(option)
            ? s.health.filter((x) => x !== option)
            : [...s.health, option],
        })),
      reset: () => set({ ...emptyProfile }),
    }),
    {
      name: "nest.profile",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persisted, version) => {
        const base = (persisted ?? {}) as Partial<Profile>;
        if (version < 2) {
          return { ...emptyProfile, ...base, uploadedDocs: base.uploadedDocs ?? [] };
        }
        return base as Profile;
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            "[nest.profile] rehydrate failed, starting fresh:",
            error,
          );
        }
      },
    },
  ),
);

export const hasProfile = (p: Profile) => p.name.trim().length > 0;
