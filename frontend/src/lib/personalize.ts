import type { DocumentId, Profile } from "@/store/profile";
import { type Task } from "@/data/placeholder";

export const DOCUMENT_CATALOG: Array<{
  id: DocumentId;
  title: string;
  requestedDetail: string;
  missingDetail: string;
}> = [
  {
    id: "ssc",
    title: "Social Security card",
    requestedDetail: "Replacement requested",
    missingDetail: "Free — start with your caseworker",
  },
  {
    id: "birth",
    title: "Birth certificate",
    requestedDetail: "Vital Records request filed",
    missingDetail: "Ask DFCS for the fee-waiver letter",
  },
  {
    id: "id",
    title: "Georgia state ID",
    requestedDetail: "Waiting on DDS appointment",
    missingDetail: "$32 fee waived for foster youth",
  },
  {
    id: "medicaid",
    title: "Medicaid card",
    requestedDetail: "Reissue requested",
    missingDetail: "Call 877-423-4746 to reissue",
  },
  {
    id: "transcript",
    title: "High school transcript",
    requestedDetail: "Request filed with counselor",
    missingDetail: "Ask your school's registrar",
  },
];

export type VaultDocState = "uploaded" | "haveNotSecured" | "needToGet";

export type VaultDoc = {
  id: DocumentId;
  title: string;
  state: VaultDocState;
};

const CATALOG_BY_ID = Object.fromEntries(
  DOCUMENT_CATALOG.map((entry) => [entry.id, entry]),
) as Record<DocumentId, (typeof DOCUMENT_CATALOG)[number]>;

export const describeVaultDoc = (doc: VaultDoc): string => {
  switch (doc.state) {
    case "uploaded":
      return "Secured in your vault";
    case "haveNotSecured":
      return "You have this — add a photo to secure it";
    case "needToGet":
      return CATALOG_BY_ID[doc.id].missingDetail;
  }
};

export const derivePersonalizedVault = (profile: Profile): VaultDoc[] => {
  const have = new Set(profile.documentsHave);
  const uploaded = new Set(profile.uploadedDocs);
  return DOCUMENT_CATALOG.map(
    (entry): VaultDoc => ({
      id: entry.id,
      title: entry.title,
      state: uploaded.has(entry.id)
        ? "uploaded"
        : have.has(entry.id)
          ? "haveNotSecured"
          : "needToGet",
    }),
  );
};

