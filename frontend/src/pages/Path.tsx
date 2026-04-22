import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  FileText,
  HeartPulse,
  Home as HomeIcon,
  GraduationCap,
  MessageSquare,
  Printer,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProfile,
  type HousingOption,
  type Profile,
} from "@/store/profile";
import { DOCUMENT_CATALOG } from "@/lib/personalize";
import { printPath, profileToPathData } from "@/lib/pathExport";

type ZoneState = "active" | "done";

type ZoneAction =
  | { kind: "ask"; prompt: string }
  | { kind: "route"; to: string };

type ZoneItem = {
  label: string;
  action: ZoneAction;
};

type Zone = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  state: ZoneState;
  Icon: typeof FileText;
  items: ZoneItem[];
};

const STABLE_HOUSING: Set<HousingOption> = new Set([
  "Foster home",
  "Group home",
  "Independent living program",
  "With a relative",
]);

const ask = (prompt: string): ZoneAction => ({ kind: "ask", prompt });
const route = (to: string): ZoneAction => ({ kind: "route", to });

const buildZones = (profile: Profile): Zone[] => {
  const uploadedSet = new Set(profile.uploadedDocs);
  const uploadedCount = DOCUMENT_CATALOG.filter((d) =>
    uploadedSet.has(d.id),
  ).length;
  const totalDocs = DOCUMENT_CATALOG.length;
  const docsDone = uploadedCount === totalDocs;

  const hasMedicaid = profile.health.includes("I have Medicaid right now");
  const needsPcp = profile.health.includes("I need a primary care doctor");
  const healthDone = hasMedicaid && !needsPcp;

  const housingDone =
    profile.housing !== "" && STABLE_HOUSING.has(profile.housing);
  const educationDone = profile.education !== null;

  return [
    {
      id: "documents",
      number: 1,
      title: "Stabilize documents",
      subtitle: docsDone
        ? `All ${totalDocs} documents secured in your vault.`
        : `${uploadedCount} of ${totalDocs} secured — keep going.`,
      state: docsDone ? "done" : "active",
      Icon: FileText,
      items: [
        {
          label: "Request birth certificate",
          action: ask("How do I get my birth certificate in Georgia?"),
        },
        {
          label: "Social Security card replacement",
          action: ask("How do I replace my Social Security card?"),
        },
        {
          label: "Georgia state ID or permit",
          action: ask("How do I get a Georgia state ID?"),
        },
      ],
    },
    {
      id: "health",
      number: 2,
      title: "Health & coverage",
      subtitle: healthDone
        ? "Medicaid confirmed and PCP in place."
        : "Extended Medicaid, primary care, mental health.",
      state: healthDone ? "done" : "active",
      Icon: HeartPulse,
      items: [
        {
          label: "Confirm Former Foster Medicaid",
          action: ask(
            "How do I confirm I qualify for Former Foster Care Medicaid in Georgia?",
          ),
        },
        {
          label: "Find a primary care doctor",
          action: ask("How do I find a primary care doctor that takes Medicaid?"),
        },
        {
          label: "Connect with a therapist",
          action: ask("How do I find a therapist that takes Medicaid?"),
        },
      ],
    },
    {
      id: "housing",
      number: 3,
      title: "Housing plan",
      subtitle: housingDone
        ? `Living in a ${profile.housing.toLowerCase()} — keep your backup plan current.`
        : "Transitional, shared, or campus — secure a bed.",
      state: housingDone ? "done" : "active",
      Icon: HomeIcon,
      items: [
        {
          label: "Apply for HUD FYI voucher",
          action: ask(
            "How do I apply for the HUD Foster Youth to Independence (FYI) voucher?",
          ),
        },
        {
          label: "Tour a transitional living program",
          action: ask(
            "How do I tour a transitional living program near me in Georgia?",
          ),
        },
        {
          label: "Line up emergency shelter backup",
          action: route("/emergency"),
        },
      ],
    },
    {
      id: "education",
      number: 4,
      title: "Education or career",
      subtitle: educationDone
        ? profile.education === "college"
          ? "College-bound — Chafee ETV + KSU ASCEND on your task list."
          : profile.education === "trade"
            ? "Trade track — tuition waiver on your task list."
            : "Working — we'll surface employment supports as you go."
        : "School, trade, or work — with the right funding.",
      state: educationDone ? "done" : "active",
      Icon: GraduationCap,
      items: [
        {
          label: "Submit Chafee ETV application",
          action: ask("How do I submit a Chafee-ETV application?"),
        },
        {
          label: "Check Georgia Post-Secondary Tuition Waiver",
          action: ask(
            "Do I qualify for the Georgia Post-Secondary Tuition Waiver?",
          ),
        },
        {
          label: "Book KSU ASCEND intake call",
          action: ask("How do I book a KSU ASCEND intake call?"),
        },
      ],
    },
    {
      id: "money",
      number: 5,
      title: "Money & independence",
      subtitle: "Banking, budgeting, first credit.",
      state: "active",
      Icon: Wallet,
      items: [
        {
          label: "Open a checking + savings account",
          action: route("/money"),
        },
        {
          label: "Build a first monthly budget",
          action: route("/money"),
        },
        {
          label: "Claim EYSS monthly stipend",
          action: ask("How do I claim the EYSS monthly stipend in Georgia?"),
        },
      ],
    },
  ];
};

