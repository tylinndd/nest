import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "You ask.",
    body: "Your question and profile stay on this device. Nest only sends a question to the server when you hit Send — nothing is logged server-side, no account is created.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    title: "Nest searches the Georgia docs.",
    body: "The backend runs semantic retrieval across DFCS Division 5 policy, Chafee and ILP rules, Medicaid extension guidance, and KSU ASCEND info — pulling the passages most relevant to your question.",
    accent: "bg-nest-amber/15 text-nest-amber",
  },
  {
    icon: BookOpen,
    title: "The model answers from those passages only.",
    body: "Nest is instructed to only answer from what was retrieved. If the passages don't cover your question, you'll see an honest \"I don't know from these sources\" — not a guess dressed up as an answer.",
    accent: "bg-nest-cream text-foreground",
  },
  {
    icon: ShieldCheck,
    title: "Every answer shows its source.",
    body: "Tap the source pill on any answer to see what shaped it — the Georgia doc it came from, and the parts of your profile Nest leaned on. You can audit it. A caseworker can audit it.",
    accent: "bg-primary/10 text-primary",
  },
];

const HowItWorks = () => (
  <div className="min-h-full bg-background">
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
          How Nest answers
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <h1 className="font-display text-3xl text-primary">
          Four steps behind every answer.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Nest is a retrieval-augmented assistant. It doesn't make up Georgia
          policy — it retrieves passages first, and only answers from what it
          found. Here's the whole flow.
        </p>
      </motion.div>

      <ol className="space-y-4">
        {STEPS.map(({ icon: Icon, title, body, accent }, i) => (
          <motion.li
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04 * (i + 1) }}
            className="nest-card p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accent}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </p>
                <p className="mt-0.5 font-display text-lg text-foreground">
                  {title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          What Nest won't do
        </p>
        <div className="nest-card p-4 space-y-2 text-sm text-foreground leading-relaxed">
          <p>
            <span className="font-semibold">· Make up deadlines or dollar
            amounts.</span>{" "}
            If a number isn't in the retrieved passage, Nest won't invent one.
          </p>
          <p>
            <span className="font-semibold">· Replace a caseworker.</span> Nest
            can prep you for the conversation, but it can't sign forms or file
            benefits for you.
          </p>
          <p>
            <span className="font-semibold">· Store your answers for us.</span>{" "}
            Chat history and your profile live in this browser. You can wipe
            them any time from Settings.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to="/navigator"
          className="flex-1 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Ask Nest something
        </Link>
        <Link
          to="/about"
          className="flex-1 inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
        >
          Who built Nest
        </Link>
      </div>
    </div>
  </div>
);

export default HowItWorks;
