import type { Profile } from "@/store/profile";

export type DemoPersona = "maria" | "marcus" | "jade";

export const DEMO_PERSONAS = ["maria", "marcus", "jade"] as const;

export const isDemoPersona = (value: string | null): value is DemoPersona =>
  value !== null && (DEMO_PERSONAS as readonly string[]).includes(value);

export const DEMO_SESSION_KEY = "nest.demo.persona";

export const PERSONA_LABELS: Record<DemoPersona, string> = {
  maria: "Maria · aging out",
  marcus: "Marcus · planning ahead",
  jade: "Jade · aged out",
};

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
  trustedAdult: { name: "Ms. Carter · caseworker", phone: "(470) 555-0198" },
};

export const marcusProfile: Profile = {
  name: "Marcus",
  age: 17,
  county: "Fulton",
  documentsHave: [],
  uploadedDocs: [],
  education: "college",
  housing: "Foster home",
  health: ["I have Medicaid right now"],
  completedTaskIds: [],
  trustedAdult: null,
};

export const jadeProfile: Profile = {
  name: "Jade",
  age: 22,
  county: "DeKalb",
  documentsHave: ["ssc", "birth", "id", "medicaid", "transcript"],
  uploadedDocs: ["ssc", "birth", "id", "medicaid"],
  education: "working",
  housing: "Independent living program",
  health: ["I have Medicaid right now", "I take prescriptions"],
  completedTaskIds: [],
  trustedAdult: { name: "Dee · Embark mentor", phone: "(706) 555-0147" },
};

export const profileFor = (persona: DemoPersona): Profile => {
  switch (persona) {
    case "maria":
      return marianProfile;
    case "marcus":
      return marcusProfile;
    case "jade":
      return jadeProfile;
  }
};
