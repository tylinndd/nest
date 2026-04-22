export type GlossaryEntry = {
  term: string;
  expansion: string;
  definition: string;
  source?: string;
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
  DFCS: {
    term: "DFCS",
    expansion: "Division of Family and Children Services",
    definition:
      "Georgia's child welfare agency — part of DHS. DFCS runs foster care, adoption, and child protective services in Georgia.",
    source: "Georgia DHS",
  },
  ILP: {
    term: "ILP",
    expansion: "Independent Living Program",
    definition:
      "Programs and services that help older youth in foster care build life skills, find housing, and transition to adulthood.",
    source: "Georgia DFCS · Chafee",
  },
  EYSS: {
    term: "EYSS",
    expansion: "Extended Youth Support Services",
    definition:
      "Georgia's extended foster-care pathway for eligible youth who aged out at 18 — ongoing case management, housing, and stipend support up to age 23.",
    source: "Georgia DFCS",
  },
  ETV: {
    term: "ETV",
    expansion: "Education and Training Voucher",
    definition:
      "Federal Chafee funding (up to $5,000/year) for post-secondary school — tuition, books, housing, and related costs for eligible foster youth.",
    source: "John H. Chafee program · Embark Georgia",
  },
  "Chafee-ETV": {
    term: "Chafee-ETV",
    expansion: "John H. Chafee ETV",
    definition:
      "Federal grant program funding up to $5,000/year in education supports for current or former foster youth pursuing college or vocational training.",
    source: "John H. Chafee program · Embark Georgia",
  },
  Chafee: {
    term: "Chafee",
    expansion: "John H. Chafee Foster Care Program",
    definition:
      "Federal program funding state services for youth transitioning out of foster care — housing, education, life skills, and the ETV.",
    source: "Federal Chafee program",
  },
  FYI: {
    term: "FYI",
    expansion: "Foster Youth to Independence",
    definition:
      "HUD housing voucher program providing rental assistance for foster youth ages 18–24 at risk of homelessness.",
    source: "U.S. HUD",
  },
  HUD: {
    term: "HUD",
    expansion: "Housing and Urban Development",
    definition: "The U.S. federal agency that funds housing assistance programs, including the FYI voucher.",
    source: "U.S. Department of Housing and Urban Development",
  },
  PCP: {
    term: "PCP",
    expansion: "Primary Care Provider",
    definition:
      "Your main doctor — they handle checkups, referrals, and ongoing care. You'll want one that takes Medicaid.",
  },
  SSN: {
    term: "SSN",
    expansion: "Social Security Number",
    definition:
      "The 9-digit number on your Social Security card. You'll need it for jobs, school aid, and most benefits.",
  },
  SSA: {
    term: "SSA",
    expansion: "Social Security Administration",
    definition: "The federal agency that issues SSNs and runs retirement, disability, and survivor benefits.",
  },
  FAFSA: {
    term: "FAFSA",
    expansion: "Free Application for Federal Student Aid",
    definition:
      "The form that unlocks Pell Grants, federal loans, and most scholarships. Foster youth are considered independent — you don't need parent info.",
    source: "U.S. Department of Education",
  },
  TANF: {
    term: "TANF",
    expansion: "Temporary Assistance for Needy Families",
    definition:
      "Federal cash assistance for low-income families with children, administered by Georgia DFCS.",
  },
  SNAP: {
    term: "SNAP",
    expansion: "Supplemental Nutrition Assistance Program",
    definition: "Monthly food benefits loaded on an EBT card. Also called food stamps.",
  },
  GED: {
    term: "GED",
    expansion: "General Educational Development",
    definition: "A high school equivalency credential accepted by most colleges and employers.",
  },
  "KSU ASCEND": {
    term: "KSU ASCEND",
    expansion: "Kennesaw State University ASCEND",
    definition:
      "KSU's support program for students with foster-care backgrounds — mentoring, housing guidance, and financial aid navigation.",
    source: "Kennesaw State University",
  },
  DPH: {
    term: "DPH",
    expansion: "Georgia Department of Public Health",
    definition:
      "Georgia's public health agency. Their Vital Records office issues birth certificates, death certificates, and other state records — this is where you replace a lost birth certificate.",
    source: "Georgia DPH · Vital Records",
  },
  DHS: {
    term: "DHS",
    expansion: "Georgia Department of Human Services",
    definition:
      "The state agency that houses DFCS (foster care), DFCS is one of its divisions. DHS also runs aging services and child support enforcement.",
    source: "Georgia DHS",
  },
  Medicaid: {
    term: "Medicaid",
    expansion: "Medicaid",
    definition:
      "Government health coverage for low-income people. Foster youth keep Medicaid until age 26 under the 'Former Foster Care' category — no income cap, no re-application.",
    source: "Georgia Medicaid · ACA §2004",
  },
  "Pell Grant": {
    term: "Pell Grant",
    expansion: "Federal Pell Grant",
    definition:
      "Federal need-based college grant you don't pay back. Max award is set yearly (check studentaid.gov). Foster youth are independent for FAFSA, which usually maxes Pell eligibility.",
    source: "U.S. Department of Education",
  },
  "HOPE Scholarship": {
    term: "HOPE Scholarship",
    expansion: "Georgia HOPE Scholarship",
    definition:
      "Georgia's merit-based scholarship for in-state public/private college. Requires a 3.0 GPA and Georgia residency for 24 months before high school graduation.",
    source: "Georgia Student Finance Commission",
  },
  WIC: {
    term: "WIC",
    expansion: "Women, Infants, and Children",
    definition:
      "USDA nutrition program for pregnant/postpartum people, infants, and kids under 5. Provides food, formula, and breastfeeding support.",
    source: "Georgia DPH · USDA",
  },
  SSI: {
    term: "SSI",
    expansion: "Supplemental Security Income",
    definition:
      "Federal monthly cash benefit for people with disabilities or who are 65+ with limited income. Different from SSDI — SSI is needs-based, SSDI is work-history-based.",
    source: "Social Security Administration",
  },
};

const ESCAPED_KEYS = Object.keys(GLOSSARY)
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

export const ACRONYM_RE = new RegExp(
  `\\b(${ESCAPED_KEYS.join("|")})\\b`,
  "g",
);

export const lookupAcronym = (raw: string): GlossaryEntry | null => {
  if (raw in GLOSSARY) return GLOSSARY[raw];
  const upper = raw.toUpperCase();
  if (upper in GLOSSARY) return GLOSSARY[upper];
  return null;
};
