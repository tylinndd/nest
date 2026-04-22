import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { lookupAcronym } from "@/lib/glossary";

type AcronymProps = {
  term: string;
};

export const Acronym = ({ term }: AcronymProps) => {
  const entry = lookupAcronym(term);
  if (!entry) return <>{term}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Definition of ${entry.term}: ${entry.expansion}`}
          className="inline-flex items-center gap-0.5 underline decoration-dotted decoration-current/50 underline-offset-2 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {term}
          <HelpCircle
            aria-hidden
            className="inline h-3 w-3 align-[-1px] opacity-60"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 text-sm"
      >
        <p className="font-display text-sm text-foreground">{entry.term}</p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {entry.expansion}
        </p>
        <p className="mt-2 text-sm text-foreground leading-relaxed">
          {entry.definition}
        </p>
        {entry.source && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {entry.source}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};
