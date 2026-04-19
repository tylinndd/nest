import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProfile } from "@/store/profile";

type Props = {
  showSaveExit?: boolean;
  right?: React.ReactNode;
};

const LONG_PRESS_MS = 800;

export const TopBar = ({ showSaveExit, right }: Props) => {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);

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
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/60">
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
          right
        )}
      </div>
    </header>
  );
};
