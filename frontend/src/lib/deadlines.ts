import type { Profile } from "@/store/profile";

/**
 * Age-based deadline derivation for Georgia foster-youth transitions.
 *
 * We don't collect DOB in the profile — only integer age — so all windows
 * are expressed in years-from-age rather than in specific calendar dates.
 * That keeps the copy honest: "within your 18th birthday" is accurate even
 * if the exact date is unknown.
 *
 * Source guidance (verify with caseworker before acting on any of these):
 * - EYSS (Extended Youth Support Services): Georgia DFCS, youth can
 *   voluntarily re-enter or stay in extended care 18–21.
 * - FAFSA: Opens October 1 each year for the following academic year.
 *   Georgia priority deadline is typically March 1.
 * - Chafee ETV: Federal Education & Training Voucher, ages 14–22
 *   (some extensions to 23 for youth enrolled in post-secondary).
 * - Georgia Post-Secondary Tuition Waiver: for youth who were in DFCS
 *   custody on/after their 18th birthday. Re-apply each term.
 * - Former Foster Care Medicaid (FFCM): coverage until age 26 for
 *   youth who aged out of foster care.
 * - Annual Independent Living Plan: DFCS reviews with youth ages 14+.
 */

export type DeadlineUrgency = "now" | "soon" | "later" | "past";

export type DeadlineCategory =
  | "benefits"
  | "education"
  | "health"
  | "documents"
  | "planning";

export type Deadline = {
  id: string;
  title: string;
  when: string;
  urgency: DeadlineUrgency;
  category: DeadlineCategory;
  description: string;
  askPrompt?: string;
};

const URGENCY_ORDER: Record<DeadlineUrgency, number> = {
  now: 0,
  soon: 1,
  later: 2,
  past: 3,
};

/**
 * Build a personalized deadline list for the given profile. Returns an
 * empty array when age is unknown — callers should render an intake prompt.
 */
export const deriveDeadlines = (profile: Profile): Deadline[] => {
  const { age, education } = profile;
  if (age === null) return [];

  const goingToSchool = education === "college" || education === "trade";
  const out: Deadline[] = [];

  // 18th birthday — the single biggest transition milestone.
  if (age < 18) {
    const yearsLeft = 18 - age;
    out.push({
      id: "turning-18",
      title: "Your 18th birthday",
      when:
        yearsLeft === 1
          ? "Within a year"
          : `~${yearsLeft} years away`,
      urgency: yearsLeft <= 1 ? "now" : "soon",
      category: "planning",
      description:
        "The hardest day to be unprepared. Have documents, EYSS signup, " +
        "and a housing plan ready before it arrives.",
      askPrompt: "What do I need to do before I turn 18?",
    });
  }

  // EYSS window — straddles 18.
  if (age >= 17 && age <= 20) {
    const urgency: DeadlineUrgency =
      age === 17 || age === 18 ? "now" : age === 19 ? "soon" : "later";
    out.push({
      id: "eyss",
      title: "Extended Youth Support Services (EYSS)",
      when:
        age === 17
          ? "Sign up before your 18th birthday"
          : age === 18
            ? "Window open now"
            : `Still eligible until 21 (you're ${age})`,
      urgency,
      category: "benefits",
      description:
        "Georgia's program that keeps you connected to DFCS supports, " +
        "stipend, and case management from 18–21. Signing up is not " +
        "automatic — you have to opt in.",
      askPrompt: "How do I sign up for EYSS in Georgia?",
    });
  }

  // Chafee ETV — ages 14–22 nominally.
  if (age >= 14 && age <= 22) {
    out.push({
      id: "chafee-etv",
      title: "Chafee Education & Training Voucher",
      when: age <= 22 ? "Apply or renew each year" : "Past eligibility window",
      urgency: goingToSchool ? "now" : "soon",
      category: "education",
      description:
        "Up to $5,000/year for school-related costs (tuition, rent, " +
        "computer, childcare). You re-apply every year you're enrolled.",
      askPrompt: "How do I apply for the Chafee ETV in Georgia?",
    });
  }

  // FAFSA — annual, only surface if college/trade.
  if (goingToSchool && age >= 16) {
    out.push({
      id: "fafsa",
      title: "FAFSA",
      when: "Opens October 1 each year · Georgia priority March 1",
      urgency: "soon",
      category: "education",
      description:
        "Federal aid application. File as early as possible — some Georgia " +
        "programs fund on a first-come basis. Foster-youth status qualifies " +
        "you as independent (no parent income required).",
      askPrompt: "Do I list my foster parents on the FAFSA?",
    });
  }

  // Georgia Tuition Waiver — relevant when going to school after 18.
  if (goingToSchool && age >= 17) {
    out.push({
      id: "tuition-waiver",
      title: "Georgia Post-Secondary Tuition Waiver",
      when: "Apply each semester or term",
      urgency: age >= 18 ? "now" : "soon",
      category: "education",
      description:
        "Waives tuition at HOPE-eligible Georgia colleges and technical " +
        "schools for youth in DFCS custody on/after their 18th birthday.",
      askPrompt: "Do I qualify for the Georgia Post-Secondary Tuition Waiver?",
    });
  }

  // KSU ASCEND — only surface for college-bound.
  if (education === "college" && age >= 16 && age <= 25) {
    out.push({
      id: "ascend",
      title: "KSU ASCEND intake call",
      when: "Before your first semester",
      urgency: age >= 17 ? "soon" : "later",
      category: "education",
      description:
        "KSU's program for students from foster care. One intake call " +
        "connects you to an advisor who can line up housing, tuition " +
        "support, and mentorship.",
      askPrompt: "How do I book a KSU ASCEND intake call?",
    });
  }

  // Former Foster Care Medicaid — hard end at 26.
  if (age < 26) {
    const yearsLeft = 26 - age;
    out.push({
      id: "ffcm",
      title: "Former Foster Care Medicaid (FFCM)",
      when:
        yearsLeft <= 1
          ? "Ends within a year"
          : `Coverage until age 26 — ~${yearsLeft} years left`,
      urgency: yearsLeft <= 2 ? "now" : yearsLeft <= 5 ? "soon" : "later",
      category: "health",
      description:
        "If you were in Georgia foster care on your 18th birthday, you " +
        "qualify for Medicaid until you turn 26 — no income test. Keep " +
        "your address current with Medicaid so your card re-issues on time.",
      askPrompt: "How long does my Former Foster Care Medicaid last?",
    });
  }

  // Annual Independent Living Plan — while still in DFCS oversight.
  if (age >= 14 && age <= 20) {
    out.push({
      id: "ilp-review",
      title: "Annual Independent Living Plan review",
      when: "Once a year with your caseworker",
      urgency: "soon",
      category: "planning",
      description:
        "DFCS updates your ILP annually from age 14. You can (and should) " +
        "push for the plan to reflect your own goals, not just boxes to " +
        "check.",
      askPrompt: "What should I ask for in my ILP review?",
    });
  }

  return out.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
};

export const URGENCY_LABEL: Record<DeadlineUrgency, string> = {
  now: "This year",
  soon: "Next couple years",
  later: "Longer-term",
  past: "Past window",
};
