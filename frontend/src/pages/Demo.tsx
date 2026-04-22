import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  DEMO_PERSONAS,
  PERSONA_LABELS,
  profileFor,
  type DemoPersona,
} from "@/lib/demo";

type PersonaCard = {
  id: DemoPersona;
  tagline: string;
  headline: string;
  Icon: typeof GraduationCap;
  bullets: string[];
  cta: string;
};

const CARDS: PersonaCard[] = [
  {
    id: "maria",
    tagline: "Aging out · 18 · Cobb",
    headline: "Maria is about to hit her 18th birthday",
    Icon: GraduationCap,
    bullets: [
      "Still in DFCS care · needs EYSS signup",
      "Has Medicaid + SSC, missing birth certificate",
      "Heading to college",
    ],
    cta: "Walk through Maria's Nest",
  },
  {
    id: "marcus",
    tagline: "Planning · 17 · Fulton",
    headline: "Marcus is mapping his senior year",
    Icon: BookOpen,
    bullets: [
      "Still has 12 months before aging out",
      "No documents gathered yet — Nest gives him a checklist",
      "College plans, needs FAFSA + ETV guidance",
    ],
    cta: "Walk through Marcus's Nest",
  },
  {
    id: "jade",
    tagline: "Aged out · 22 · DeKalb",
    headline: "Jade is 2 years into independent living",
    Icon: Briefcase,
    bullets: [
      "Working, not in school · needs Medicaid-extension reminder",
      "Has the full document vault ready",
      "Needs help planning the next deposit / license step",
    ],
    cta: "Walk through Jade's Nest",
  },
];

const Demo = () => (
  <div className="min-h-full bg-background">
    <div className="mx-auto max-w-md min-h-screen flex flex-col px-5 pt-6 pb-10 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Back to home"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Demo personas
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> Judges · C-Day 2026
        </span>
        <h1 className="mt-3 font-display text-3xl text-primary">
          Pick a Nest to walk through
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Each persona boots a pre-filled profile so you can see how Nest
          changes shape depending on where someone is in their transition.
          Your real data is never touched — demo data lives in session only.
        </p>
      </motion.div>

      <div className="space-y-4">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.05 }}
            className="nest-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <c.Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                  {c.tagline}
                </p>
                <h2 className="mt-1 font-display text-lg text-foreground leading-tight">
                  {c.headline}
                </h2>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {c.bullets.map((b) => (
                <li
                  key={b}
                  className="flex gap-2 text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="text-primary" aria-hidden>
                    ·
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to={`/reset?as=${c.id}`}
              className="nest-pill mt-4 w-full justify-center bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              {c.cta}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="nest-card p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Leave demo mode
        </p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Tap the Nest badge on any page or head back to{" "}
          <Link to="/" className="font-semibold text-primary hover:underline">
            your own home
          </Link>
          . Clearing a demo wipes only its session profile.
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Loaded personas:{" "}
        {DEMO_PERSONAS.map((p) => PERSONA_LABELS[p]).join(" · ")} ·{" "}
        {DEMO_PERSONAS.length} total ({DEMO_PERSONAS.length} profiles hydrated
        via{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
          {profileFor.name}()
        </code>
        ).
      </p>
    </div>
  </div>
);

export default Demo;
