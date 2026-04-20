import type { BackendUserProfile } from "@/lib/api";
import type { Profile, DocumentId } from "@/store/profile";

const DOC_KEY_MAP: Record<DocumentId, readonly string[]> = {
  ssc: ["ssn_card"],
  birth: ["birth_certificate"],
  id: ["state_id", "photo_id"],
  medicaid: ["medicaid_application"],
  transcript: ["school_enrollment"],
};

const KNOWN_BACKEND_DOC_KEYS = [
  "birth_certificate",
  "ssn_card",
  "state_id",
  "immunization_records",
  "photo_id",
  "foster_care_verification",
  "school_enrollment",
  "financial_aid",
  "aged_out_letter",
  "placement_history",
  "foster_care_at_18_proof",
  "medicaid_application",
  "ksu_student_id",
] as const;

const HEALTH_SKIP = "None of these apply";
const HOUSING_UNSURE = "Unsure / something else";

const deriveCollegeIntent = (education: Profile["education"]): string | null => {
  if (education === "college") return "thinking";
  if (education === "trade") return "training";
  if (education === "working") return "not_now";
  return null;
};

const deriveTopConcerns = (p: Profile): string[] => {
  const concerns: string[] = [];
  const add = (concern: string) => {
    if (!concerns.includes(concern)) concerns.push(concern);
  };
  if (p.education === "college" || p.education === "trade") add("school");
  if (p.housing === HOUSING_UNSURE || p.housing === "") add("housing");
  if (p.health.some((h) => h !== HEALTH_SKIP)) add("health");
  return concerns;
};

const buildDocumentMap = (p: Profile): Record<string, boolean> => {
  const out: Record<string, boolean> = {};
  for (const key of KNOWN_BACKEND_DOC_KEYS) out[key] = false;
  for (const frontendKey of p.documentsHave) {
    for (const backendKey of DOC_KEY_MAP[frontendKey] ?? []) {
      out[backendKey] = true;
    }
  }
  return out;
};

export const toBackendProfile = (p: Profile): BackendUserProfile => ({
  age: p.age,
  county: p.county.trim() ? p.county.trim() : null,
  status: null,
  months_in_care: null,
  college_intent: deriveCollegeIntent(p.education),
  top_concerns: deriveTopConcerns(p),
  enrolled_at_ksu: null,
  aged_out_at_18: null,
  in_foster_care_at_18: null,
  documents: buildDocumentMap(p),
});
