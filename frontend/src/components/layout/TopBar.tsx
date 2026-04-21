import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useProfile } from "@/store/profile";
import { useChat } from "@/store/chat";
import { useTheme } from "@/store/theme";
import { safeStorage } from "@/lib/safeStorage";
import { DEMO_SESSION_KEY } from "@/lib/demo";
import { DemoBadge } from "@/components/DemoBadge";

type Props = {
  showSaveExit?: boolean;
};

const LONG_PRESS_MS = 800;

export const TopBar = ({ showSaveExit }: Props) => {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const isDark = theme === "dark";

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const fire = () => {
    firedRef.current = true;
    timerRef.current = null;
    useProfile.getState().reset();
    useProfile.persist.clearStorage();
    useChat.getState().clear();
    safeStorage.removeItem("nest.first-task-fired");
    try {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // ignore
    }
    navigate("/onboarding/name");
    toast.success("Demo reset", {
      id: "demo-reset",
      description: "Profile cleared. Walk through onboarding again.",
    });
  };

  const startPress = () => {
    firedRef.current = false;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(fire, LONG_PRESS_MS);
  };

  const cancelPress = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (firedRef.current) {
      e.preventDefault();
      firedRef.current = false;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/60 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-md flex items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 select-none [-webkit-touch-callout:none]"
          onPointerDown={showSaveExit ? undefined : startPress}
          onPointerUp={showSaveExit ? undefined : cancelPress}
          onPointerCancel={showSaveExit ? undefined : cancelPress}
          onPointerLeave={showSaveExit ? undefined : cancelPress}
          onClick={showSaveExit ? undefined : handleClick}
          onContextMenu={showSaveExit ? undefined : (e) => e.preventDefault()}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg">
            N
          </span>
          <span className="font-display text-xl text-primary">Nest</span>
        </Link>
        {showSaveExit ? (
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Save &amp; Exit
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <DemoBadge />
            <Link
              to="/settings"
              aria-label="Settings and your data"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition hover:bg-secondary/80"
            >
              <SettingsIcon className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDark}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition hover:bg-secondary/80"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
