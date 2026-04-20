export type TaskGuide = {
  subtitle: string;
  source: string;
  steps: string[];
};

export type Task = {
  id: string;
  title: string;
  due: string;
  status: "overdue" | "week" | "done";
  help?: string;
  tone?: "coral" | "amber" | "sage";
  guide?: TaskGuide;
};

export type BenefitStatus = "qualify" | "action" | "auto";

export type Benefit = {
  id: string;
  title: string;
  eligibility: string;
  summary: string;
  source: string;
  status: BenefitStatus;
  cta?: string;
  href?: string;
  verifiedOn?: string;
};

export const benefits: Benefit[] = [
  {
    id: "chafee-etv",
    title: "Chafee Education & Training Voucher",
    eligibility: "Up to $5,000 per academic year through age 26",
    summary: "Pays for tuition, books, housing, and transportation while you're enrolled in post-secondary school or training.",
    source: "Georgia DFCS · Chafee Program",
    status: "qualify",
    cta: "Start application",
    href: "https://dfcs.georgia.gov/education-and-training",
    verifiedOn: "2026-04-19",
  },
  {
    id: "eyss",
    title: "Extended Youth Support Services (EYSS)",
    eligibility: "Ages 18–23 who were in foster care at 18",
    summary: "Continued case management, a monthly stipend, and support for housing, school, and work goals.",
    source: "Georgia DHS · Connected By 21",
    status: "qualify",
    cta: "Open Connected By 21",
    href: "https://dhs.georgia.gov/connected-21",
    verifiedOn: "2026-04-19",
  },
  {
    id: "medicaid-ext",
    title: "Georgia Medicaid — Former Foster Care",
    eligibility: "Automatic coverage until age 26",
    summary: "Free health insurance if you aged out of Georgia foster care. No income limit.",
    source: "Georgia Gateway · Title IV-E",
    status: "auto",
    cta: "Open Gateway",
    href: "https://gateway.ga.gov/access/",
    verifiedOn: "2026-04-19",
  },
  {
    id: "ksu-ascend",
    title: "KSU ASCEND Program",
    eligibility: "Foster, former foster, and unstably housed students",
    summary: "Year-round housing, textbooks, personal coach, and a care team at Kennesaw State.",
    source: "Kennesaw State · CARE Services",
    status: "action",
    cta: "Book intake call",
    href: "https://campus.kennesaw.edu/current-students/student-affairs/wellbeing/care-services/ascend-program.php",
    verifiedOn: "2026-04-19",
  },
  {
    id: "hud-fyi",
    title: "HUD Foster Youth to Independence (FYI)",
    eligibility: "Ages 18–24, aged out within 5 years",
    summary: "Up to 36 months of rental assistance paired with support services through your local PHA.",
    source: "HUD · FYI Voucher",
    status: "action",
    cta: "See how to apply",
    href: "https://www.hud.gov/hud-partners/public-indian-housing-fyi",
    verifiedOn: "2026-04-19",
  },
  {
    id: "tuition-waiver",
    title: "Georgia Post-Secondary Tuition Waiver",
    eligibility: "Georgia foster youth under 28 at eligible public institutions",
    summary: "Waives tuition and fees at TCSG technical colleges and eligible University System schools.",
    source: "Georgia DFCS · Tuition Waiver",
    status: "qualify",
    cta: "Open application",
    href: "https://dfcs.georgia.gov/form/postsecondary-tuition-waiver-app",
    verifiedOn: "2026-04-19",
  },
];

export const buildChatSeed = (name: string) => {
  const first = name.trim().split(/\s+/)[0];
  const greeting = first ? `Hey ${first}.` : "Hey.";
  return [
    {
      role: "assistant" as const,
      text: `${greeting} I can help with housing, benefits, school, or your next step.`,
    },
  ];
};

export const hotlines = [
  {
    id: "988",
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    subtitle: "Call or text, 24/7",
    kind: "call" as const,
  },
  {
    id: "211",
    name: "211 Georgia",
    number: "211",
    subtitle: "Shelter, food, utilities · 24/7",
    kind: "call" as const,
  },
  {
    id: "crisis-text",
    name: "Crisis Text Line",
    number: "741741",
    subtitle: "Text HOME to 741741",
    kind: "text" as const,
  },
  {
    id: "gcal",
    name: "Georgia Crisis & Access Line",
    number: "1-800-715-4225",
    subtitle: "Mental health & substance use · 24/7",
    kind: "call" as const,
  },
];
