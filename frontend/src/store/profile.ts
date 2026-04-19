import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EducationPlan = "college" | "trade" | "working";

export type Profile = {
  name: string;
  age: number | null;
  county: string;
  documentsHave: string[];
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
  education: null,
  housing: "",
  health: [],
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
    { name: "nest.profile" },
  ),
);

export const hasProfile = (p: Profile) => p.name.trim().length > 0;
