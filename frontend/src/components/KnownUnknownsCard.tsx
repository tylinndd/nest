import { MessageSquare, ShieldCheck } from "lucide-react";

type Example = {
  ask: string;
  response: string;
  reason: string;
};

const EXAMPLES: Example[] = [
  {
    ask: "When is my next court date?",
    response:
      "I can only answer from published Georgia policy. Your court date lives in your case plan — your caseworker or the court clerk has it.",
    reason: "Case-specific state not in the corpus.",
  },
  {
    ask: "Did my Medicaid extension go through?",
    response:
      "I can't see your application status. Call Georgia Medicaid at 1-877-423-4746 or check the Gateway portal.",
    reason: "Live application status not in the corpus.",
  },
  {
    ask: "What should I do about this rash on my arm?",
    response:
      "Medical advice is outside what Nest is built for. Call 211, a clinic, or a nurse line — I'm policy, not a clinician.",
    reason: "Out-of-scope: clinical, not policy.",
  },
  {
    ask: "What are the Chafee benefits in Tennessee?",
    response:
      "Nest only covers Georgia programs. For Tennessee, try FosterClub's state directory or Tennessee's DCS Independent Living team.",
    reason: "Out-of-scope: other state.",
  },
];

export const KnownUnknownsCard = () => (
  <section className="space-y-3" aria-labelledby="known-unknowns-title">
    <p
      id="known-unknowns-title"
      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
    >
      When Nest says no — real examples
    </p>
    <div className="nest-card p-4 border-nest-amber/30 bg-nest-amber/5 space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        These are the kinds of questions Nest refuses rather than guesses.
        Every refusal points somewhere useful — a phone number, a state
        portal, a human.
      </p>
      <dl className="space-y-3">
        {EXAMPLES.map(({ ask, response, reason }) => (
          <div
            key={ask}
            className="border-t border-border/60 pt-3 first:border-t-0 first:pt-0 space-y-2"
          >
            <dt className="flex items-start gap-2">
              <MessageSquare
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="text-xs font-semibold text-foreground leading-snug">
                &ldquo;{ask}&rdquo;
              </span>
            </dt>
            <dd className="flex items-start gap-2">
              <ShieldCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                aria-hidden
              />
              <div className="text-xs text-muted-foreground leading-snug space-y-1">
                <span className="block">&ldquo;{response}&rdquo;</span>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground/80">
                  Why: {reason}
                </span>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);
