import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  show: boolean;
  title: string;
  detail?: string;
  className?: string;
};

export const SuccessCard = ({ show, title, detail, className }: Props) => (
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
        <motion.span
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nest-sage text-white"
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </motion.span>
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
