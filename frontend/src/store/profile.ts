import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

export type EducationPlan = "college" | "trade" | "working";

export const DOCUMENT_IDS = [
  "ssc",
  "birth",
  "id",
  "medicaid",
  "transcript",
] as const;
export type DocumentId = (typeof DOCUMENT_IDS)[number];

export const HOUSING_OPTIONS = [
  "Foster home",
  "Group home",
  "Independent living program",
  "With a relative",
  "Unsure / something else",
] as const;
export type HousingOption = (typeof HOUSING_OPTIONS)[number];

export const HEALTH_OPTIONS = [
  "I have Medicaid right now",
  "I take prescriptions",
  "I see a therapist or counselor",
  "I need a primary care doctor",
  "None of these apply",
] as const;
export type HealthFlag = (typeof HEALTH_OPTIONS)[number];

export type TrustedAdult = { name: string; phone: string };

export type Profile = {
  name: string;
  age: number | null;
  county: string;
  documentsHave: DocumentId[];
  uploadedDocs: DocumentId[];
  education: EducationPlan | null;
  housing: HousingOption | "";
  health: HealthFlag[];
  completedTaskIds: string[];
  trustedAdult: TrustedAdult | null;
};

type ProfileActions = {
  setName: (name: string) => void;
  setAge: (age: number | null) => void;
  setCounty: (county: string) => void;
  setDocuments: (docs: DocumentId[]) => void;
  toggleDocument: (id: DocumentId) => void;
  markUploaded: (id: DocumentId) => void;
  unmarkUploaded: (id: DocumentId) => void;
  setEducation: (choice: EducationPlan) => void;
  setHousing: (housing: HousingOption) => void;
  setHealth: (items: HealthFlag[]) => void;
  toggleHealth: (option: HealthFlag) => void;
  markTaskDone: (id: string) => void;
  setTrustedAdult: (value: TrustedAdult | null) => void;
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
  completedTaskIds: [],
  trustedAdult: null,
};

const DOCUMENT_ID_SET = new Set<string>(DOCUMENT_IDS);
const HOUSING_SET = new Set<string>(HOUSING_OPTIONS);
const HEALTH_SET = new Set<string>(HEALTH_OPTIONS);

const sanitizeDocs = (value: unknown): DocumentId[] =>
  Array.isArray(value)
    ? (value.filter(
        (v): v is DocumentId => typeof v === "string" && DOCUMENT_ID_SET.has(v),
      ) as DocumentId[])
    : [];

const sanitizeHealth = (value: unknown): HealthFlag[] =>
  Array.isArray(value)
    ? (value.filter(
        (v): v is HealthFlag => typeof v === "string" && HEALTH_SET.has(v),
      ) as HealthFlag[])
    : [];

const sanitizeHousing = (value: unknown): HousingOption | "" =>
  typeof value === "string" && HOUSING_SET.has(value)
    ? (value as HousingOption)
    : "";

const sanitizeStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const sanitizeTrustedAdult = (value: unknown): TrustedAdult | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  if (!name || !phone) return null;
  return { name, phone };
};

export const migrateProfile = (persisted: unknown): Profile => {
  const base = (persisted ?? {}) as Record<string, unknown>;
  return {
    ...emptyProfile,
    name: typeof base.name === "string" ? base.name : "",
    age: typeof base.age === "number" ? base.age : null,
    county: typeof base.county === "string" ? base.county : "",
    documentsHave: sanitizeDocs(base.documentsHave),
    uploadedDocs: sanitizeDocs(base.uploadedDocs),
    education:
      base.education === "college" ||
      base.education === "trade" ||
      base.education === "working"
        ? base.education
        : null,
    housing: sanitizeHousing(base.housing),
    health: sanitizeHealth(base.health),
    completedTaskIds: sanitizeStringArray(base.completedTaskIds),
    trustedAdult: sanitizeTrustedAdult(base.trustedAdult),
  };
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
      markTaskDone: (id) =>
        set((s) =>
          s.completedTaskIds.includes(id)
            ? s
            : { completedTaskIds: [...s.completedTaskIds, id] },
        ),
      setTrustedAdult: (value) =>
        set({ trustedAdult: sanitizeTrustedAdult(value) }),
      reset: () => set({ ...emptyProfile }),
    }),
    {
      name: "nest.profile",
      version: 5,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persisted) => migrateProfile(persisted),
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
