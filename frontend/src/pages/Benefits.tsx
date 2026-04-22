import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, BadgeCheck, ShieldCheck, ExternalLink, Compass, MapPinned, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { benefits, type Benefit, type BenefitStatus } from "@/data/placeholder";
import { useProfile, hasProfile } from "@/store/profile";
import { useIntake } from "@/store/intake";
import { cn } from "@/lib/utils";

const formatVerified = (iso: string) => {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

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
  const verifiedLabel = b.verifiedOn ? formatVerified(b.verifiedOn) : null;
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
      className="nest-card p-5 transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "nest-chip",
            badge.className,
            b.status === "qualify" && "nest-shimmer",
          )}
        >
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
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        {verifiedLabel && (
          <span
            className="nest-chip bg-muted text-muted-foreground"
            title={`Last verified against the source on ${verifiedLabel}`}
          >
            <ShieldCheck className="mr-1 h-3 w-3" strokeWidth={2.5} />
            Verified {verifiedLabel}
          </span>
        )}
        {cta && b.href && (
          <a
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "nest-pill min-h-[2.75rem] font-semibold",
              b.status === "auto"
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {cta}
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        )}
        {cta && !b.href && (
          <button
            type="button"
            onClick={() =>
              toast.info(cta, {
                id: "benefit-cta",
                description: `Ask your caseworker — ${b.title} is coordinated in person.`,
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
        )}
      </div>
    </motion.article>
  );
};

const BestFitCard = ({ url }: { url: string }) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    transition={{ duration: 0.28, ease: "easeOut" }}
    className="nest-card block p-5 border-primary/25 bg-primary/[0.04] transition-shadow duration-200 hover:shadow-lg"
  >
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          More Georgia benefits
        </p>
        <h2 className="mt-1 font-display text-lg text-foreground leading-tight">
          Explore SNAP, cash assistance, and more on BestFit
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Georgia's public benefits screener, pre-filled to your county.
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Open BestFit
          <ExternalLink className="h-4 w-4" />
        </span>
      </div>
    </div>
  </motion.a>
);

type PartnerCard = {
  id: string;
  url: string;
  label: string;
  title: string;
  summary: string;
  cta: string;
  Icon: typeof Compass;
};

const PARTNERS: PartnerCard[] = [
  {
    id: "hopemap",
    url: "https://hopemapgeorgia.org/",
    label: "Georgia · State resource map",
    title: "HopeMap Georgia",
    summary:
      "Housing, medical, food, and support services across the state — mapped by county. Recommended by Georgia school social workers.",
    cta: "Open HopeMap",
    Icon: MapPinned,
  },
  {
    id: "embark",
    url: "https://embarkgeorgia.org/",
    label: "Georgia · Foster-youth network",
    title: "Embark Georgia",
    summary:
      "Housed at UGA's J.W. Fanning Institute — scholarships, state-wide contacts, and the statewide coordinator for Chafee ETV.",
    cta: "Open Embark",
    Icon: Sparkles,
  },
];

const PartnerCardView = ({ p, index }: { p: PartnerCard; index: number }) => (
  <motion.a
    href={p.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
    className="nest-card block p-5 transition-shadow duration-200 hover:shadow-lg"
  >
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <p.Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {p.label}
        </p>
        <h3 className="mt-1 font-display text-lg text-foreground leading-tight">
          {p.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {p.cta}
          <ExternalLink className="h-4 w-4" />
        </span>
      </div>
    </div>
  </motion.a>
);

const Benefits = () => {
  const profile = useProfile();
  const fetchIntake = useIntake((s) => s.fetchIntake);
  const bestfitUrl = useIntake((s) => s.bestfitUrl);
  const qualifyCount = benefits.filter((b) => b.status === "qualify").length;
  const actionCount = benefits.filter((b) => b.status === "action").length;

  useEffect(() => {
    if (!hasProfile(profile)) return;
    void fetchIntake(profile);
  }, [fetchIntake, profile]);

  return (
    <div className="px-5 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">Matched to your profile</p>
      <h1 className="font-display text-3xl text-primary">Benefits</h1>
      <p className="mt-2 text-muted-foreground">
        {benefits.length} Georgia programs, sorted by what to do first.
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
        {bestfitUrl && <BestFitCard url={bestfitUrl} />}
      </div>

      <h2 className="mt-10 font-display text-xl text-primary">
        Statewide resources
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Trusted directories beyond this app — bookmark both.
      </p>
      <div className="mt-4 space-y-3">
        {PARTNERS.map((p, i) => (
          <PartnerCardView key={p.id} p={p} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Benefits;
