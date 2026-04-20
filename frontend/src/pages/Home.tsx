import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  animate,
  AnimatePresence,
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
import { type Task } from "@/data/placeholder";
import { derivePersonalizedTasks, computeDaysUntilAgeOut } from "@/lib/personalize";
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
import { safeStorage } from "@/lib/safeStorage";
import { cn } from "@/lib/utils";

const FIRST_TASK_KEY = "nest.first-task-fired";

const fireFirstTaskConfetti = () => {
  const colors = ["#52B788", "#D97706", "#E07B6A", "#1B4332"];
  const defaults = {
    startVelocity: 35,
    spread: 70,
    ticks: 60,
    gravity: 0.9,
    scalar: 0.9,
    colors,
  };
  confetti({
    ...defaults,
    particleCount: 60,
    origin: { x: 0.2, y: 0.7 },
    angle: 60,
  });
  confetti({
    ...defaults,
    particleCount: 60,
    origin: { x: 0.8, y: 0.7 },
    angle: 120,
  });
};

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

const UnknownAgeCard = ({ progress }: { progress: number }) => (
  <div className="nest-card p-6 bg-primary text-primary-foreground">
    <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
      Your plan
    </p>
    <p className="mt-3 font-display text-3xl leading-tight">
      Tell us your age to unlock the countdown.
    </p>
    <Link
      to="/onboarding/age"
      className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-semibold transition hover:bg-primary-foreground/15"
    >
      Add your age
      <ArrowRight className="h-4 w-4" />
    </Link>
    <div
      role="progressbar"
      aria-label="Week-one checklist progress"
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
);

const AllCaughtUpCard = () => (
  <div className="nest-card p-5 border-nest-sage/40 bg-nest-sage/5">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-nest-sage/15 text-[#2E7D5B]">
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D5B]">
          All caught up
        </p>
        <p className="mt-2 font-display text-xl text-primary leading-tight">
          Nothing pressing right now.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nest will flag your next step as your aging-out date gets closer.
        </p>
      </div>
    </div>
  </div>
);

