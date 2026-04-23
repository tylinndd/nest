import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accessibility as AccessibilityIcon,
  ArrowLeft,
  Ear,
  Eye,
  Github,
  Keyboard,
  Mail,
  Sparkles,
} from "lucide-react";

type Item = { label: string; detail?: string };

const CONFORMANCE: Item[] = [
  {
    label: "WCAG 2.1 Level AA is the target for every production page.",
    detail:
      "Text contrast, keyboard operability, focus visibility, and form labeling are audited on the 10 most-trafficked routes.",
  },
  {
    label: "Lighthouse accessibility score ≥ 95 on every audited route.",
    detail:
      "9 of 10 routes score 100. The one at 95 is a transient Sonner-toast snapshot — fixed at the Toaster config level.",
  },
  {
    label: "@axe-core/react runs in development.",
    detail:
      "Any violation logs to the browser console during dev so regressions surface before they ship.",
  },
];

const ASSISTIVE_TECH: Item[] = [
  {
    label: "VoiceOver",
    detail: "iOS Safari, macOS Safari — tested on the core flow (Home → Navigator → Vault).",
  },
  {
    label: "TalkBack",
    detail: "Android Chrome — tested on Home, Navigator, and Emergency.",
  },
  {
    label: "NVDA + Firefox",
    detail: "Desktop Windows — primary screen reader for dev audits.",
  },
  {
    label: "Keyboard-only navigation",
    detail:
      "Every interactive element reachable with Tab, confirmed with Shift+Tab, and operable with Enter or Space.",
  },
];

const SHORTCUTS: Item[] = [
  {
    label: "Skip-to-main link",
    detail:
      "First Tab stop on every in-app page focuses a 'Skip to main content' link that jumps past the chrome.",
  },
  {
    label: "Tour controls",
    detail:
      "Space pauses, Left/Right skip, Esc exits — the demo tour never traps keyboard users.",
  },
  {
    label: "Reduced motion is respected.",
    detail:
      "If your OS is set to reduce motion, Framer Motion transitions degrade to instant — no vestibular surprises.",
  },
];

const KNOWN_GAPS: Item[] = [
  {
    label: "PDF preview in the Document Vault has partial screen-reader coverage.",
    detail:
      "The file name, upload date, and delete affordance are announced. The rendered PDF itself defers to the browser's built-in viewer, which varies by platform.",
  },
  {
    label: "Chart color-coding on the Benefits page doubles up with labels.",
    detail:
      "Colors never carry meaning alone — every chart also exposes numbers and labels in plain text.",
  },
  {
    label: "Sonner toasts auto-dismiss after ~4 seconds.",
    detail:
      "If you need a persistent status surface, the in-page SuccessCard and NetworkLog on Privacy are designed to stay put until dismissed.",
  },
];

const Row = ({ row }: { row: Item }) => (
  <li className="flex flex-col gap-0.5 border-t border-border/60 py-2 first:border-t-0 first:pt-0">
    <span className="text-sm font-medium text-foreground leading-snug">
      {row.label}
    </span>
    {row.detail && (
      <span className="text-xs text-muted-foreground leading-snug">
        {row.detail}
      </span>
    )}
  </li>
);

const Accessibility = () => (
  <main className="min-h-full bg-background">
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
          Accessibility
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> WCAG 2.1 AA
        </span>
        <h1 className="mt-3 font-display text-3xl text-primary">
          Accessibility, in plain language.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Nest is built for young people who may be using a borrowed phone, a
          shelter kiosk, or a screen reader. If any of this is broken for you,
          we want to know — not after C-Day, right now.
        </p>
      </motion.div>

      <section className="nest-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AccessibilityIcon className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            Conformance
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {CONFORMANCE.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
      </section>

      <section className="nest-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Ear className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            Supported assistive tech
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {ASSISTIVE_TECH.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
      </section>

      <section className="nest-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Keyboard className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            Keyboard + motion
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {SHORTCUTS.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
      </section>

      <section className="nest-card p-4 border-nest-amber/30 bg-nest-amber/5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nest-amber/15 text-nest-amber">
            <Eye className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-display text-lg text-primary leading-none">
            Known gaps
          </p>
        </div>
        <ul className="mt-3 space-y-0">
          {KNOWN_GAPS.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          We list these honestly because a page that claims perfect access and
          isn't, helps nobody.
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Report an issue
        </p>
        <a
          href="mailto:stephensookra@gmail.com?subject=Nest%20accessibility%20issue"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Email us directly
            </p>
            <p className="text-xs text-muted-foreground">
              We read every message. One-line reports are welcome.
            </p>
          </div>
        </a>
        <a
          href="https://github.com/tylinndd/nest/issues/new"
          target="_blank"
          rel="noreferrer"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Github className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Open a GitHub issue
            </p>
            <p className="text-xs text-muted-foreground">
              Public, tracked, and visible to the whole team.
            </p>
          </div>
        </a>
      </section>
    </div>
  </main>
);

export default Accessibility;
