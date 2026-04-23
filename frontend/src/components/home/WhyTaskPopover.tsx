import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  rationale: string;
};

export const WhyTaskPopover = ({ rationale }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Why this task?"
        title="Why this task?"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="h-3 w-3" />
        Why this?
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      sideOffset={6}
      className="w-72 text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="font-display text-sm text-foreground">
        Why Nest suggested this
      </p>
      <p className="mt-2 text-sm text-foreground leading-relaxed">
        {rationale}
      </p>
      <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        Nest bases tasks on what you told us in onboarding. Edit your profile
        any time.
      </p>
    </PopoverContent>
  </Popover>
);
