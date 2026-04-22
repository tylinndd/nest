import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, GraduationCap, Sparkles } from "lucide-react";
import { TEAM } from "@/data/team";

const Team = () => (
  <div className="min-h-full bg-background">
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
          The team
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> KSU · C-Day 2026
        </span>
        <h1 className="mt-3 font-display text-3xl text-primary">
          Three people building Nest.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Nest is a senior project from Kennesaw State University computer
          science. We chose aging-out of foster care because it's one of the
          few places where better software genuinely changes an outcome — not
          just a conversion rate.
        </p>
      </motion.div>

      <section className="space-y-4">
        {TEAM.map((m, i) => (
          <motion.article
            key={m.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06, ease: "easeOut" }}
            className="nest-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl text-foreground leading-tight">
                  {m.name}
                </h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
                  {m.role}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {m.detail}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              {m.contributions.map((c) => (
                <li key={c} className="flex gap-2 leading-relaxed">
                  <span className="text-primary" aria-hidden>
                    ·
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </section>

      <section className="nest-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Why we built this
        </p>
        <p className="mt-2 text-sm text-foreground leading-relaxed">
          In Georgia, a teenager aging out of foster care is handed a stack of
          forms, given a 30-day window to enroll in Extended Youth Support
          Services, and expected to figure out Chafee ETV, Medicaid
          re-certification, and housing on their own — while still in high
          school.
        </p>
        <p className="mt-3 text-sm text-foreground leading-relaxed">
          We built Nest because the information exists. It's just locked in
          PDFs, scattered across DFCS regional offices, and written for
          caseworkers, not youth. Nest is a quiet second-chair: private, in
          plain English, with the actual Georgia rule behind every answer.
        </p>
      </section>

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
            Open source on GitHub &middot; MIT license
          </p>
        </div>
      </a>
    </div>
  </div>
);

export default Team;
