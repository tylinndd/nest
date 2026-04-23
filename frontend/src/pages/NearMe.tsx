import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  DollarSign,
  ExternalLink,
  FileText,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Home as HomeIcon,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
} from "lucide-react";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type Resource,
  type ResourceCategory,
  groupByCategory,
  selectResourcesForCounty,
} from "@/data/georgiaResources";
import { useProfile } from "@/store/profile";

const CATEGORY_ICON: Record<ResourceCategory, typeof HomeIcon> = {
  crisis: AlertTriangle,
  housing: HomeIcon,
  healthcare: HeartPulse,
  education: GraduationCap,
  employment: Briefcase,
  financial: DollarSign,
  documents: FileText,
  legal: Scale,
  benefits: HandCoins,
};

const formatPhone = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
};

const telHref = (raw: string) => `tel:${raw.replace(/[^\d]/g, "")}`;

const ResourceCard = ({ r, index }: { r: Resource; index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
    className="nest-card p-4"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <h3 className="font-display text-base text-foreground leading-tight">
          {r.name}
        </h3>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {r.county === "statewide" ? "Statewide" : `${r.county} County`}
        </p>
      </div>
      <span className="nest-chip bg-muted text-muted-foreground shrink-0">
        <ShieldCheck className="mr-1 h-3 w-3" strokeWidth={2.5} />
        {r.source_name}
      </span>
    </div>

    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
      {r.summary}
    </p>

    {r.services.length > 0 && (
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {r.services.slice(0, 5).map((s) => (
          <li
            key={s}
            className="rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
          >
            {s}
          </li>
        ))}
      </ul>
    )}

    <div className="mt-3 flex flex-wrap gap-2">
      {r.contact_phone && (
        <a
          href={telHref(r.contact_phone)}
          className="nest-pill min-h-[2.5rem] bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Phone className="mr-1 h-4 w-4" />
          {formatPhone(r.contact_phone)}
        </a>
      )}
      {r.contact_url && (
        <a
          href={r.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="nest-pill min-h-[2.5rem] bg-secondary text-secondary-foreground text-sm font-semibold"
        >
          Open site
          <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      )}
    </div>
  </motion.article>
);

const NearMe = () => {
  const county = useProfile((s) => s.county);
  const list = useMemo(() => selectResourcesForCounty(county), [county]);
  const grouped = useMemo(() => groupByCategory(list), [list]);
  const countyLabel = county.trim() || "Statewide only";

  return (
    <div className="px-5 pt-5 pb-6">
      <p className="text-sm text-muted-foreground">Resources near you</p>
      <h1 className="font-display text-3xl text-primary">Near you</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verified Georgia services — filtered to{" "}
        <span className="font-semibold text-foreground">{countyLabel}</span>
        {county.trim() && (
          <>
            {" "}
            plus statewide lines.{" "}
            <Link to="/settings" className="font-semibold text-primary hover:underline">
              Change county
            </Link>
          </>
        )}
      </p>

      {!county.trim() && (
        <div className="nest-card mt-4 border-primary/30 bg-primary/[0.04] p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Add your county to unlock local listings
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Right now you'll only see statewide lines. Set your county in
                Settings to surface the closest offices.
              </p>
              <Link
                to="/settings"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Open Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {CATEGORY_ORDER.map((cat) => {
          const bucket = grouped[cat];
          if (!bucket || bucket.length === 0) return null;
          const Icon = CATEGORY_ICON[cat];
          return (
            <section key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="font-display text-lg text-foreground">
                  {CATEGORY_LABEL[cat]}
                </h2>
                <span className="text-xs text-muted-foreground">
                  · {bucket.length}
                </span>
              </div>
              <div className="space-y-3">
                {bucket.map((r, i) => (
                  <ResourceCard key={r.id} r={r} index={i} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-[11px] text-muted-foreground">
        Listings are hand-verified against each agency's own site. If something
        looks stale, tell us in Settings → Feedback.
      </p>
    </div>
  );
};

export default NearMe;
