export const user = {
  name: "Maria",
  age: 18,
  county: "Cobb County",
  daysUntilExit: 90,
};

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

export const tasks: Task[] = [
  {
    id: "1",
    title: "Request your birth certificate",
    due: "Due 3 days ago",
    status: "overdue",
    help: "Help me do this",
    tone: "coral",
    guide: {
      subtitle: "Georgia walkthrough · confirm specifics with your caseworker.",
      source: "Georgia DPH · Vital Records",
      steps: [
        "Ask your DFCS caseworker for the foster-care fee-waiver letter.",
        "Apply online at gachildsupport.com or visit a Vital Records office.",
        "Upload your photo ID plus the waiver letter with the request.",
        "Expect delivery in 5–10 business days.",
      ],
    },
  },
  {
    id: "2",
    title: "Apply for extended Medicaid (former foster youth)",
    due: "Due last week",
    status: "overdue",
    help: "Help me do this",
    tone: "coral",
    guide: {
      subtitle: "Automatic coverage up to age 26 if you aged out in Georgia.",
      source: "Georgia Medicaid · Title IV-E",
      steps: [
        "Confirm you aged out of Georgia foster care at or after 18.",
        "Call the Georgia Gateway helpline at 877-423-4746 if your card hasn't arrived.",
        "Ask for your Former Foster Care member ID for proof of coverage.",
        "No yearly renewal — coverage runs automatically until age 26.",
      ],
    },
  },
  {
    id: "3",
    title: "Submit Chafee ETV application for fall semester",
    due: "Due Friday",
    status: "week",
    help: "Help me do this",
    tone: "amber",
    guide: {
      subtitle: "Up to $5,000 per academic year through age 26.",
      source: "Georgia DFCS · Chafee ETV",
      steps: [
        "Submit the ETV application through your DFCS worker or ILP coordinator.",
        "Attach proof of enrollment — class schedule or acceptance letter.",
        "Use funds for tuition, books, housing, or transportation.",
        "Reapply each semester until age 26.",
      ],
    },
  },
  {
    id: "4",
    title: "Schedule KSU ASCEND intake call",
    due: "Due Sunday",
    status: "week",
    help: "Help me do this",
    tone: "amber",
    guide: {
      subtitle: "Year-round housing, books, and a personal coach at Kennesaw State.",
      source: "Kennesaw State University · ASCEND",
      steps: [
        "Email ascend@kennesaw.edu or call 470-578-5260 to request an intake.",
        "Intake is about 30 minutes, in person or on Zoom.",
        "Bring your foster-care documentation if you have it.",
        "Program covers housing, books, and a personal coach year-round.",
      ],
    },
  },
  { id: "5", title: "Open a checking account", due: "Completed", status: "done", tone: "sage" },
  { id: "6", title: "Upload Social Security card to Vault", due: "Completed", status: "done", tone: "sage" },
];

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
    id: "hb136",
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
    id: "wellroot",
    name: "Wellroot Family Services",
    number: "(404) 876-6878",
    subtitle: "GA youth crisis · transitional housing",
    kind: "call" as const,
  },
];
