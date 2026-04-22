import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, RotateCcw, X } from "lucide-react";
import { useProfile } from "@/store/profile";
import { useChat } from "@/store/chat";
import {
  DEMO_PERSONAS,
  DEMO_SESSION_KEY,
  PERSONA_LABELS,
  isDemoPersona,
  profileFor,
  type DemoPersona,
} from "@/lib/demo";
import { useStageMode } from "@/hooks/useStageMode";

const readCurrentPersona = (): DemoPersona | null => {
  try {
    const v = sessionStorage.getItem(DEMO_SESSION_KEY);
    return isDemoPersona(v) ? v : null;
  } catch {
    return null;
  }
};

const writePersona = (p: DemoPersona | null) => {
  try {
    if (p) sessionStorage.setItem(DEMO_SESSION_KEY, p);
    else sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // ignore
  }
};

export function PresenterPill() {
  const { active, exit: exitStage } = useStageMode();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<DemoPersona | null>(
    readCurrentPersona,
  );

  const cyclePersona = useCallback(() => {
    const idx = persona ? DEMO_PERSONAS.indexOf(persona) : -1;
    const next = DEMO_PERSONAS[(idx + 1) % DEMO_PERSONAS.length];
    useProfile.setState(profileFor(next));
    useChat.setState({ messages: [] });
    writePersona(next);
    setPersona(next);
    navigate("/");
  }, [persona, navigate]);

  const resetRoute = useCallback(() => {
    useChat.setState({ messages: [] });
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetRoute();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        cyclePersona();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, resetRoute, cyclePersona]);

  if (!active) return null;

  const label = persona ? PERSONA_LABELS[persona] : "No persona loaded";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur"
      role="region"
      aria-label="Presenter controls"
    >
      <span className="px-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
        Stage
      </span>
      <span className="max-w-[12rem] truncate text-[11px] text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={resetRoute}
        aria-label="Reset to home (R)"
        title="Reset to home (R)"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={cyclePersona}
        aria-label="Next persona (N)"
        title="Next persona (N)"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => {
          useChat.setState({ messages: [] });
          useProfile.getState().reset();
          writePersona(null);
          setPersona(null);
          navigate("/onboarding");
        }}
        aria-label="Clear profile"
        title="Clear profile (back to onboarding)"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={exitStage}
        aria-label="Exit stage mode"
        title="Exit stage mode"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
