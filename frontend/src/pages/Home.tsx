import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderLock,
  MessageCircle,
  ArrowRight,
  LifeBuoy,
  Pencil,
} from "lucide-react";
import { user, tasks, type Task } from "@/data/placeholder";
import { SuccessCard } from "@/components/ui/SuccessCard";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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

const HeroCard = ({
  days,
  progress,
  reduceMotion,
}: {
  days: MotionValue<number>;
  progress: number;
  reduceMotion: boolean;
}) => {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(82,183,136,0.22), transparent 55%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleLeave = () => {
    mouseX.set(-200);
    mouseY.set(-200);
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="nest-card p-6 bg-primary text-primary-foreground overflow-hidden relative group"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
          Your 90-day plan
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <motion.span className="font-display text-[5rem] leading-none tabular-nums">
            {days}
          </motion.span>
          <span className="text-base opacity-90">days until you age out</span>
        </div>
        <div
          role="progressbar"
          aria-label="90-day plan progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-5 h-1 rounded-full bg-primary-foreground/20 overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
            className="h-full bg-nest-sage"
          />
        </div>
        <p className="mt-2 text-xs opacity-80">
          {progress}% of week-one checklist complete
        </p>
      </div>
    </div>
  );
};

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
  onOpen,
}: {
  t: Task;
  onOpen: (task: Task) => void;
}) => {
  const tone = t.tone ?? (t.status === "overdue" ? "coral" : t.status === "week" ? "amber" : "sage");
  const Icon = statusIcon[t.status];
  return (
    <motion.div
      layout
      layoutId={`task-${t.id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.24,
        layout: { type: "spring", stiffness: 260, damping: 30 },
      }}
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
              onClick={() => onOpen(t)}
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
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const completedTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (completedTimerRef.current !== null) {
        window.clearTimeout(completedTimerRef.current);
      }
    },
    [],
  );
  const profileName = useProfile((s) => s.name);
  const profileAge = useProfile((s) => s.age);
  const profileCounty = useProfile((s) => s.county);

  const displayName = profileName.trim() || user.name;
  const displayAge = profileAge ?? user.age;
  const displayCounty = profileCounty ? `${profileCounty} County` : user.county;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const overdue = useMemo(() => taskList.filter((t) => t.status === "overdue"), [taskList]);
  const week = useMemo(() => taskList.filter((t) => t.status === "week"), [taskList]);
  const done = useMemo(() => taskList.filter((t) => t.status === "done"), [taskList]);

  const progress = Math.round((done.length / taskList.length) * 100);

  const reduceMotion = useReducedMotion();
  const daysCount = useMotionValue(reduceMotion ? user.daysUntilExit : 0);
  const daysRounded = useTransform(daysCount, (v) => Math.round(v));
  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(daysCount, user.daysUntilExit, {
      duration: 1.1,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [daysCount, reduceMotion]);

  const openTask = (task: Task) => setActiveTask(task);

  const handleMarkDone = () => {
    if (!activeTask) return;
    const completingId = activeTask.id;
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === completingId
          ? { ...t, status: "done" as const, tone: "sage" as const, due: "Completed" }
          : t,
      ),
    );
    setCompletedId(completingId);
    setActiveTask(null);
    if (completedTimerRef.current !== null) {
      window.clearTimeout(completedTimerRef.current);
    }
    completedTimerRef.current = window.setTimeout(() => {
      setCompletedId(null);
      completedTimerRef.current = null;
    }, 2400);
  };

  const completedTask = completedId
    ? taskList.find((t) => t.id === completedId) ?? null
    : null;

  return (
    <div className="pb-6">
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{greeting},</p>
            <h1 className="font-display text-3xl text-primary">{displayName}.</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {displayCounty} · Age {displayAge}
            </p>
          </div>
          <Link
            to="/onboarding"
            aria-label="Edit your profile"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition hover:bg-secondary/80"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="px-5 mt-5">
        <HeroCard
          days={daysRounded}
          progress={progress}
          reduceMotion={!!reduceMotion}
        />
      </div>

      <div className="px-5 mt-4">
        <SuccessCard
          show={!!completedTask}
          title="Logged"
          detail={completedTask ? completedTask.title : undefined}
        />
      </div>

      <LayoutGroup>
        {overdue.length > 0 && (
          <Section title="Overdue" count={overdue.length}>
            {overdue.map((t) => (
              <TaskRow key={t.id} t={t} onOpen={openTask} />
            ))}
          </Section>
        )}

        {week.length > 0 && (
          <Section title="This week" count={week.length}>
            {week.map((t) => (
              <TaskRow key={t.id} t={t} onOpen={openTask} />
            ))}
          </Section>
        )}

        {done.length > 0 && (
          <Section title="Completed" count={done.length}>
            {done.map((t) => (
              <TaskRow key={t.id} t={t} onOpen={openTask} />
            ))}
          </Section>
        )}
      </LayoutGroup>

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

      <Drawer
        open={activeTask !== null}
        onOpenChange={(o) => !o && setActiveTask(null)}
      >
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl text-primary">
              {activeTask?.title}
            </DrawerTitle>
            {activeTask?.guide && (
              <DrawerDescription>{activeTask.guide.subtitle}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-4">
            {activeTask?.guide ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Source · {activeTask.guide.source}
                </span>
                <ol className="space-y-3">
                  {activeTask.guide.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Step-by-step guidance will load here once your Navigator pulls
                the latest DFCS source.
              </p>
            )}
          </div>
          <DrawerFooter>
            <Button
              onClick={handleMarkDone}
              className="rounded-full h-12 font-semibold"
            >
              Mark as done
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Home;
