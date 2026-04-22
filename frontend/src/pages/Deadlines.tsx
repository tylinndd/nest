import { useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CalendarPlus,
  ChevronRight,
  FileHeart,
  HeartPulse,
  Landmark,
  MessageSquare,
} from "lucide-react";
import { useProfile } from "@/store/profile";
import {
  deriveDeadlines,
  URGENCY_LABEL,
  type Deadline,
  type DeadlineCategory,
  type DeadlineUrgency,
} from "@/lib/deadlines";
import { deadlineToIcs, downloadIcs } from "@/lib/ics";
import { glossify } from "@/lib/linkify";
import { cn } from "@/lib/utils";
import { DeadlineTimeline } from "@/components/DeadlineTimeline";

const CATEGORY_ICON: Record<DeadlineCategory, typeof CalendarClock> = {
  benefits: Landmark,
  education: BookOpen,
  health: HeartPulse,
  documents: FileHeart,
  planning: CalendarClock,
};

const URGENCY_STYLE: Record<
  DeadlineUrgency,
  { ring: string; tag: string; dot: string }
> = {
  now: {
    ring: "border-nest-amber bg-card",
    tag: "bg-nest-amber/15 text-nest-amber",
    dot: "bg-nest-amber",
  },
  soon: {
    ring: "border-border bg-card",
    tag: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  later: {
    ring: "border-border bg-card",
    tag: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  past: {
    ring: "border-border bg-muted/40",
    tag: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const URGENCY_GROUPS: readonly DeadlineUrgency[] = [
  "now",
  "soon",
  "later",
  "past",
];

const Deadlines = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const profile = useProfile();
  const deadlines = useMemo(() => deriveDeadlines(profile), [profile]);

  const byUrgency = useMemo(() => {
    const groups: Record<DeadlineUrgency, Deadline[]> = {
      now: [],
      soon: [],
      later: [],
      past: [],
    };
    for (const d of deadlines) groups[d.urgency].push(d);
    return groups;
  }, [deadlines]);

  const hasAny = deadlines.length > 0;

  const ask = (prompt: string) => {
    navigate("/navigator", { state: { askPrompt: prompt } });
  };

  const handleAddToCalendar = (d: Deadline) => {
    const ics = deadlineToIcs(d, profile);
    downloadIcs(ics, `nest-${d.id}`);
  };

  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const scrollToDeadline = (d: Deadline) => {
    const el = cardRefs.current[d.id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      el.animate(
        [
          { boxShadow: "0 0 0 0 rgba(201, 138, 40, 0.5)" },
          { boxShadow: "0 0 0 6px rgba(201, 138, 40, 0)" },
        ],
        { duration: 900, easing: "ease-out" },
      );
    } catch {
      // Web Animations API isn't universal; the glow is cosmetic.
    }
  };

  return (
    <div className="px-5 pt-5 pb-6">
      <p className="text-sm text-muted-foreground">Timeline</p>
      <h1 className="font-display text-3xl text-primary">Your deadlines</h1>
      <p className="mt-2 text-muted-foreground">
        {hasAny
          ? profile.age !== null
            ? `Based on your age (${profile.age}) and plan. Verify specifics with your caseworker — rules change.`
            : "Based on what you told Nest."
          : "Nest needs your age to build a timeline."}
      </p>

      {!hasAny && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-nest-amber" />
            No age on file yet
          </p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Add your age in Settings so Nest can surface the windows that
            matter — EYSS, FAFSA, Chafee ETV, Former Foster Care Medicaid.
          </p>
          <Link
            to="/settings"
            className="nest-pill mt-4 w-full justify-center bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Open Settings
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      )}

      {hasAny && (
        <DeadlineTimeline
          profile={profile}
          deadlines={deadlines}
          onSelect={scrollToDeadline}
        />
      )}

      {URGENCY_GROUPS.map((urgency) => {
        const items = byUrgency[urgency];
        if (items.length === 0) return null;
        return (
          <section key={urgency} className="mt-8">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn("h-2 w-2 rounded-full", URGENCY_STYLE[urgency].dot)}
              />
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {URGENCY_LABEL[urgency]}
              </h2>
            </div>
            <ul className="mt-3 space-y-3">
              {items.map((d, i) => {
                const s = URGENCY_STYLE[d.urgency];
                const Icon = CATEGORY_ICON[d.category];
                return (
                  <motion.li
                    key={d.id}
                    ref={(el) => {
                      cardRefs.current[d.id] = el;
                    }}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "rounded-3xl border p-4 transition",
                      s.ring,
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base text-foreground leading-tight">
                            {glossify(d.title, `dt-${d.id}`)}
                          </h3>
                          <span
                            className={cn(
                              "nest-chip shrink-0 text-[10px]",
                              s.tag,
                            )}
                          >
                            {d.when}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {glossify(d.description, `dd-${d.id}`)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {d.askPrompt && (
                            <button
                              type="button"
                              onClick={() => ask(d.askPrompt!)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Ask Navigator
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleAddToCalendar(d)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                            Add to calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="mt-10 text-[11px] text-muted-foreground leading-relaxed">
        {glossify(
          "Rules for EYSS, Chafee ETV, and the tuition waiver change. Nothing on this page replaces your caseworker or a Georgia DFCS benefits specialist. If anything looks off, ask Navigator or call 211.",
          "d-footer",
        )}
      </p>
    </div>
  );
};

export default Deadlines;
