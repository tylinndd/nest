import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  show: boolean;
  title: string;
  detail?: string;
  className?: string;
};

const sparkles = [
  { x: -20, y: -14, delay: 0.08, size: 6, tone: "bg-nest-amber" },
  { x: 22, y: -18, delay: 0.16, size: 5, tone: "bg-nest-sage" },
  { x: 26, y: 10, delay: 0.1, size: 7, tone: "bg-nest-amber" },
  { x: -16, y: 18, delay: 0.2, size: 5, tone: "bg-nest-sage" },
  { x: 4, y: -24, delay: 0.14, size: 4, tone: "bg-nest-amber" },
] as const;

export const SuccessCard = ({ show, title, detail, className }: Props) => {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={cn(
            "nest-card p-4 flex items-center gap-3 border-nest-sage/40",
            className,
          )}
        >
          <div className="relative">
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nest-sage text-white"
            >
              <Check className="h-5 w-5" strokeWidth={3} />
            </motion.span>
            {!reduceMotion && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {sparkles.map((s, i) => (
                  <motion.span
                    key={i}
                    className={cn("absolute rounded-full", s.tone)}
                    style={{ width: s.size, height: s.size }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: s.x,
                      y: s.y,
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.85,
                      delay: s.delay,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{title}</p>
            {detail && (
              <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
