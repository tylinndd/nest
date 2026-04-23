import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Ban,
  Github,
  HardDrive,
  Lock,
  Server,
  Trash2,
} from "lucide-react";
import { NetworkLog } from "@/components/NetworkLog";

type LabelRow = { label: string; detail?: string };

const STAYS_LOCAL: LabelRow[] = [
  { label: "Your name" },
  { label: "Age, county, housing, education plan" },
  { label: "Health notes you entered" },
  { label: "Trusted-adult contact", detail: "name + phone" },
  { label: "Document checklist", detail: "have / uploaded / missing" },
  { label: "Document files you uploaded", detail: "never leave this device" },
  { label: "Chat history", detail: "last 200 messages" },
  { label: "Completed-task history" },
  { label: "Theme preference" },
];

const SENT_TO_SERVER: LabelRow[] = [
  { label: "The question you typed in Navigator" },
  { label: "Your age" },
  { label: "Your county" },
  { label: "Education intent", detail: "college / trade / working" },
  { label: "Top concerns", detail: "school / housing / health — categories only" },
  {
    label: "Document possession",
    detail: "yes/no per document type — not the files",
  },
];

const NEVER_SENT: LabelRow[] = [
  { label: "Your name" },
  { label: "Trusted-adult contact" },
  { label: "Specific health conditions you wrote" },
  { label: "Any file or photo you uploaded" },
  { label: "Chat history from previous questions" },
];

const THIRD_PARTIES: LabelRow[] = [
  { label: "No analytics", detail: "no Google Analytics, Plausible, Mixpanel" },
  { label: "No advertising networks" },
  { label: "No tracking pixels" },
  { label: "No error-reporting service", detail: "no Sentry, no LogRocket" },
  { label: "No account system", detail: "no login, no email on file" },
];

const FOOTNOTE: LabelRow[] = [
  {
    label: "Google Fonts serves the typeface",
    detail:
      "loaded over CDN, no user data sent. Swappable to self-hosted fonts if you fork Nest.",
  },
];

type SectionTone = "local" | "server" | "never" | "third";

const TONE_STYLE: Record<SectionTone, string> = {
  local: "border-nest-sage/40 bg-nest-sage/5",
  server: "border-nest-amber/40 bg-nest-amber/5",
  never: "border-border",
  third: "border-border",
};

const TONE_ICON: Record<SectionTone, string> = {
  local: "bg-nest-sage/15 text-[#2E7D5B]",
  server: "bg-nest-amber/15 text-nest-amber",
  never: "bg-muted text-muted-foreground",
  third: "bg-muted text-muted-foreground",
};

const Row = ({ row }: { row: LabelRow }) => (
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

const LabelCard = ({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof Lock;
  title: string;
  tone: SectionTone;
  children: React.ReactNode;
}) => (
  <section className={`nest-card p-4 ${TONE_STYLE[tone]}`}>
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_ICON[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="font-display text-lg text-primary leading-none">{title}</p>
    </div>
    <div className="mt-3">{children}</div>
  </section>
);

const Privacy = () => (
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
          Privacy label
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Lock className="h-3 w-3" /> What Nest knows
        </span>
        <h1 className="mt-3 font-display text-3xl text-primary">
          The whole data picture.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          We built this page so you don't have to take our word for it. Every
          piece of data Nest touches, where it lives, and who ever sees it —
          listed honestly.
        </p>
      </motion.div>

      <LabelCard icon={HardDrive} title="Stays on this device" tone="local">
        <ul className="space-y-0">
          {STAYS_LOCAL.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Saved in this browser's local storage. Closing the tab keeps it.
          Clearing the browser or tapping "Wipe all data" in Settings deletes
          it. It is never transmitted.
        </p>
      </LabelCard>

      <LabelCard
        icon={Server}
        title="Sent to our server when you ask Navigator"
        tone="server"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What goes
        </p>
        <ul className="mt-1">
          {SENT_TO_SERVER.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What does not
        </p>
        <ul className="mt-1">
          {NEVER_SENT.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Used for one retrieval call against the Georgia policy corpus and
          returned as an answer. We do not keep a copy tied to you — there is
          no account to tie it to.
        </p>
      </LabelCard>

      <LabelCard
        icon={Activity}
        title="Live network log"
        tone="server"
      >
        <NetworkLog />
      </LabelCard>

      <LabelCard icon={Ban} title="Who else sees your data" tone="third">
        <ul>
          {THIRD_PARTIES.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          One honest footnote
        </p>
        <ul className="mt-1">
          {FOOTNOTE.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </ul>
      </LabelCard>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Verify any of this
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
              Read the source
            </p>
            <p className="text-xs text-muted-foreground">
              Every network call Nest makes lives in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                frontend/src/lib/api.ts
              </code>
              .
            </p>
          </div>
        </a>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Leave no trace
        </p>
        <Link
          to="/settings"
          className="nest-card flex items-center gap-3 p-4 transition hover:border-nest-coral/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nest-coral/10 text-nest-coral">
            <Trash2 className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Wipe every byte
            </p>
            <p className="text-xs text-muted-foreground">
              Settings → Danger zone → Wipe all data. Clears localStorage,
              session state, any cached builds, and service-worker
              registrations.
            </p>
          </div>
        </Link>
      </section>
    </div>
  </main>
);

export default Privacy;
