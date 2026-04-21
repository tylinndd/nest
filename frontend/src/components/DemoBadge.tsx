import { useEffect, useState } from "react";
import { useProfile } from "@/store/profile";
import {
  DEMO_SESSION_KEY,
  PERSONA_LABELS,
  isDemoPersona,
  type DemoPersona,
} from "@/lib/demo";

const readPersona = (): DemoPersona | null => {
  try {
    const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    return isDemoPersona(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const DemoBadge = () => {
  const [persona, setPersona] = useState<DemoPersona | null>(null);
  const name = useProfile((s) => s.name);

  useEffect(() => {
    setPersona(readPersona());
    const onStorage = (e: StorageEvent) => {
      if (e.key === DEMO_SESSION_KEY) setPersona(readPersona());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!persona) return null;

  const label = name.trim() || PERSONA_LABELS[persona];

  return (
    <span
      aria-label={`Demo mode: ${label}`}
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-nest-amber/40 bg-nest-amber/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-nest-amber"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-nest-amber" />
      Demo · {label}
    </span>
  );
};
