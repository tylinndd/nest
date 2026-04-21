import type { Profile } from "@/store/profile";

export type DemoPersona = "maria";

export const DEMO_PERSONAS = ["maria"] as const;

export const isDemoPersona = (value: string | null): value is DemoPersona =>
  value !== null && (DEMO_PERSONAS as readonly string[]).includes(value);

export const marianProfile: Profile = {
  name: "Maria",
  age: 18,
  county: "Cobb",
  documentsHave: ["ssc", "id", "medicaid"],
  uploadedDocs: ["ssc", "id"],
  education: "college",
  housing: "Group home",
  health: ["I have Medicaid right now"],
  completedTaskIds: [],
};

export const profileFor = (persona: DemoPersona): Profile => {
  switch (persona) {
    case "maria":
      return marianProfile;
  }
};