const stateStyle: Record<ZoneState, { ring: string; icon: string; badge: string }> = {
  active: {
    ring: "border-nest-amber bg-card",
    icon: "bg-nest-amber text-white",
    badge: "bg-nest-amber/15 text-nest-amber",
  },
  done: {
    ring: "border-nest-sage bg-card",
    icon: "bg-nest-sage text-white",
    badge: "bg-nest-sage/15 text-[#2E7D5B]",
  },
};

const Path = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const profile = useProfile();
  const zones = useMemo(() => buildZones(profile), [profile]);
  const doneCount = zones.filter((z) => z.state === "done").length;

  const handleItem = (item: ZoneItem) => {
    if (item.action.kind === "ask") {
      navigate("/navigator", { state: { askPrompt: item.action.prompt } });
    } else {
      navigate(item.action.to);
    }
  };

  const handlePrint = () => {
    printPath(profileToPathData(profile));
  };

  return (
    <div className="px-5 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">Overview</p>
      <h1 className="font-display text-3xl text-primary">The Path</h1>
      <p className="mt-2 text-muted-foreground">
        {doneCount === 0
          ? "Five zones to stabilize your transition. Start anywhere."
          : doneCount === zones.length
            ? "All five zones are in a good place — keep it that way."
            : `${doneCount} of ${zones.length} zones in a good place.`}
      </p>

      <button
        type="button"
        onClick={handlePrint}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Printer className="h-3.5 w-3.5" />
        Print your path
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          One page
        </span>
      </button>

      <ol className="relative mt-8 pl-4">
        <span
          aria-hidden
          className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-border"
        />
        {zones.map((z, i) => {
          const s = stateStyle[z.state];
          const StatusIcon = z.state === "done" ? CheckCircle2 : Circle;
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
                    {z.state === "done" ? "Done" : "In progress"}
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {z.items.map((item) => {
                    const isAsk = item.action.kind === "ask";
                    const ActionIcon = isAsk ? MessageSquare : ArrowUpRight;
                    const hint = isAsk
                      ? "Ask Navigator"
                      : item.action.kind === "route"
                        ? item.action.to.startsWith("/")
                          ? `Go to ${item.action.to.replace("/", "")}`
                          : "Open"
                        : "Open";
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => handleItem(item)}
                          className="group flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span
                            className={cn(
                              "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                              z.state === "done" ? "bg-nest-sage" : "bg-nest-amber",
                            )}
                          />
                          <span className="flex-1">
                            {item.label}
                            <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 group-hover:text-muted-foreground">
                              {hint}
                            </span>
                          </span>
                          <ActionIcon
                            aria-hidden
                            className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition group-hover:text-primary"
                          />
                        </button>
                      </li>
                    );
                  })}
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
