import { AlertTriangle } from "lucide-react";
import { usePersistHealth } from "@/store/persistHealth";

export const PersistenceBanner = () => {
  const healthy = usePersistHealth((s) => s.healthy);
  if (healthy) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print flex items-start gap-3 bg-nest-coral/15 px-5 py-3 text-sm text-nest-coral border-b border-nest-coral/30"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="leading-snug">
        <span className="font-semibold">Answers aren't saving.</span>{" "}
        Your browser blocked on-device storage — try leaving private mode or
        freeing up space. Work in this session may be lost.
      </p>
    </div>
  );
};
