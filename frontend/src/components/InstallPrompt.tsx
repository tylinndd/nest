import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Share as ShareIcon, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useInstallPrompt } from "@/lib/installPromptStore";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const detectIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isiDevice = /iP(ad|hone|od)/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isiDevice && isSafari;
};

const detectStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as unknown as { standalone?: boolean };
  return nav.standalone === true;
};

export const InstallPrompt = () => {
  const location = useLocation();
  const visits = useInstallPrompt((s) => s.visits);
  const dismissed = useInstallPrompt((s) => s.dismissed);
  const increment = useInstallPrompt((s) => s.increment);
  const dismiss = useInstallPrompt((s) => s.dismiss);
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const bumped = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (bumped.current) return;
    bumped.current = true;
    increment();
  }, [increment]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const ios = detectIOS();
  const standalone = detectStandalone();
  const onSensitive =
    location.pathname.startsWith("/emergency") ||
    location.pathname.startsWith("/onboarding");

  if (dismissed || standalone || onSensitive) return null;
  if (visits < 2) return null;
  if (!promptEvent && !ios) return null;

  const handleInstall = async () => {
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch {
      // swallow — treat as dismiss
    }
    dismiss();
  };

  const copy = ios
    ? "Tap Share, then Add to Home Screen to install Nest."
    : "Add Nest to your home screen for one-tap access and offline use.";

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      role="region"
      aria-label="Install Nest"
      className="fixed bottom-20 inset-x-4 z-40 mx-auto max-w-md rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {ios ? (
            <ShareIcon className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm text-primary">Install Nest</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {copy}
          </p>
          {!ios && promptEvent && (
            <button
              type="button"
              onClick={handleInstall}
              className="nest-pill mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-1 h-4 w-4" />
              Install
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};
