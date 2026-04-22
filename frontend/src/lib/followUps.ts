/**
 * Heuristic follow-up question suggestions shown as chips after a Navigator
 * answer. Runs in the browser against the response text — no extra backend
 * call. The goal is to de-blank the page after one question: most youth will
 * quit if they need to type a second time.
 *
 * Chips are suggestions, not commands: users always see the input bar and can
 * ignore them. Duplicates and chips matching the original question are
 * filtered so we never loop a person back on themselves.
 */

type Rule = {
  /** Case-insensitive phrases that trigger this rule. Any match = apply. */
  triggers: readonly string[];
  /** Questions to add to the suggestion pool, in priority order. */
  suggestions: readonly string[];
};

const RULES: readonly Rule[] = [
  {
    triggers: ["birth certificate"],
    suggestions: [
      "What does it cost?",
      "Can a caseworker pull it for me?",
      "What if I was born out of state?",
    ],
  },
  {
    triggers: ["social security", "ssn", "ss card"],
    suggestions: [
      "What ID do I need to replace it?",
      "Is there a fee?",
    ],
  },
  {
    triggers: ["state id", "driver's license", "drivers license", "permit"],
    suggestions: [
      "Is the fee waived for foster youth?",
      "What documents do I bring to DDS?",
    ],
  },
  {
    triggers: ["medicaid", "former foster care medicaid", "ffcm"],
    suggestions: [
      "How long does my Medicaid last?",
      "How do I find a doctor that takes Medicaid?",
      "What if I move out of Georgia?",
    ],
  },
  {
    triggers: ["therapist", "mental health", "counselor", "counseling"],
    suggestions: [
      "Does Medicaid cover therapy?",
      "Are there crisis options right now?",
    ],
  },
  {
    triggers: ["primary care", "doctor", "pcp"],
    suggestions: [
      "How do I book an appointment?",
      "What if my doctor isn't accepting new patients?",
    ],
  },
  {
    triggers: ["chafee", "etv"],
    suggestions: [
      "What's the Chafee ETV deadline?",
      "How much money can I get?",
      "Can I use it for rent?",
    ],
  },
  {
    triggers: ["fafsa"],
    suggestions: [
      "When is the FAFSA deadline?",
      "Do I list my foster parents as my parents?",
    ],
  },
  {
    triggers: ["tuition waiver", "post-secondary"],
    suggestions: [
      "Do I qualify for the tuition waiver?",
      "Which Georgia schools accept it?",
    ],
  },
  {
    triggers: ["college", "university", "school"],
    suggestions: [
      "What's the application deadline?",
      "How do I pay for it?",
    ],
  },
  {
    triggers: ["trade", "technical college", "certificate program"],
    suggestions: [
      "What programs are near me?",
      "Is the tuition waiver accepted?",
    ],
  },
  {
    triggers: ["ascend"],
    suggestions: [
      "How do I book an ASCEND intake call?",
      "What does ASCEND help with?",
    ],
  },
  {
    triggers: ["hud", "fyi voucher", "housing voucher"],
    suggestions: [
      "How long does the voucher last?",
      "Who in Georgia administers it?",
    ],
  },
  {
    triggers: ["transitional living", "tlp", "independent living"],
    suggestions: [
      "Where's the nearest program?",
      "Am I still eligible?",
    ],
  },
  {
    triggers: ["housing", "apartment", "rent", "lease", "shelter"],
    suggestions: [
      "What if I need a place tonight?",
      "How do I cover the deposit?",
    ],
  },
  {
    triggers: ["eyss", "extended youth support", "stipend"],
    suggestions: [
      "How do I sign up for EYSS?",
      "Am I still eligible if I'm working?",
    ],
  },
  {
    triggers: ["checking account", "savings", "bank"],
    suggestions: [
      "Which banks work with foster youth?",
      "Do I need a state ID to open one?",
    ],
  },
  {
    triggers: ["budget", "budgeting"],
    suggestions: [
      "How do I start a first budget?",
      "What should I set aside each month?",
    ],
  },
  {
    triggers: ["credit", "credit card"],
    suggestions: [
      "How do I build credit safely?",
      "Should I freeze my credit?",
    ],
  },
  {
    triggers: ["caseworker", "dfcs", "ilp specialist"],
    suggestions: [
      "What should I ask my caseworker?",
      "What if I can't reach them?",
    ],
  },
  {
    triggers: ["document", "paperwork", "records"],
    suggestions: [
      "Which one do I need first?",
      "Where do I keep them safely?",
    ],
  },
  {
    triggers: ["apply", "application", "sign up", "enroll"],
    suggestions: [
      "Where do I apply?",
      "What do I need to bring?",
    ],
  },
  {
    triggers: ["deadline", "due date"],
    suggestions: [
      "What happens if I miss it?",
      "Can I get an extension?",
    ],
  },
  {
    triggers: ["aging out", "age out", "18th birthday", "turn 18"],
    suggestions: [
      "What changes on my 18th birthday?",
      "What do I lose if I don't sign EYSS?",
    ],
  },
];

const GENERIC_FOLLOWUPS: readonly string[] = [
  "What's my next step?",
  "Who can help me with this?",
  "Walk me through it.",
];

const MAX_CHIPS = 3;

const normalize = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const containsAny = (haystack: string, phrases: readonly string[]): boolean =>
  phrases.some((p) => haystack.includes(p));

/**
 * Suggest up to 3 follow-up questions for a Navigator answer.
 *
 * Priority order:
 *  1. Rules matched in the answer (most specific topical chips)
 *  2. Rules matched in the question (fallback if the answer was short)
 *  3. Generic chips ("What's my next step?")
 *
 * Chips that duplicate (case-insensitive, ignoring punctuation) the user's
 * own question are removed so we don't echo them back at themselves.
 */
export const suggestFollowUps = (
  question: string,
  answer: string,
): string[] => {
  const questionNorm = normalize(question);
  const answerNorm = normalize(answer);

  const pool: string[] = [];
  const push = (s: string) => {
    if (!pool.includes(s)) pool.push(s);
  };

  for (const rule of RULES) {
    if (containsAny(answerNorm, rule.triggers)) {
      for (const s of rule.suggestions) push(s);
    }
  }

  if (pool.length < MAX_CHIPS) {
    for (const rule of RULES) {
      if (containsAny(questionNorm, rule.triggers)) {
        for (const s of rule.suggestions) push(s);
      }
    }
  }

  if (pool.length < MAX_CHIPS) {
    for (const s of GENERIC_FOLLOWUPS) push(s);
  }

  return pool
    .filter((s) => normalize(s) !== questionNorm)
    .slice(0, MAX_CHIPS);
};
