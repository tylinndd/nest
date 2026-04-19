import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Doc = {
  id: string;
  title: string;
  detail: string;
  state: "uploaded" | "missing" | "requested";
};

const docs: Doc[] = [
  { id: "ssc", title: "Social Security card", detail: "Uploaded Apr 2, 2026", state: "uploaded" },
  { id: "medicaid", title: "Medicaid card", detail: "Uploaded Apr 10, 2026", state: "uploaded" },
  { id: "birth", title: "Birth certificate", detail: "Vital Records request filed", state: "requested" },
  { id: "id", title: "Georgia state ID", detail: "Missing — we'll guide you", state: "missing" },
  { id: "transcript", title: "High school transcript", detail: "Missing — we'll guide you", state: "missing" },
];

const stateMeta = {
  uploaded: {
    label: "Secured",
    chip: "bg-nest-sage/15 text-[#2E7D5B]",
    icon: CheckCircle2,
    border: "border-l-nest-sage",
  },
  requested: {
    label: "In progress",
    chip: "bg-nest-amber/15 text-nest-amber",
    icon: CircleDashed,
    border: "border-l-nest-amber",
  },
  missing: {
    label: "Add now",
    chip: "bg-nest-coral/15 text-nest-coral",
    icon: Plus,
    border: "border-l-nest-coral",
  },
} as const;

const Vault = () => {
  const secured = docs.filter((d) => d.state === "uploaded").length;
  return (
    <div className="px-5 pt-5 pb-6">
      <p className="text-sm text-muted-foreground">Encrypted on your device</p>
      <h1 className="font-display text-3xl text-primary">Document Vault</h1>
      <p className="mt-2 text-muted-foreground">
        Every ID, letter, and record in one place.
      </p>

      <div className="mt-5 nest-card p-5 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
            Your vault
          </span>
        </div>
        <p className="mt-3 font-display text-3xl">
          {secured} of {docs.length} secured
        </p>
        <div className="mt-4 h-1 rounded-full bg-primary-foreground/20 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(secured / docs.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-nest-sage"
          />
        </div>
        <p className="mt-3 text-xs opacity-80">
          End-to-end encrypted · passcode required to open
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {docs.map((d, i) => {
          const m = stateMeta[d.state];
          const Icon = m.icon;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.04 }}
              className={cn("nest-card p-4 flex items-center gap-4 border-l-4", m.border)}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  d.state === "uploaded"
                    ? "bg-nest-sage text-white"
                    : d.state === "requested"
                      ? "bg-nest-amber/15 text-nest-amber"
                      : "bg-muted text-foreground",
                )}
              >
                {d.state === "uploaded" ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.detail}</p>
              </div>
              <span className={cn("nest-chip", m.chip)}>
                {d.state === "requested" ? (
                  <motion.span
                    aria-hidden
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-1 inline-flex"
                  >
                    <Icon className="h-3 w-3" />
                  </motion.span>
                ) : (
                  <Icon className="mr-1 h-3 w-3" />
                )}
                {m.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-border bg-card py-4 text-sm font-semibold text-primary min-h-[3.5rem]">
        <Plus className="h-4 w-4" />
        Add another document
      </button>
    </div>
  );
};

export default Vault;
