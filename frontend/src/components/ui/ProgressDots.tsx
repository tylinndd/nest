import { cn } from "@/lib/utils";

export const ProgressDots = ({ total, current }: { total: number; current: number }) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={cn(
          "h-2 rounded-full transition-all",
          i === current ? "w-6 bg-primary" : i < current ? "w-2 bg-primary/60" : "w-2 bg-border",
        )}
      />
    ))}
  </div>
);
