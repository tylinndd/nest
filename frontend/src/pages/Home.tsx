import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderLock,
  MessageCircle,
  ArrowRight,
  LifeBuoy,
} from "lucide-react";
import { user, tasks, type Task } from "@/data/placeholder";
import { SuccessCard } from "@/components/ui/SuccessCard";
import { useProfile } from "@/store/profile";
import { cn } from "@/lib/utils";

const toneBorder: Record<NonNullable<Task["tone"]>, string> = {
  coral: "border-l-nest-coral",
  amber: "border-l-nest-amber",
  sage: "border-l-nest-sage",
};

const toneIconWrap: Record<NonNullable<Task["tone"]>, string> = {
  coral: "bg-nest-coral/10 text-nest-coral",
  amber: "bg-nest-amber/10 text-nest-amber",
  sage: "bg-nest-sage/15 text-[#2E7D5B]",
};

const statusIcon = {
  overdue: AlertCircle,
  week: Clock,
  done: CheckCircle2,
} as const;

const Section = ({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) => (
  <section className="mt-6">
    <div className="px-5 mb-3 flex items-baseline justify-between">
      <h2 className="font-display text-xl text-primary">{title}</h2>
      {typeof count === "number" && (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </div>
    <div className="px-5 space-y-3">{children}</div>
  </section>
);

const TaskRow = ({
  t,
  onComplete,
}: {
  t: Task;
  onComplete: (id: string) => void;
}) => {
  const tone = t.tone ?? (t.status === "overdue" ? "coral" : t.status === "week" ? "amber" : "sage");
  const Icon = statusIcon[t.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        "nest-card p-4 border-l-4",
        toneBorder[tone],
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full",
            toneIconWrap[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p
            className={cn(
              "font-medium leading-snug",
              t.status === "done"
                ? "line-through text-muted-foreground"
                : "text-foreground",
            )}
          >
            {t.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t.due}</p>
          {t.help && (
            <button
              onClick={() => onComplete(t.id)}
              className="mt-3 nest-pill bg-secondary text-secondary-foreground hover:bg-secondary/80 min-h-[2.5rem]"
            >
              {t.help} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [completedId, setCompletedId] = useState<string | null>(null);
  const profileName = useProfile((s) => s.name);
  const profileAge = useProfile((s) => s.age);
  const profileCounty = useProfile((s) => s.county);

  const displayName = profileName.trim() || user.name;
  const displayAge = profileAge ?? user.age;
  const displayCounty = profileCounty ? `${profileCounty} County` : user.county;

  const overdue = useMemo(() => tasks.filter((t) => t.status === "overdue"), []);
  const week = useMemo(() => tasks.filter((t) => t.status === "week"), []);
  const done = useMemo(() => tasks.filter((t) => t.status === "done"), []);

  const progress = Math.round((done.length / tasks.length) * 100);

  const handleComplete = (id: string) => {
    setCompletedId(id);
    window.setTimeout(() => setCompletedId(null), 2400);
  };

  const completedTask = completedId
    ? tasks.find((t) => t.id === completedId) ?? null
    : null;

  return (
    <div className="pb-6">
      <div className="px-5 pt-5">
        <p className="text-sm text-muted-foreground">Good morning,</p>
        <h1 className="font-display text-3xl text-primary">{displayName}.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {displayCounty} · Age {displayAge}
        </p>
      </div>

      <div className="px-5 mt-5">
        <div className="nest-card p-6 bg-primary text-primary-foreground overflow-hidden relative">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Your 90-day plan
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[5rem] leading-none">
              {user.daysUntilExit}
            </span>
            <span className="text-base opacity-90">days until you age out</span>
          </div>
          <div className="mt-5 h-1 rounded-full bg-primary-foreground/20 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-nest-sage"
            />
          </div>
          <p className="mt-2 text-xs opacity-80">
            {progress}% of week-one checklist complete
          </p>
        </div>
      </div>

      <div className="px-5 mt-4">
        <SuccessCard
          show={!!completedTask}
          title="Logged"
          detail={completedTask ? completedTask.title : undefined}
        />
      </div>

      {overdue.length > 0 && (
        <Section title="Overdue" count={overdue.length}>
          {overdue.map((t) => (
            <TaskRow key={t.id} t={t} onComplete={handleComplete} />
          ))}
        </Section>
      )}

      {week.length > 0 && (
        <Section title="This week" count={week.length}>
          {week.map((t) => (
            <TaskRow key={t.id} t={t} onComplete={handleComplete} />
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Completed" count={done.length}>
          {done.map((t) => (
            <TaskRow key={t.id} t={t} onComplete={handleComplete} />
          ))}
        </Section>
      )}

      <section className="mt-8 px-5 grid grid-cols-2 gap-3">
        <Link
          to="/vault"
          className="nest-card p-5 transition hover:border-primary/40 min-h-[6.5rem]"
        >
          <FolderLock className="h-6 w-6 text-primary" />
          <p className="mt-3 font-semibold">Document Vault</p>
          <p className="text-xs text-muted-foreground mt-1">
            IDs, records, letters
          </p>
        </Link>
        <Link
          to="/navigator"
          className="nest-card p-5 transition hover:border-primary/40 min-h-[6.5rem]"
        >
          <MessageCircle className="h-6 w-6 text-primary" />
          <p className="mt-3 font-semibold">Ask Navigator</p>
          <p className="text-xs text-muted-foreground mt-1">
            24/7 RAG assistant
          </p>
        </Link>
      </section>

      <section className="mt-4 px-5">
        <Link
          to="/emergency"
          className="nest-card p-4 flex items-center justify-between border-nest-coral/40"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-nest-coral/10 text-nest-coral">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Need help right now?</p>
              <p className="text-xs text-muted-foreground">
                Crisis lines, shelter, text support
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
};

export default Home;
