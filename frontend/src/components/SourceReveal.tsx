import { useState } from "react";
import { BadgeCheck, AlertCircle, ExternalLink, Quote } from "lucide-react";
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
import { useProfile, type EducationPlan } from "@/store/profile";
import type { Passage } from "@/lib/api";
import { formatVerifiedDate } from "@/lib/corpus";
import { buildPassageHref } from "@/lib/textFragment";
import { safeHttpUrl } from "@/lib/url";

type Props = {
  source: string;
  showProfile?: boolean;
  passages?: Passage[];
};

const EDUCATION_LABEL: Record<EducationPlan, string> = {
  college: "Heading to college",
  trade: "Heading to trade school",
  working: "Heading to work, not school",
};

export function SourceReveal({
  source,
  showProfile = false,
  passages = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const name = useProfile((s) => s.name);
  const age = useProfile((s) => s.age);
  const county = useProfile((s) => s.county);
  const education = useProfile((s) => s.education);
  const housing = useProfile((s) => s.housing);

  const facts: { label: string; value: string }[] = [];
  if (age !== null) facts.push({ label: "Age", value: `${age}` });
  if (county.trim()) facts.push({ label: "County", value: `${county} County` });
  if (education) facts.push({ label: "Plan", value: EDUCATION_LABEL[education] });
  if (housing) facts.push({ label: "Living now", value: housing });

  const renderProfileCard = showProfile && facts.length > 0;
  const confidence =
    passages.length === 0
      ? null
      : passages.length >= 3
        ? {
            label: `Strong · ${passages.length} sources`,
            tone: "bg-nest-sage/15 text-[#2E7D5B]",
            Icon: BadgeCheck,
          }
        : {
            label: `Partial · verify with caseworker`,
            tone: "bg-nest-amber/15 text-nest-amber",
            Icon: AlertCircle,
          };

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {confidence && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${confidence.tone}`}
            aria-label={`Answer confidence: ${confidence.label}`}
          >
            <confidence.Icon className="h-3 w-3" strokeWidth={2.5} />
            {confidence.label}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View source: ${source}`}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          Source · {source}
        </button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl text-primary">
              Why this answer
            </DrawerTitle>
            <DrawerDescription>
              Nest's Navigator is instructed to answer only from cited passages,
              shaped by what you told us about your situation.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-3">
            <div className="rounded-2xl border-2 border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cited document
              </p>
              <p className="mt-1 text-sm text-foreground break-words">
                {source}
              </p>
            </div>

            {passages.length > 0 && (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  <Quote className="h-3 w-3" />
                  From the actual source{passages.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-2 space-y-3">
                  {passages.map((p, i) => {
                    const sanitized = safeHttpUrl(p.url);
                    const safeUrl = buildPassageHref(sanitized, p.snippet);
                    return (
                      <li
                        key={`${p.source_name}-${i}`}
                        className="border-l-2 border-primary/40 pl-3"
                      >
                        <p className="text-[11px] font-semibold text-primary">
                          {p.source_name}
                        </p>
                        <p className="mt-1 text-sm text-foreground leading-relaxed">
                          {p.snippet}
                        </p>
                        {safeUrl && (
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            Open document
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
                  This is the exact text Navigator's retriever pulled from the
                  corpus before the answer was generated. If the answer goes
                  beyond what this passage supports, that's a bug — not a feature.
                </p>
              </div>
            )}

            {renderProfileCard && (
              <div className="rounded-2xl border-2 border-border bg-card px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your profile
                </p>
                {name.trim() && (
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {name}
                  </p>
                )}
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                  {facts.map((f) => (
                    <div key={f.label} className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-foreground break-words">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <p className="pt-1 text-[10px] text-muted-foreground">
              Corpus last verified {formatVerifiedDate()}.
            </p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
