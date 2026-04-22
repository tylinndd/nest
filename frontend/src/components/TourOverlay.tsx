import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useProfile, type Profile } from "@/store/profile";
import { useChat } from "@/store/chat";
import { DEMO_SESSION_KEY, profileFor } from "@/lib/demo";
import { TOUR_STOPS, useTour } from "@/store/tour";

const BACKUP_KEY = "nest.tour.profileBackup";

const readBackup = (): Profile | null => {
  try {
    const raw = sessionStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
};

const writeBackup = (profile: Profile) => {
  try {
    sessionStorage.setItem(BACKUP_KEY, JSON.stringify(profile));
  } catch {
    // ignore quota / disabled storage
  }
};

const clearBackup = () => {
  try {
    sessionStorage.removeItem(BACKUP_KEY);
  } catch {
    // ignore
  }
};

export function TourOverlay() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const active = useTour((s) => s.active);
  const paused = useTour((s) => s.paused);
  const stepIndex = useTour((s) => s.stepIndex);
  const next = useTour((s) => s.next);
  const prev = useTour((s) => s.prev);
  const stop = useTour((s) => s.stop);
  const togglePause = useTour((s) => s.togglePause);

  const timerRef = useRef<number | null>(null);
  const lastPersonaRef = useRef<string | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const exit = useCallback(() => {
    clearTimer();
    const backup = readBackup();
    if (backup) {
      useProfile.setState(backup);
    }
    clearBackup();
    try {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // ignore
    }
    useChat.setState({ messages: [] });
    lastPersonaRef.current = null;
    stop();
    navigate("/demo");
  }, [navigate, stop]);

  // Persona seeding + navigation per step.
  useEffect(() => {
    if (!active) {
      lastPersonaRef.current = null;
      return;
    }

    if (!readBackup()) {
      writeBackup(useProfile.getState());
    }

    const stopData = TOUR_STOPS[stepIndex];
    if (!stopData) return;

    if (lastPersonaRef.current !== stopData.persona) {
      useProfile.setState(profileFor(stopData.persona));
      useChat.setState({ messages: [] });
      try {
        sessionStorage.setItem(DEMO_SESSION_KEY, stopData.persona);
      } catch {
        // ignore
      }
      lastPersonaRef.current = stopData.persona;
    }
    navigate(stopData.path);
  }, [active, stepIndex, navigate]);

  // Auto-advance timer.
  useEffect(() => {
    if (!active || paused) {
      clearTimer();
      return;
    }
    const stopData = TOUR_STOPS[stepIndex];
    if (!stopData) return;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const isLast = stepIndex + 1 >= TOUR_STOPS.length;
      if (isLast) {
        exit();
      } else {
        next();
      }
    }, stopData.durationMs);
    return clearTimer;
  }, [active, paused, stepIndex, next, exit]);

  // Keyboard shortcuts.
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
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePause();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, togglePause, exit]);

  // Unmount cleanup — guards against tour being cleared externally.
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  if (!active) return null;

  const stopData = TOUR_STOPS[stepIndex];
  if (!stopData) return null;

  const progressDuration = paused ? 0 : stopData.durationMs / 1000;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.22 }}
        className="fixed bottom-4 left-1/2 z-50 w-[min(94vw,32rem)] -translate-x-1/2 rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur"
        role="region"
        aria-label="Demo tour controls"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={stepIndex === 0}
            aria-label="Previous stop"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? "Resume tour" : "Pause tour"}
            aria-pressed={paused}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
          >
            {paused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Tour · stop {stepIndex + 1} of {TOUR_STOPS.length}
            </p>
            <p className="truncate text-xs font-medium text-foreground leading-snug">
              {stopData.headline}
            </p>
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next stop"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={exit}
            aria-label="Exit tour"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className="mt-2 flex gap-1 px-1"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={TOUR_STOPS.length}
        >
          {TOUR_STOPS.map((_, i) => {
            const state =
              i < stepIndex ? "done" : i === stepIndex ? "current" : "todo";
            return (
              <span
                key={i}
                aria-hidden
                className={`relative h-1 flex-1 overflow-hidden rounded-full ${
                  state === "done" ? "bg-primary" : "bg-border"
                }`}
              >
                {state === "current" && !reduced ? (
                  <motion.span
                    key={`${stepIndex}-${paused ? "paused" : "running"}`}
                    className="absolute inset-y-0 left-0 block bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "0%" : "100%" }}
                    transition={{ duration: progressDuration, ease: "linear" }}
                  />
                ) : state === "current" ? (
                  <span className="absolute inset-y-0 left-0 block w-1/2 bg-primary" />
                ) : null}
              </span>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
