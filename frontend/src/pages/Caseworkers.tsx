import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  XCircle,
} from "lucide-react";
import { QRPanel } from "@/components/QRPanel";
import { DeployFooter } from "@/components/DeployFooter";
import { SkipToMain } from "@/components/layout/SkipToMain";

type Item = { label: string; detail?: string };

const HANDLES_WELL: Item[] = [
  {
    label: "Aging-out deadlines",
    detail: "Medicaid extension, ETV, EYSS, Chafee — auto-ranked by days until age 21.",
  },
  {
    label: "Benefits eligibility lookup",
    detail: "State + federal programs filtered against the youth's county, age, and housing.",
  },
  {
    label: "FAFSA and ETV reminders",
    detail: "Dates, caps, and the specific Georgia forms — cited to the source manual.",
  },
  {
    label: "Document checklist",
    detail: "Birth certificate, Social Security card, Medicaid card, immunization record — with upload support that stays on the phone.",
  },
  {
    label: "Crisis hotlines that work offline",
    detail: "211, 988, Georgia DFCS after-hours — all tel:/sms: links, no network required.",
  },
];

const DOES_NOT_REPLACE: Item[] = [
  {
    label: "Case management",
    detail: "Nest doesn't know the youth's case plan or DFCS history.",
  },
  {
    label: "Placement decisions",
    detail: "Nothing in Nest belongs in a placement meeting.",
  },
  {
    label: "Mandated reporting",
    detail: "Youth-safety disclosures still route through you, not through the app.",
  },
  {
    label: "Clinical judgment",
    detail: "Nest is policy + plain-English, not a therapist or a physician.",
  },
];

const PRIVACY_PROMISES: Item[] = [
  {
    label: "No account, no login, no email on file.",
    detail: "Sharing the link with a youth doesn't create a record on our side.",
  },
  {
    label: "The youth's profile lives in their browser.",
    detail: "Name, trusted adult, documents, chat history — all stored locally, cleared with one button.",
  },
  {
    label: "No FERPA/HIPAA liability from sharing Nest.",
    detail: "The policy answers Nest returns don't include the youth's identifying data — only their age, county, and category-level concerns are sent to the retrieval endpoint.",
  },
  {
    label: "Source code is public.",
    detail: "Every network call Nest makes is visible in frontend/src/lib/api.ts. Verify anything on the spot.",
  },
];

const Row = ({ row, tone }: { row: Item; tone: "pos" | "neg" | "plain" }) => {
  const IconEl =
    tone === "pos" ? CheckCircle2 : tone === "neg" ? XCircle : null;
  const iconClass =
    tone === "pos"
      ? "text-primary"
      : tone === "neg"
        ? "text-nest-coral"
        : "";

  return (
    <li className="flex gap-2 border-t border-border/60 py-2 first:border-t-0 first:pt-0">
      {IconEl && (
        <IconEl className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground leading-snug">
          {row.label}
        </span>
        {row.detail && (
          <span className="block text-xs text-muted-foreground leading-snug mt-0.5">
            {row.detail}
          </span>
        )}
      </div>
    </li>
  );
};

const Caseworkers = () => (
  <>
  <SkipToMain />
  <main id="main-content" className="min-h-full bg-background">
    <div className="mx-auto max-w-md min-h-screen flex flex-col px-5 pt-6 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/about"
          aria-label="Back to About"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          For caseworkers
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> DFCS staff
        </span>
        <h1 className="mt-3 font-display text-3xl text-primary">
          Nest sits inside your workflow, not around it.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Nest is a policy-grounded copilot for transition-age youth in Georgia
          — not a replacement for case management. Built for the moments
          between home visits when a youth needs an answer right now and you
          can't be the one to give it.
        </p>
      </motion.div>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Point a youth to Nest in under a minute
        </p>
        <QRPanel hint="On a laptop, scan from the youth's phone. No app install, no login, no sign-up. They land on the same site you're looking at now." />
      </section>

      <section className="nest-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            What Nest handles well
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {HANDLES_WELL.map((r) => (
            <Row key={r.label} row={r} tone="pos" />
          ))}
        </ul>
      </section>

      <section className="nest-card p-4 border-nest-amber/30 bg-nest-amber/5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nest-amber/15 text-nest-amber">
            <Shield className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            What Nest doesn't replace
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {DOES_NOT_REPLACE.map((r) => (
            <Row key={r.label} row={r} tone="neg" />
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          If a question crosses into any of the above, Nest surfaces a "talk to
          your caseworker" nudge rather than guessing.
        </p>
      </section>

      <section className="nest-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            Privacy promises to you
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {PRIVACY_PROMISES.map((r) => (
            <Row key={r.label} row={r} tone="plain" />
          ))}
        </ul>
        <Link
          to="/privacy"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Read the full privacy label
          <span aria-hidden>→</span>
        </Link>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Feedback
        </p>
        <a
          href="mailto:stephensookra@gmail.com?subject=Nest%20caseworker%20feedback"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Tell us what's missing
            </p>
            <p className="text-xs text-muted-foreground">
              If a youth asked you something Nest couldn't answer, we want to know.
            </p>
          </div>
        </a>
      </section>

      <DeployFooter />
    </div>
  </main>
  </>
);

export default Caseworkers;
