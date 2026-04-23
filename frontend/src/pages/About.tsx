import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accessibility as AccessibilityIcon,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Code2,
  Database,
  Github,
  Lock,
  Sparkles,
} from "lucide-react";
import { TEAM } from "@/data/team";
import { DeployFooter } from "@/components/DeployFooter";

const SOURCES = [
  "Georgia DFCS Division 5 policy manual",
  "Independent Living Program (ILP) handbook",
  "Chafee Foster Care Program rules",
  "Georgia Medicaid extension for former foster youth",
  "KSU ASCEND tuition waiver guidance",
  "Embark Georgia statewide foster-youth network (Chafee ETV coordinator)",
];

type Stat = {
  value: string;
  label: string;
  source: string;
  href: string;
};

const IMPACT: Stat[] = [
  {
    value: "~12,000",
    label: "Georgia children in foster care",
    source: "AFCARS · FY2022",
    href: "https://www.acf.hhs.gov/cb/data-research/foster-care",
  },
  {
    value: "~23,000",
    label: "Youth age out of U.S. foster care each year",
    source: "AFCARS",
    href: "https://www.acf.hhs.gov/cb/data-research/foster-care",
  },
  {
    value: "1 in 4",
    label: "Experience homelessness within 18 months",
    source: "Casey Family Programs",
    href: "https://www.casey.org/",
  },
  {
    value: "<3%",
    label: "Earn a 4-year degree by age 26",
    source: "NWG on Foster Care & Education",
    href: "https://www.fostercareandeducation.org/",
  },
];

const TECH = [
  { label: "React 19 · Vite · TypeScript", icon: Code2 },
  { label: "FastAPI · LangChain · ChromaDB", icon: Database },
  { label: "Retrieval-augmented answers with cited passages", icon: BookOpen },
  { label: "Profile stays on your device, not on a server", icon: Lock },
];

const About = () => (
  <main className="min-h-full bg-background">
    <div className="mx-auto max-w-md min-h-screen flex flex-col px-5 pt-6 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Back to home"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          About Nest
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> KSU C-Day 2026
        </span>
        <h1 className="mt-3 font-display text-3xl text-primary">
          A transition copilot for Georgia foster youth.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Aging out of foster care in Georgia means 30+ benefit deadlines, a
          paperwork maze, and nobody whose job it is to explain any of it. Nest
          is the missing second-chair — a private, plain-English guide that
          answers questions with the actual Georgia rules behind the answer.
        </p>
      </motion.div>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Why this exists
        </p>
        <div className="grid grid-cols-2 gap-3">
          {IMPACT.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="nest-card p-4 transition hover:border-primary/40"
            >
              <p className="font-display text-2xl leading-none text-primary">
                {s.value}
              </p>
              <p className="mt-2 text-xs text-foreground leading-snug">
                {s.label}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {s.source}
              </p>
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Each number links to its primary source. Tap any card to verify —
          Nest won't make the case for itself without telling you where the
          case comes from.
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Built by
        </p>
        <div className="space-y-3">
          {TEAM.map((m) => (
            <div key={m.name} className="nest-card p-4">
              <p className="font-display text-lg text-foreground">{m.name}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-primary">
                {m.role}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {m.detail}
              </p>
            </div>
          ))}
        </div>
        <Link
          to="/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Read the contribution breakdown
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          How Nest answers
        </p>
        <div className="nest-card p-4 space-y-3">
          {TECH.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm text-foreground leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Curious about the retrieval flow?{" "}
          <Link
            to="/how-it-works"
            className="font-semibold text-primary hover:underline"
          >
            See the 4-step explainer
          </Link>
          . New to the foster-care vocabulary?{" "}
          <Link
            to="/glossary"
            className="font-semibold text-primary hover:underline"
          >
            Browse the glossary
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sources Nest draws from
        </p>
        <div className="nest-card p-4">
          <ul className="space-y-2 text-sm text-foreground">
            {SOURCES.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  ·
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Nest will say "I don't know" before making something up. If a
            passage doesn't cover your question, you'll see that honestly.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Privacy & access
        </p>
        <Link
          to="/privacy"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              See the privacy label
            </p>
            <p className="text-xs text-muted-foreground">
              What stays on your device, what's sent, what third parties see.
            </p>
          </div>
        </Link>
        <Link
          to="/accessibility"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AccessibilityIcon className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Accessibility statement
            </p>
            <p className="text-xs text-muted-foreground">
              WCAG 2.1 AA conformance, supported assistive tech, known gaps.
            </p>
          </div>
        </Link>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          For stakeholders
        </p>
        <Link
          to="/caseworkers"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              For caseworkers
            </p>
            <p className="text-xs text-muted-foreground">
              How Nest fits alongside DFCS staff, and the privacy promises that make it safe to share.
            </p>
          </div>
        </Link>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Project
        </p>
        <a
          href="https://github.com/tylinndd/nest"
          target="_blank"
          rel="noreferrer"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Github className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              tylinndd/nest
            </p>
            <p className="text-xs text-muted-foreground">
              Open source on GitHub
            </p>
          </div>
        </a>
      </section>

      <DeployFooter />
    </div>
  </main>
);

export default About;
