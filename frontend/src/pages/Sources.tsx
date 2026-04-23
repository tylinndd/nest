import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Phone } from "lucide-react";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  GEORGIA_RESOURCES,
  type Resource,
  type ResourceCategory,
} from "@/data/georgiaResources";
import { CORPUS_SIZE, formatVerifiedDate } from "@/lib/corpus";
import { DeployFooter } from "@/components/DeployFooter";
import { SkipToMain } from "@/components/layout/SkipToMain";

const groupAll = (): Record<ResourceCategory, Resource[]> => {
  const out = {} as Record<ResourceCategory, Resource[]>;
  for (const cat of CATEGORY_ORDER) out[cat] = [];
  for (const r of GEORGIA_RESOURCES) out[r.category].push(r);
  return out;
};

const formatISO = (iso: string): string => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const SourceRow = ({ r }: { r: Resource }) => (
  <li className="nest-card p-3 space-y-2">
    <div>
      <p className="font-display text-sm text-foreground leading-snug">
        {r.name}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {r.source_name} ·{" "}
        {r.county === "statewide" ? "Statewide" : `${r.county} County`}
        {r.last_verified && ` · verified ${formatISO(r.last_verified)}`}
      </p>
    </div>
    {r.summary && (
      <p className="text-xs text-muted-foreground leading-relaxed">
        {r.summary}
      </p>
    )}
    <div className="flex flex-wrap gap-2 pt-1">
      {r.contact_url && (
        <a
          href={r.contact_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/15 transition-colors"
        >
          <ExternalLink className="h-3 w-3" aria-hidden />
          Source
        </a>
      )}
      {r.contact_phone && (
        <a
          href={`tel:${r.contact_phone.replace(/[^0-9+]/g, "")}`}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Phone className="h-3 w-3" aria-hidden />
          {r.contact_phone}
        </a>
      )}
    </div>
  </li>
);

const Sources = () => {
  const grouped = groupAll();

  return (
    <>
    <SkipToMain />
    <main id="main-content" className="min-h-full bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-5 pt-6 pb-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/how-it-works"
            aria-label="Back to How it works"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Full corpus
          </span>
          <div className="h-11 w-11" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <h1 className="font-display text-3xl text-primary">
            Every source Navigator reads from.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {CORPUS_SIZE} Georgia resources, last audited{" "}
            {formatVerifiedDate()}. Grouped by topic. Each row links to the
            original document.
          </p>
        </motion.div>

        {CATEGORY_ORDER.map((cat) => {
          const rows = grouped[cat];
          if (rows.length === 0) return null;
          return (
            <section key={cat} className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABEL[cat]} ({rows.length})
              </p>
              <ul className="space-y-2">
                {rows.map((r) => (
                  <SourceRow key={r.id} r={r} />
                ))}
              </ul>
            </section>
          );
        })}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/navigator"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Ask Navigator
          </Link>
          <Link
            to="/how-it-works"
            className="flex-1 inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
          >
            Back to overview
          </Link>
        </div>

        <DeployFooter />
      </div>
    </main>
    </>
  );
};

export default Sources;