const NextMoveCard = ({
  task,
  onOpen,
}: {
  task: Task;
  onOpen: (t: Task) => void;
}) => {
  const isOverdue = task.status === "overdue";
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className={cn(
        "group w-full nest-card p-5 text-left transition active:scale-[0.995]",
        isOverdue
          ? "border-nest-coral/40 hover:border-nest-coral"
          : "border-nest-amber/40 hover:border-nest-amber",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-widest",
          isOverdue ? "text-nest-coral" : "text-nest-amber",
        )}
      >
        Your next move
      </p>
      <p className="mt-2 font-display text-xl text-primary leading-tight">
        {task.title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{task.due}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Start now
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
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

const SWIPE_OFFSET_THRESHOLD = -80;
const SWIPE_VELOCITY_THRESHOLD = -300;

const TaskRow = ({
  t,
  onOpen,
  onComplete,
}: {
  t: Task;
  onOpen: (task: Task) => void;
  onComplete: (task: Task) => void;
}) => {
  const tone = t.tone ?? (t.status === "overdue" ? "coral" : t.status === "week" ? "amber" : "sage");
  const Icon = statusIcon[t.status];
  const reduceMotion = useReducedMotion();
  const swipeable = t.status !== "done" && !reduceMotion;
  const x = useMotionValue(0);
  const actionOpacity = useTransform(x, [SWIPE_OFFSET_THRESHOLD, -10, 0], [1, 0.4, 0]);
  return (
    <motion.div
      layoutId={`task-${t.id}`}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative"
    >
      {swipeable && (
        <motion.div
          aria-hidden
          style={{ opacity: actionOpacity }}
          className="pointer-events-none absolute inset-0 flex items-center justify-end rounded-2xl bg-nest-sage pr-5 text-sm font-semibold text-white"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Done
        </motion.div>
      )}
      <motion.div
        drag={swipeable ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.65, right: 0 }}
        dragDirectionLock
        style={{ x, touchAction: "pan-y" }}
        onDragEnd={(_, info) => {
          const past =
            info.offset.x < SWIPE_OFFSET_THRESHOLD ||
            info.velocity.x < SWIPE_VELOCITY_THRESHOLD;
          if (past) {
            x.set(0);
            onComplete(t);
          }
        }}
        className={cn(
          "nest-card p-4 border-l-4 relative",
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
    </motion.div>
  );
};

const Home = () => {
  const profile = useProfile();
  const markTaskDone = useProfile((s) => s.markTaskDone);
  const taskList = useMemo(() => derivePersonalizedTasks(profile), [profile]);
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

  const displayName = profile.name.trim();
  const displayAge = profile.age;
  const displayCounty = profile.county ? `${profile.county} County` : null;
  const daysUntilExit = computeDaysUntilAgeOut(profile.age);
  const hasAge = daysUntilExit !== null;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const overdue = useMemo(() => taskList.filter((t) => t.status === "overdue"), [taskList]);
  const week = useMemo(() => taskList.filter((t) => t.status === "week"), [taskList]);
  const done = useMemo(() => taskList.filter((t) => t.status === "done"), [taskList]);
  const nextMove = useMemo<Task | null>(
    () => overdue[0] ?? week[0] ?? null,
    [overdue, week],
  );
  const overdueRest = useMemo(
    () => overdue.filter((t) => t.id !== nextMove?.id),
    [overdue, nextMove],
  );
  const weekRest = useMemo(
    () => week.filter((t) => t.id !== nextMove?.id),
    [week, nextMove],
  );

  const progress =
    taskList.length === 0
      ? 100
      : Math.round((done.length / taskList.length) * 100);

  const reduceMotion = useReducedMotion();
  const daysTarget = daysUntilExit ?? 0;
  const daysCount = useMotionValue(reduceMotion ? daysTarget : 0);
  const daysRounded = useTransform(daysCount, (v) => Math.round(v));
  useEffect(() => {
    if (!hasAge) return;
    if (reduceMotion) {
      daysCount.set(daysTarget);
      return;
    }
    const controls = animate(daysCount, daysTarget, {
      duration: 1.1,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [daysCount, daysTarget, hasAge, reduceMotion]);

  const openTask = (task: Task) => setActiveTask(task);

  const completeTask = (task: Task) => {
    if (task.status === "done") return;
    markTaskDone(task.id);
    setCompletedId(task.id);
    if (!reduceMotion && !safeStorage.getItem(FIRST_TASK_KEY)) {
      fireFirstTaskConfetti();
      safeStorage.setItem(FIRST_TASK_KEY, "1");
    }
    if (completedTimerRef.current !== null) {
      window.clearTimeout(completedTimerRef.current);
    }
    completedTimerRef.current = window.setTimeout(() => {
      setCompletedId(null);
      completedTimerRef.current = null;
    }, 2400);
  };

  const handleMarkDone = () => {
    if (!activeTask) return;
    const task = activeTask;
    setActiveTask(null);
    completeTask(task);
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
            {(displayCounty || displayAge !== null) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[displayCounty, displayAge !== null ? `Age ${displayAge}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <Link
            to="/onboarding"
            aria-label="Edit your profile"
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition hover:bg-secondary/80"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="px-5 mt-5">
        {hasAge ? (
          <HeroCard
            days={daysRounded}
            progress={progress}
            reduceMotion={!!reduceMotion}
          />
        ) : (
          <UnknownAgeCard progress={progress} />
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {nextMove ? (
          <motion.div
            key="next-move"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="px-5 mt-4"
          >
            <NextMoveCard task={nextMove} onOpen={openTask} />
          </motion.div>
        ) : done.length > 0 ? (
          <motion.div
            key="all-caught-up"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="px-5 mt-4"
          >
            <AllCaughtUpCard />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="px-5 mt-4">
        <SuccessCard
          show={!!completedTask}
          title="Logged"
          detail={completedTask ? completedTask.title : undefined}
        />
      </div>

      <LayoutGroup>
        {overdueRest.length > 0 && (
          <Section title="Overdue" count={overdueRest.length}>
            {overdueRest.map((t) => (
              <TaskRow key={t.id} t={t} onOpen={openTask} onComplete={completeTask} />
            ))}
          </Section>
        )}

        {weekRest.length > 0 && (
          <Section title="This week" count={weekRest.length}>
            {weekRest.map((t) => (
              <TaskRow key={t.id} t={t} onOpen={openTask} onComplete={completeTask} />
            ))}
          </Section>
        )}

        {done.length > 0 && (
          <Section title="Completed" count={done.length}>
            {done.map((t) => (
              <TaskRow key={t.id} t={t} onOpen={openTask} onComplete={completeTask} />
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
