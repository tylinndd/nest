import { useEffect, useState } from "react";

/**
 * Tracks the browser's online/offline status. Backed by navigator.onLine
 * plus the online/offline events. Not 100% reliable (navigator.onLine can
 * say "online" when the network is up but can't reach the public internet)
 * but it catches the common booth/Wi-Fi-drop case we care about.
 *
 * SSR-safe: returns true when window is undefined.
 */
export const useOnline = (): boolean => {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
};
