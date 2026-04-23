import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProfile } from "@/store/profile";

export const WhyAnswerPopover = () => {
  const age = useProfile((s) => s.age);
  const county = useProfile((s) => s.county);
  const housing = useProfile((s) => s.housing);

  const items: Array<[string, string]> = [];
  if (age !== null) items.push(["Age", String(age)]);
  if (county.trim()) items.push(["County", `${county.trim()} County`]);
  if (housing) items.push(["Housing", housing]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Why this answer?"
          title="Why this answer?"
          className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Why this?
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 text-sm">
        <p className="font-display text-sm text-foreground">
          Why Nest picked this answer
        </p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Nest tailored this reply to what you told us in onboarding.
        </p>
        {items.length > 0 ? (
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            {items.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-foreground">
            No profile details saved yet — Nest is answering generically.
          </p>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Nest can make mistakes. Check anything important with your caseworker
          or a trusted adult.
        </p>
      </PopoverContent>
    </Popover>
  );
};
