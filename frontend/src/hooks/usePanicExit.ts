import { useEffect, useRef } from "react";

const ESCAPE_COUNT = 3;
const WINDOW_MS = 800;

export const usePanicExit = (exitUrl: string) => {
  const timestampsRef = useRef<number[]>([]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const now = event.timeStamp || performance.now();
      const cutoff = now - WINDOW_MS;
      const recent = timestampsRef.current.filter((t) => t >= cutoff);
      recent.push(now);
      timestampsRef.current = recent;
      if (recent.length >= ESCAPE_COUNT) {
        timestampsRef.current = [];
        window.location.replace(exitUrl);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exitUrl]);
};
