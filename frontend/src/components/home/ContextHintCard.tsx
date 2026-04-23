import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ContextHint } from "@/lib/contextHint";

type Props = {
  hint: ContextHint;
  onDismiss: () => void;
};

export const ContextHintCard = ({ hint, onDismiss }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22 }}
    className="nest-card flex items-start gap-3 p-4"
  >
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
      <img
        src="/img/hint-badge.webp"
        alt=""
        aria-hidden="true"
        className="h-8 w-8 object-cover"
        loading="lazy"
        decoding="async"
      />
    </span>
    <div className="flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
        {hint.eyebrow}
      </p>
      <p className="mt-1 text-sm text-foreground leading-relaxed">
        {hint.message}
      </p>
    </div>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss tip"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </button>
  </motion.div>
);
