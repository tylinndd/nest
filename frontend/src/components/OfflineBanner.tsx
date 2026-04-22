import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/useOnline";

/**
 * Thin fixed banner shown across the top when the browser reports offline.
 * Everything except Navigator keeps working — the banner makes that
 * explicit rather than letting a user wonder why a chat message stalled.
 */
export const OfflineBanner = () => {
  const online = useOnline();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-2"
        >
          <div className="flex items-center gap-2 rounded-full bg-nest-coral px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg">
            <WifiOff className="h-3.5 w-3.5" />
            Offline &middot; Navigator paused. Your Path, Vault, and Emergency numbers still work.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
