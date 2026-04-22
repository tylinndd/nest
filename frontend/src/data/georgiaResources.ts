export type ResourceCategory =
  | "education"
  | "housing"
  | "employment"
  | "crisis"
  | "healthcare"
  | "legal"
  | "benefits";

export type Resource = {
  id: string;
  name: string;
  category: ResourceCategory;
  county: string;
  summary: string;
  eligibility: string;
  services: string[];
  contact_phone: string;
  contact_url: string;
  address: string;
  source_name: string;
  last_verified: string;
};

export const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  education: "Education",
  housing: "Housing",
  employment: "Work & training",
  crisis: "Crisis",
  healthcare: "Healthcare",
  legal: "Legal",
  benefits: "Benefits portal",
};

export const CATEGORY_ORDER: ResourceCategory[] = [
  "crisis",
  "housing",
  "healthcare",
  "education",
  "employment",
  "legal",
  "benefits",
];

export const GEORGIA_RESOURCES: Resource[] = [
  {
    id: "ascend-ksu-001",
    name: "KSU ASCEND Program",
    category: "education",
    county: "Cobb",
    summary:
      "Campus-based retention help for KSU students with foster care or homelessness experience.",
    eligibility: "KSU students with foster care or homelessness experience.",
    services: [
      "case management",
      "FAFSA navigation",
      "scholarship access",
      "peer mentoring",
    ],
    contact_phone: "470-578-5260",
    contact_url:
      "https://kennesaw.edu/student-affairs/wellbeing/care-services/ascend-program.php",
    address: "Kennesaw State University, Kennesaw and Marietta, GA",
    source_name: "KSU ASCEND",
    last_verified: "2026-04-19",
  },
  {
    id: "ksu-care-services-001",
    name: "KSU CARE Services",
    category: "housing",
    county: "Cobb",
    summary:
      "Basic needs, food, and short-term crisis support for KSU students facing housing instability.",
    eligibility: "KSU students needing basic-needs or short-term crisis support.",
    services: [
      "basic needs navigation",
      "temporary housing help",
      "food support",
      "campus referrals",
    ],
    contact_phone: "470-578-5260",
    contact_url:
      "https://kennesaw.edu/student-affairs/wellbeing/care-services/",
    address: "Kennesaw State University, Kennesaw and Marietta, GA",
    source_name: "KSU CARE Services",
    last_verified: "2026-04-19",
  },
  {
    id: "embark-campus-001",
    name: "Embark Georgia Campus Programs",
    category: "education",
    county: "statewide",
    summary:
      "Connects students with foster-care history to campus supports, scholarships, and persistence help.",
    eligibility:
      "Georgia students with foster care or homelessness experience seeking postsecondary support.",
    services: [
      "campus program matching",
      "scholarship information",
      "college persistence support",
    ],
    contact_phone: "",
    contact_url: "https://embarkgeorgia.org/home",
    address: "Georgia",
    source_name: "Embark Georgia",
    last_verified: "2026-04-19",
  },
  {
    id: "embark-etv-001",
    name: "Embark Georgia · Chafee ETV",
    category: "education",
    county: "statewide",
    summary:
      "Administers Chafee ETV funding (up to $5,000/yr) for youth with qualifying foster-care history.",
    eligibility:
      "Youth ages 18–25 with qualifying foster care history and education or training plans.",
    services: [
      "education voucher funding",
      "application guidance",
      "training support",
    ],
    contact_phone: "",
    contact_url: "https://embarkgeorgia.org/about-etv/",
    address: "Georgia",
    source_name: "Embark Georgia",
    last_verified: "2026-04-19",
  },
  {
    id: "connected-by-21-001",
    name: "Connected By 21",
    category: "housing",
    county: "statewide",
    summary:
      "Organizes statewide supports for youth aging out — housing, life skills, transition planning.",
    eligibility: "Georgia youth needing post-18 transition planning.",
    services: [
      "transition planning",
      "housing support",
      "life skills coaching",
      "education & employment navigation",
    ],
    contact_phone: "",
    contact_url: "https://dhs.georgia.gov/connected-21",
    address: "Georgia",
    source_name: "Georgia DHS",
    last_verified: "2026-04-19",
  },
  {
    id: "dfcs-youth-info-001",
    name: "Georgia DFCS Youth Information",
    category: "education",
    county: "statewide",
    summary:
      "Official DFCS hub for transition resources, youth programs, and foster-care planning supports.",
    eligibility: "Georgia youth in care or transitioning out of care.",
    services: [
      "youth program information",
      "transition resource links",
      "planning support",
    ],
    contact_phone: "",
    contact_url:
      "https://dfcs.georgia.gov/services/georgia-crew-cultivating-rising-experienced-worker/youth-information",
    address: "Georgia",
    source_name: "Georgia DFCS",
    last_verified: "2026-04-19",
  },
  {
    id: "ga-crew-001",
    name: "Georgia CREW",
    category: "employment",
    county: "statewide",
    summary:
      "Work readiness, career exposure, and employment skills program for youth in care (ages 14–21).",
    eligibility: "Georgia youth in foster care seeking workforce preparation.",
    services: [
      "career coaching",
      "job readiness training",
      "mentoring",
      "career exposure",
    ],
    contact_phone: "",
    contact_url:
      "https://dfcs.georgia.gov/services/georgia-crew-cultivating-rising-experienced-worker",
    address: "Georgia",
    source_name: "Georgia DFCS",
    last_verified: "2026-04-19",
  },
  {
    id: "snap-works-ffy-001",
    name: "SNAP Works for Former Foster Youth",
    category: "employment",
    county: "statewide",
    summary:
      "Training, credentials, and employment support for eligible former foster youth through SNAP Works.",
    eligibility:
      "Former foster youth meeting SNAP Works criteria in participating areas.",
    services: [
      "job training",
      "industry credentials",
      "employment support",
      "career pathways",
    ],
    contact_phone: "",
    contact_url: "https://dfcs.georgia.gov/snap-works-program",
    address: "Georgia",
    source_name: "Georgia DHS",
    last_verified: "2026-04-19",
  },
  {
    id: "wellroot-001",
    name: "Wellroot Family Services",
    category: "housing",
    county: "DeKalb",
    summary:
      "Transitional housing and wraparound services for youth leaving foster care.",
    eligibility: "Transition-age youth needing housing support.",
    services: [
      "transitional housing",
      "supportive services",
      "youth transition support",
    ],
    contact_phone: "",
    contact_url: "https://wellroot.org/",
    address: "1967 Lakeside Parkway, Suite 400, Tucker, GA",
    source_name: "Wellroot",
    last_verified: "2026-04-19",
  },
  {
    id: "211-ga-001",
    name: "211 Georgia",
    category: "crisis",
    county: "statewide",
    summary:
      "Dial 2-1-1 any time for housing, food, crisis, health, and community service referrals.",
    eligibility: "Anyone in Georgia needing help finding community resources.",
    services: [
      "resource navigation",
      "housing referrals",
      "food referrals",
      "crisis referrals",
    ],
    contact_phone: "211",
    contact_url: "https://211online.unitedwayatlanta.org/",
    address: "Georgia",
    source_name: "211 Georgia",
    last_verified: "2026-04-19",
  },
  {
    id: "dfcs-emergency-001",
    name: "Georgia DFCS Emergency Support",
    category: "crisis",
    county: "statewide",
    summary:
      "Emergency child welfare contacts and county-office pathways for urgent youth safety needs.",
    eligibility: "Georgia residents needing urgent child welfare or foster-care support.",
    services: [
      "emergency support",
      "child welfare reporting",
      "county office connection",
    ],
    contact_phone: "",
    contact_url: "https://dfcs.georgia.gov/",
    address: "Georgia",
    source_name: "Georgia DFCS",
    last_verified: "2026-04-19",
  },
  {
    id: "medicaid-extension-001",
    name: "Former Foster Youth Medicaid Extension",
    category: "healthcare",
    county: "statewide",
    summary:
      "Medicaid coverage through age 26 for youth who were in foster care at 18.",
    eligibility:
      "Youth in foster care at age 18 may qualify for health coverage through 26.",
    services: ["health insurance coverage", "medical access"],
    contact_phone: "",
    contact_url:
      "https://www.childwelfare.gov/resources/extension-foster-care-beyond-age-18-georgia/",
    address: "Georgia",
    source_name: "Child Welfare Information Gateway",
    last_verified: "2026-04-19",
  },
  {
    id: "eyss-001",
    name: "Extended Youth Support Services (EYSS)",
    category: "housing",
    county: "statewide",
    summary:
      "Georgia's extended foster-care pathway for youth who aged out at 18 — housing, life skills, stipends.",
    eligibility:
      "Youth who aged out at 18 and meet Georgia extended foster-care participation rules.",
    services: [
      "housing support",
      "life skills support",
      "transition assistance",
    ],
    contact_phone: "",
    contact_url:
      "https://www.childwelfare.gov/resources/extension-foster-care-beyond-age-18-georgia/",
    address: "Georgia",
    source_name: "Child Welfare Information Gateway",
    last_verified: "2026-04-19",
  },
  {
    id: "cobb-homeless-alliance-001",
    name: "Cobb Homeless Alliance",
    category: "housing",
    county: "Cobb",
    summary:
      "Coordinates housing providers and homelessness response resources across Cobb County.",
    eligibility:
      "Cobb County residents experiencing homelessness or housing instability.",
    services: [
      "housing coordination",
      "community referrals",
      "continuum of care access",
    ],
    contact_phone: "770-428-2601",
    contact_url: "https://cobbhomelessalliance.org/",
    address: "Cobb County, GA",
    source_name: "Cobb Homeless Alliance",
    last_verified: "2026-04-19",
  },
  {
    id: "must-ministries-001",
    name: "MUST Ministries",
    category: "housing",
    county: "Cobb",
    summary:
      "Emergency assistance, shelter-linked support, food, and basic-needs help in metro Atlanta.",
    eligibility: "People in crisis needing food, housing, or basic-needs help.",
    services: [
      "emergency assistance",
      "food support",
      "housing-related help",
    ],
    contact_phone: "",
    contact_url: "https://www.mustministries.org/",
    address: "Marietta, GA",
    source_name: "MUST Ministries",
    last_verified: "2026-04-19",
  },
  {
    id: "atlanta-legal-aid-cobb-001",
    name: "Atlanta Legal Aid — Cobb",
    category: "legal",
    county: "Cobb",
    summary:
      "Free civil legal help for low-income Cobb residents with housing, family, and benefits issues.",
    eligibility: "Low-income Cobb County residents with qualifying civil legal needs.",
    services: [
      "housing law help",
      "public benefits advice",
      "family law support",
    ],
    contact_phone: "",
    contact_url: "https://www.legalaidprobono.org/cobb/",
    address: "Cobb County, GA",
    source_name: "Atlanta Legal Aid",
    last_verified: "2026-04-19",
  },
  {
    id: "glsp-001",
    name: "Georgia Legal Services Program",
    category: "legal",
    county: "statewide",
    summary:
      "Civil legal help for eligible Georgians outside metro Atlanta coverage areas.",
    eligibility: "Low-income Georgians with qualifying civil legal problems.",
    services: [
      "civil legal aid",
      "benefits issues",
      "housing law help",
    ],
    contact_phone: "",
    contact_url: "https://www.glsp.org/",
    address: "Georgia",
    source_name: "Georgia Legal Services",
    last_verified: "2026-04-19",
  },
  {
    id: "georgia-gateway-001",
    name: "Georgia Gateway",
    category: "benefits",
    county: "statewide",
    summary:
      "The main online portal for Medicaid, SNAP, TANF, and other state-administered benefits.",
    eligibility: "Georgia residents applying for or managing public benefits.",
    services: [
      "benefit applications",
      "case management",
      "document upload",
      "renewal access",
    ],
    contact_phone: "877-423-4746",
    contact_url: "https://gateway.ga.gov/",
    address: "Georgia",
    source_name: "Georgia Gateway",
    last_verified: "2026-04-19",
  },
];

export const selectResourcesForCounty = (county: string): Resource[] => {
  const c = county.trim();
  if (c === "") {
    return GEORGIA_RESOURCES.filter((r) => r.county === "statewide");
  }
  return GEORGIA_RESOURCES.filter(
    (r) => r.county === "statewide" || r.county.toLowerCase() === c.toLowerCase(),
  );
};

export const groupByCategory = (
  list: Resource[],
): Partial<Record<ResourceCategory, Resource[]>> => {
  const out: Partial<Record<ResourceCategory, Resource[]>> = {};
  for (const r of list) {
    const bucket = out[r.category] ?? [];
    bucket.push(r);
    out[r.category] = bucket;
  }
  return out;
};