const documentTaskGuides: Record<string, Task["guide"]> = {
  "doc-birth": {
    subtitle: "Georgia walkthrough · confirm specifics with your caseworker.",
    source: "Georgia DPH · Vital Records",
    steps: [
      "Ask your DFCS caseworker for the foster-care fee-waiver letter.",
      "Apply online at gachildsupport.com or visit a Vital Records office.",
      "Upload your photo ID plus the waiver letter with the request.",
      "Expect delivery in 5–10 business days.",
    ],
  },
  "doc-ssc": {
    subtitle: "Replacing a Social Security card is free.",
    source: "SSA · Form SS-5",
    steps: [
      "Have your DFCS caseworker verify your identity if you don't have a photo ID yet.",
      "Complete Form SS-5 (Application for a Social Security Card).",
      "Submit in person at your local SSA office with original proof docs.",
      "Card arrives in 10–14 business days.",
    ],
  },
  "doc-id": {
    subtitle: "Fee is waived for Georgia foster youth.",
    source: "Georgia DDS · Customer Service Center",
    steps: [
      "Ask DFCS for the foster-youth fee-waiver voucher.",
      "Book an appointment at a DDS Customer Service Center.",
      "Bring your Social Security card + birth certificate + waiver voucher.",
      "ID arrives by mail in 10–15 business days.",
    ],
  },
  "doc-medicaid": {
    subtitle: "Reissuing your card is free and fast.",
    source: "Georgia Gateway · Member Services",
    steps: [
      "Call 877-423-4746 (Georgia Gateway helpline).",
      "Ask for a reissued Former Foster Care Medicaid card.",
      "Verify your address — the card mails within 7–10 days.",
      "Download the Peach State Health Plan app for a digital copy.",
    ],
  },
  "doc-transcript": {
    subtitle: "Official transcripts cost $5–$10; foster youth may qualify for waivers.",
    source: "Your school registrar",
    steps: [
      "Contact your high school's registrar or guidance office.",
      "Ask whether your DFCS letter qualifies you for a fee waiver.",
      "Request an official sealed transcript.",
      "Most schools deliver electronically within 3–5 business days.",
    ],
  },
  "medicaid-extended": {
    subtitle: "Automatic coverage up to age 26 if you aged out in Georgia.",
    source: "Georgia Medicaid · Title IV-E",
    steps: [
      "Confirm you aged out of Georgia foster care at or after 18.",
      "Call the Georgia Gateway helpline at 877-423-4746 if your card hasn't arrived.",
      "Ask for your Former Foster Care member ID for proof of coverage.",
      "No yearly renewal — coverage runs automatically until age 26.",
    ],
  },
  "chafee-etv": {
    subtitle: "Up to $5,000 per academic year through age 26.",
    source: "Georgia DFCS · Chafee ETV",
    steps: [
      "Submit the ETV application through your DFCS worker or ILP coordinator.",
      "Attach proof of enrollment — class schedule or acceptance letter.",
      "Use funds for tuition, books, housing, or transportation.",
      "Reapply each semester until age 26.",
    ],
  },
  "ksu-ascend": {
    subtitle: "Year-round housing, books, and a personal coach at Kennesaw State.",
    source: "Kennesaw State University · ASCEND",
    steps: [
      "Email careservices@kennesaw.edu or call 470-578-6777 to request an intake.",
      "Intake is about 30 minutes, in person or on Zoom.",
      "Bring your foster-care documentation if you have it.",
      "Program covers housing, books, and a personal coach year-round.",
    ],
  },
  "tuition-waiver": {
    subtitle: "Covers tuition + fees at eligible TCSG and USG schools.",
    source: "Georgia DFCS · Post-Secondary Tuition Waiver",
    steps: [
      "Complete the FAFSA first — required for the waiver.",
      "Submit the Post-Secondary Tuition Waiver application on dfcs.georgia.gov.",
      "Attach proof of foster-care history (DFCS letter).",
      "Renew each academic year until age 28.",
    ],
  },
  "hud-fyi": {
    subtitle: "Start housing coordination 180 days before aging out.",
    source: "HUD · FYI Voucher",
    steps: [
      "Ask your DFCS worker to submit the FYI request to your local PHA.",
      "PHA and DFCS coordinate directly — you don't apply yourself.",
      "Prepare a short transition plan: where you'll live + support network.",
      "Voucher runs up to 36 months with wraparound services.",
    ],
  },
  "transitional-housing": {
    subtitle: "Tour before you have to move — options run out fast.",
    source: "Georgia DFCS · Transitional Living",
    steps: [
      "Ask your DFCS worker for a list of approved TLP providers in your county.",
      "Tour at least two before deciding.",
      "Confirm they accept Chafee + Medicaid payments.",
      "Lock your bed-date in writing before your aging-out day.",
    ],
  },
  "find-pcp": {
    subtitle: "Your Former Foster Medicaid is accepted everywhere in-state.",
    source: "Georgia Medicaid · Provider Directory",
    steps: [
      "Use the Peach State or Amerigroup app to search for in-network PCPs.",
      "Filter by your county and pediatric or adult primary care.",
      "Call to confirm they accept new Former Foster patients.",
      "Book a well-visit within 30 days.",
    ],
  },
};

const buildTask = (
  id: string,
  title: string,
  due: string,
  status: Task["status"],
  tone: Task["tone"],
  help = "Help me do this",
): Task => {
  const guide = documentTaskGuides[id];
  return {
    id,
    title,
    due,
    status,
    ...(tone ? { tone } : {}),
    ...(status === "done" ? {} : { help }),
    ...(guide ? { guide } : {}),
  };
};

