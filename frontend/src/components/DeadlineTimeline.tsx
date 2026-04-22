import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Deadline, DeadlineUrgency } from "@/lib/deadlines";
import { resolveDeadlineDate } from "@/lib/ics";
import type { Profile } from "@/store/profile";

type Props = {
  profile: Profile;
  deadlines: Deadline[];
  onSelect?: (deadline: Deadline) => void;
};

type PlottedDeadline = {
  deadline: Deadline;
  targetAge: number;
  percent: number;
};

const URGENCY_DOT: Record<DeadlineUrgency, string> = {
  now: "bg-nest-amber border-nest-amber",
  soon: "bg-primary border-primary",
  later: "bg-muted-foreground border-muted-foreground",
  past: "bg-muted border-muted-foreground/60",
};

const URGENCY_LABEL_SHORT: Record<DeadlineUrgency, string> = {
  now: "This year",
  soon: "Soon",
  later: "Later",
  past: "Past",
};

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

const computeTargetAge = (
  deadline: Deadline,
  profile: Profile,
  now: Date,
): number => {
  if (profile.age === null) return 0;
  const target = resolveDeadlineDate(deadline, profile, now);
  const years = (target.getTime() - now.getTime()) / MS_PER_YEAR;
  return profile.age + years;
};

export const DeadlineTimeline = ({ profile, deadlines, onSelect }: Props) => {
  const now = useMemo(() => new Date(), []);

  const { start, end, plotted, landmarks } = useMemo(() => {
    if (profile.age === null || deadlines.length === 0) {
      return {
        start: 0,
        end: 0,
        plotted: [] as PlottedDeadline[],
        landmarks: [] as number[],
      };
    }
    const startAge = profile.age;
    const endAge = 27;
    const span = endAge - startAge;
    const mapped: PlottedDeadline[] = deadlines.map((d) => {
      const targetAge = computeTargetAge(d, profile, now);
      const clamped = Math.max(startAge, Math.min(endAge, targetAge));
      const percent = span > 0 ? ((clamped - startAge) / span) * 100 : 0;
      return { deadline: d, targetAge, percent };
    });
    const stops = [startAge, 18, 21, 23, 26, endAge].filter(
      (a, i, arr) => a >= startAge && a <= endAge && arr.indexOf(a) === i,
    );
    return { start: startAge, end: endAge, plotted: mapped, landmarks: stops };
  }, [deadlines, now, profile]);

  if (profile.age === null || deadlines.length === 0) return null;

  const span = end - start;

  return (
    <section
      aria-label="Deadlines on a timeline"
      className="mt-6 rounded-3xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Age timeline
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {start} → {end}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-nest-amber" />
            Now
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Soon
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Later
          </span>
        </div>
      </div>

      <div className="relative mt-6 pb-8 pt-12">
        {plotted.map((p, i) => {
          const vOffset = (i % 3) * 14;
          return (
            <button
              key={p.deadline.id}
              type="button"
              onClick={() => onSelect?.(p.deadline)}
              aria-label={`${p.deadline.title} — around age ${p.targetAge.toFixed(1)}`}
              className="group absolute -translate-x-1/2 focus-visible:outline-none"
              style={{ left: `${p.percent}%`, top: `${8 + vOffset}px` }}
            >
              <span
                className={cn(
                  "block h-3 w-3 rounded-full border-2 transition group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card",
                  URGENCY_DOT[p.deadline.urgency],
                )}
              />
              <span
                className="pointer-events-none absolute left-1/2 top-5 w-32 -translate-x-1/2 text-[10px] leading-tight text-foreground/80"
              >
                <span className="block truncate rounded bg-background/80 px-1 py-0.5 shadow-sm group-hover:whitespace-normal">
                  {p.deadline.title}
                </span>
              </span>
            </button>
          );
        })}

        <div className="relative h-0.5 w-full rounded-full bg-border">
          {landmarks.map((a) => {
            const pct = span > 0 ? ((a - start) / span) * 100 : 0;
            return (
              <span
                key={a}
                className="absolute -top-1 h-2.5 w-px bg-border"
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>

        <div className="relative mt-2 h-4 w-full">
          {landmarks.map((a) => {
            const pct = span > 0 ? ((a - start) / span) * 100 : 0;
            const isMajor = a === 18 || a === 21 || a === 26;
            return (
              <span
                key={`l-${a}`}
                className={cn(
                  "absolute -translate-x-1/2 text-[10px] font-semibold tabular-nums",
                  isMajor ? "text-foreground" : "text-muted-foreground",
                )}
                style={{ left: `${pct}%` }}
              >
                {a}
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        Approximate placement. Windows and cutoffs vary by program — verify
        each one with your caseworker.
      </p>
    </section>
  );
};
