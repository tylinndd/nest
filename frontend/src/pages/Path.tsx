import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Lock,
  FileText,
  HeartPulse,
  Home as HomeIcon,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ZoneState = "active" | "locked" | "done";

type Zone = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  state: ZoneState;
  Icon: typeof FileText;
  items: string[];
};

const zones: Zone[] = [
  {
    id: "documents",
    number: 1,
    title: "Stabilize documents",
    subtitle: "Prove who you are so everything else works.",
    state: "active",
    Icon: FileText,
    items: [
      "Request birth certificate",
      "Social Security card replacement",
      "Georgia state ID or permit",
    ],
  },
  {
    id: "health",
    number: 2,
    title: "Health & coverage",
    subtitle: "Extended Medicaid, primary care, mental health.",
    state: "locked",
    Icon: HeartPulse,
    items: [
      "Confirm Former Foster Medicaid",
      "Find a primary care doctor",
      "Connect with a therapist",
    ],
  },
  {
    id: "housing",
    number: 3,
    title: "Housing plan",
    subtitle: "Transitional, shared, or campus — secure a bed.",
    state: "locked",
    Icon: HomeIcon,
    items: [
      "Apply for HUD FYI voucher",
      "Tour a transitional living program",
      "Line up emergency shelter backup",
    ],
  },
  {
    id: "education",
    number: 4,
    title: "Education or career",
    subtitle: "School, trade, or work — with the right funding.",
    state: "locked",
    Icon: GraduationCap,
    items: [
      "Submit Chafee ETV application",
      "Check HB 136 tuition waiver",
      "Book KSU ASCEND intake call",
    ],
  },
  {
    id: "money",
    number: 5,
    title: "Money & independence",
    subtitle: "Banking, budgeting, first credit.",
    state: "locked",
    Icon: Wallet,
    items: [
      "Open a checking + savings account",
      "Build a first monthly budget",
      "Claim EYSS monthly stipend",
    ],
  },
];

const stateStyle: Record<ZoneState, { ring: string; icon: string; badge: string }> = {
  active: {
    ring: "border-nest-amber bg-card",
    icon: "bg-nest-amber text-white",
    badge: "bg-nest-amber/15 text-nest-amber",
  },
  locked: {
    ring: "border-border bg-card",
    icon: "bg-muted text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  done: {
    ring: "border-nest-sage bg-card",
    icon: "bg-nest-sage text-white",
    badge: "bg-nest-sage/15 text-[#2E7D5B]",
  },
};

const Path = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="px-5 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">Overview</p>
      <h1 className="font-display text-3xl text-primary">The Path</h1>
      <p className="mt-2 text-muted-foreground">
        Five zones, in order. Finish one to unlock the next.
      </p>

      <ol className="relative mt-8 pl-4">
        <span
          aria-hidden
          className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-border"
        />
        {zones.map((z, i) => {
        const s = stateStyle[z.state];
        const StatusIcon =
          z.state === "done" ? CheckCircle2 : z.state === "locked" ? Lock : Circle;
        return (
          <motion.li
            key={z.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06, ease: "easeOut" }}
            className="relative mb-4 flex gap-4"
          >
            <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center">
              {z.state === "active" && !prefersReducedMotion && (
                <motion.span
                  aria-hidden
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 z-0 rounded-full bg-nest-amber"
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-11 w-11 items-center justify-center rounded-full ring-4 ring-background",
                  s.icon,
                )}
              >
                <z.Icon className="h-5 w-5" />
              </span>
            </span>
            <div className={cn("flex-1 rounded-3xl border p-5 transition", s.ring)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Zone 0{z.number}
                  </p>
                  <h2 className="mt-1 font-display text-lg text-foreground">
                    {z.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{z.subtitle}</p>
                </div>
                <span
                  className={cn(
                    "nest-chip shrink-0",
                    s.badge,
                  )}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {z.state === "active" ? "In progress" : z.state === "locked" ? "Locked" : "Done"}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {z.items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      z.state === "locked"
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        z.state === "active"
                          ? "bg-nest-amber"
                          : z.state === "done"
                            ? "bg-nest-sage"
                            : "bg-border",
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        );
      })}
    </ol>
  </div>
  );
};

export default Path;