export const derivePersonalizedTasks = (profile: Profile): Task[] => {
  const derived: Task[] = [];
  const have = new Set(profile.documentsHave);
  const health = new Set(profile.health);
  const completed = new Set(profile.completedTaskIds);
  const age = profile.age ?? 0;

  if (!have.has("birth")) {
    derived.push(buildTask("doc-birth", "Request your birth certificate", "Start this first", "overdue", "coral"));
  }
  if (!have.has("ssc")) {
    derived.push(buildTask("doc-ssc", "Replace your Social Security card", "Free — start with caseworker", "overdue", "coral"));
  }

  if (!health.has("I have Medicaid right now") && age >= 17) {
    const overdue = age >= 18;
    derived.push(
      buildTask(
        "medicaid-extended",
        "Apply for extended Medicaid (former foster)",
        overdue ? "Due last week" : "Start before your birthday",
        overdue ? "overdue" : "week",
        overdue ? "coral" : "amber",
      ),
    );
  }

  if (!have.has("id")) {
    derived.push(buildTask("doc-id", "Get your Georgia state ID", "Due this week", "week", "amber"));
  }
  if (!have.has("transcript")) {
    derived.push(buildTask("doc-transcript", "Request your high school transcript", "Due this week", "week", "amber"));
  }

  if (profile.education === "college") {
    derived.push(buildTask("chafee-etv", "Submit Chafee ETV application", "Due Friday", "week", "amber"));
    derived.push(buildTask("ksu-ascend", "Schedule KSU ASCEND intake call", "Due Sunday", "week", "amber"));
  } else if (profile.education === "trade") {
    derived.push(buildTask("tuition-waiver", "Submit Post-Secondary Tuition Waiver", "Due this week", "week", "amber"));
  }

  if (age >= 18 && (profile.housing === "Foster home" || profile.housing === "Group home")) {
    derived.push(buildTask("hud-fyi", "Start HUD FYI voucher coordination", "Start 180 days before aging out", "week", "amber"));
  }
  if (profile.housing === "Unsure / something else") {
    derived.push(buildTask("transitional-housing", "Tour a transitional living program", "Due this week", "week", "amber"));
  }

  if (health.has("I need a primary care doctor")) {
    derived.push(buildTask("find-pcp", "Find a primary care doctor", "Due this week", "week", "amber"));
  }

  return derived.map((task) => {
    if (!completed.has(task.id)) return task;
    const { help: _unused, ...rest } = task;
    void _unused;
    return { ...rest, status: "done" as const, tone: "sage" as const, due: "Completed" };
  });
};

export const computeDaysUntilAgeOut = (age: number | null): number | null => {
  if (age === null) return null;
  if (age >= 21) return 0;
  if (age >= 18) return (21 - age) * 365;
  return (18 - age) * 365;
};

export const getTaskRationale = (
  taskId: string,
  profile: Profile,
): string | null => {
  const age = profile.age ?? 0;
  const housing = profile.housing;

  switch (taskId) {
    case "doc-birth":
      return "You told us you don't have your birth certificate yet.";
    case "doc-ssc":
      return "You told us you don't have your Social Security card yet.";
    case "doc-id":
      return "You told us you don't have your Georgia state ID yet.";
    case "doc-transcript":
      return "You told us you haven't pulled your high school transcript yet.";
    case "doc-medicaid":
      return "You told us you don't have your Medicaid card on hand yet.";
    case "medicaid-extended":
      return age >= 18
        ? `You're ${age} and you said you don't have Medicaid — former-foster Medicaid covers you until 26.`
        : "Extended Medicaid has to be filed before you age out, so Nest surfaces it early.";
    case "chafee-etv":
      return "You said college is on your plan — Chafee ETV pays up to $5,000 per year.";
    case "ksu-ascend":
      return "You said college is on your plan — ASCEND is KSU's care team for foster youth.";
    case "tuition-waiver":
      return "You said trade school is on your plan — Georgia waives fees at TCSG colleges.";
    case "hud-fyi":
      return age >= 18 && (housing === "Foster home" || housing === "Group home")
        ? `You're ${age} and living in a ${housing.toLowerCase()} — FYI vouchers take 180 days to start.`
        : "FYI vouchers take 180 days to start, so Nest surfaces this early.";
    case "transitional-housing":
      return "You said housing after aging out is unsettled — a TLP tour is a free option worth seeing.";
    case "find-pcp":
      return "You said you need a primary care doctor.";
    default:
      return null;
  }
};
