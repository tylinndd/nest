import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn("[nest.sw] registration failed:", error);
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    toast.success("Ready to work offline", {
      id: "sw-offline-ready",
      description: "Nest is cached on your device.",
      duration: 4000,
    });
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (!needRefresh) return;
    toast("New version available", {
      id: "sw-update",
      description: "Reload to pick up the latest.",
      duration: Infinity,
      action: {
        label: "Reload",
        onClick: () => {
          setNeedRefresh(false);
          void updateServiceWorker(true);
        },
      },
    });
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
};
