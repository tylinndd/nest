import { AlertTriangle, Calendar, FileQuestion, Phone, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

type Gap = { Icon: typeof Phone; text: string };

const GAPS: Gap[] = [
  {
    Icon: Phone,
    text: "Your caseworker's current phone number — ask DFCS directly or check your case plan.",
  },
  {
    Icon: FileQuestion,
    text: "What actually happened in your case last week — Nest only knows the published policy.",
  },
  {
    Icon: UserCheck,
    text: "Whether a specific service was delivered to you — your caseworker has the record.",
  },
  {
    Icon: Calendar,
    text: "Georgia policy changes from the last 48 hours — the corpus is refreshed, not live.",
  },
];

export const NestDoesntKnowCard = () => (
  <section
    className="nest-card p-4 border-nest-amber/30 bg-nest-amber/5"
    aria-labelledby="nest-doesnt-know-title"
  >
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nest-amber/15 text-nest-amber">
        <AlertTriangle className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p
          id="nest-doesnt-know-title"
          className="font-display text-base text-foreground leading-snug"
        >
          What Nest can't tell you
        </p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          You still need a human for these. Nest is policy, not case management.
        </p>
        <ul className="mt-3 space-y-2">
          {GAPS.map(({ Icon, text }) => (
            <li
              key={text}
              className="flex gap-2 text-xs text-foreground leading-relaxed"
            >
              <Icon
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nest-amber"
                aria-hidden
              />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/settings#trusted-adult"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Set or update your trusted adult
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  </section>
);
