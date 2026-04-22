import type { Profile } from "@/store/profile";

const hasCoreDocs = (p: Profile) =>
  p.documentsHave.includes("ssc") && p.documentsHave.includes("id");

const hasMedicaidNow = (p: Profile) =>
  p.health.includes("I have Medicaid right now");

const pickHousingChip = (p: Profile): string => {
  const hasCounty = p.county.trim().length > 0;
  if (!p.housing || p.housing === "Unsure / something else") {
    return hasCounty
      ? `Where can I live in ${p.county} County when I age out?`
      : "Where can I live when I age out?";
  }
  if (p.housing === "Group home" || p.housing === "Foster home") {
    return "What happens to my housing when I turn 18?";
  }
  if (p.housing === "Independent living program") {
    return "How do I stay in the Independent Living Program longer?";
  }
  if (p.housing === "With a relative") {
    return "What if living with my relative stops working?";
  }
  return hasCounty
    ? `Emergency shelter options in ${p.county} County tonight`
    : "I might be couch-surfing this weekend";
};

const pickPracticalChip = (p: Profile): string => {
  if (p.age !== null && p.age < 18) {
    return "What should I be doing before I turn 18?";
  }
  if (!hasCoreDocs(p)) {
    return "How do I replace my Social Security card?";
  }
  if (p.education === "college") {
    return "What docs do I need for KSU ASCEND?";
  }
  if (p.education === "trade") {
    return "How do I apply for Georgia trade school aid?";
  }
  if (p.education === "working") {
    return "How do I prove aged-out status to an employer?";
  }
  if (!p.documentsHave.includes("birth")) {
    return "How do I get my birth certificate?";
  }
  return "What docs do I need before I age out?";
};

const pickFutureChip = (p: Profile): string => {
  if (p.age !== null && p.age >= 21) {
    return "How do I keep Medicaid at 22?";
  }
  if (p.age !== null && p.age < 18) {
    return "What benefits am I eligible for when I age out?";
  }
  if (hasMedicaidNow(p)) {
    return "Can I keep Medicaid after I turn 18?";
  }
  return "What benefits am I eligible for as a former foster youth?";
};

export const pickStarterChips = (p: Profile): string[] => [
  pickHousingChip(p),
  pickPracticalChip(p),
  pickFutureChip(p),
];
