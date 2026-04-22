import { useMemo } from "react";
import { Eraser } from "lucide-react";
import {
  useNetworkLog,
  type NetworkEntry,
  type NetworkStatus,
} from "@/store/networkLog";

const formatStatus = (status: NetworkStatus): string => {
  if (status === "pending") return "…";
  if (status === "network-error") return "offline";
  return String(status);
};

const statusToneClass = (entry: NetworkEntry): string => {
  if (entry.status === "pending") return "bg-muted text-muted-foreground";
  if (entry.ok) return "bg-nest-sage/15 text-[#2E7D5B]";
  return "bg-nest-coral/15 text-[#9B3528]";
};

const formatTime = (ms: number): string => {
  const d = new Date(ms);
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDuration = (ms: number | null): string => {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const NetworkLog = () => {
  const entries = useNetworkLog((s) => s.entries);
  const clear = useNetworkLog((s) => s.clear);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.startedAt - a.startedAt),
    [entries],
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every request this browser has made to our server this session, in
          order. Clears when you close the tab. Request bodies are not logged.
        </p>
        {sorted.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <Eraser className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border/60 bg-background/60 px-3 py-4 text-center text-xs text-muted-foreground">
          No network calls yet this session.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sorted.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
            >
              <span
                className={`inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] font-semibold ${statusToneClass(
                  entry,
                )}`}
              >
                {formatStatus(entry.status)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <code className="text-xs font-semibold text-foreground">
                    {entry.method} {entry.path}
                  </code>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(entry.startedAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                  {entry.purpose} · {formatDuration(entry.durationMs)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
