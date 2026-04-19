import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { benefits, type Benefit, type BenefitStatus } from "@/data/placeholder";
import { cn } from "@/lib/utils";

const statusBadge: Record<BenefitStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  qualify: {
    label: "You qualify",
    className: "bg-nest-sage/15 text-[#2E7D5B]",
    Icon: CheckCircle2,
  },
  action: {
    label: "Action needed",
    className: "bg-nest-amber/15 text-nest-amber",
    Icon: AlertCircle,
  },
  auto: {
    label: "Auto-enrolled",
    className: "bg-primary/10 text-primary",
    Icon: BadgeCheck,
  },
};

const BenefitCard = ({ b, index }: { b: Benefit; index: number }) => {
  const badge = statusBadge[b.status];
  const Icon = badge.Icon;
  const cta = b.cta;
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
      className="nest-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn("nest-chip", badge.className)}>
          <Icon className="mr-1 h-3 w-3" strokeWidth={2.5} />
          {badge.label}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {b.source}
        </span>
      </div>
      <h2 className="mt-3 font-display text-xl text-foreground leading-tight">
        {b.title}
      </h2>
      <p className="mt-1 text-xs font-medium text-primary/80">{b.eligibility}</p>
      <p className="mt-3 text-sm text-muted-foreground">{b.summary}</p>
      {cta && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              toast.info(cta, {
                id: "benefit-cta",
                description: `${b.title} flow lands in the next build.`,
              })
            }
            className={cn(
              "nest-pill min-h-[2.75rem] font-semibold",
              b.status === "auto"
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {cta}
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      )}
    </motion.article>
  );
};

const Benefits = () => {
  const qualifyCount = benefits.filter((b) => b.status === "qualify").length;
  const actionCount = benefits.filter((b) => b.status === "action").length;
  return (
    <div className="px-5 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">Matched to your profile</p>
      <h1 className="font-display text-3xl text-primary">Benefits</h1>
      <p className="mt-2 text-muted-foreground">
        Six Georgia programs, sorted by what to do first.
      </p>

      <div className="mt-4 flex gap-2 text-xs font-semibold">
        <span className="nest-chip bg-nest-sage/15 text-[#2E7D5B]">
          {qualifyCount} qualify
        </span>
        <span className="nest-chip bg-nest-amber/15 text-nest-amber">
          {actionCount} need action
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {benefits.map((b, i) => (
          <BenefitCard key={b.id} b={b} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Benefits;
