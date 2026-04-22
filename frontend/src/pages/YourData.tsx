import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Database,
  Download,
  FileText,
  HardDrive,
  Lock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/store/profile";
import { useChat } from "@/store/chat";
import { useSaved } from "@/store/saved";
import { usePathProgress } from "@/store/pathProgress";
import { exportUserData } from "@/lib/dataExport";

type KeyRow = { key: string; bytes: number; label: string };

const TRACKED_KEYS: { key: string; label: string }[] = [
  { key: "nest.profile", label: "Your profile + documents" },
  { key: "nest.chat", label: "Navigator chat history" },
  { key: "nest.saved", label: "Saved answers" },
  { key: "nest.pathProgress", label: "Path progress" },
  { key: "nest.theme", label: "Theme preference" },
];

const readBytes = (key: string): number => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? 0 : new Blob([raw]).size;
  } catch {
    return 0;
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "Empty";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const YourData = () => {
  const profile = useProfile();
  const chatCount = useChat((s) => s.messages.length);
  const savedCount = useSaved((s) => s.items.length);
  const pathProgressCount = usePathProgress((s) => s.completed.length);
  const [keyRows, setKeyRows] = useState<KeyRow[]>([]);

  useEffect(() => {
    setKeyRows(
      TRACKED_KEYS.map(({ key, label }) => ({
        key,
        label,
        bytes: readBytes(key),
      })),
    );
  }, [
    profile,
    chatCount,
    savedCount,
    pathProgressCount,
  ]);

  const snapshot = useMemo(
    () => [
      {
        label: "Name",
        value: profile.name.trim() || "Not set",
      },
      {
        label: "Age · county",
        value:
          profile.age !== null && profile.county.trim()
            ? `${profile.age} · ${profile.county.trim()}`
            : profile.age !== null
              ? `${profile.age}`
              : profile.county.trim() || "Not set",
      },
      {
        label: "Documents marked 'have'",
        value: `${profile.documentsHave.length}`,
      },
      {
        label: "Documents uploaded",
        value: `${profile.uploadedDocs.length}`,
      },
      {
        label: "Navigator messages",
        value: `${chatCount}`,
      },
      {
        label: "Saved answers",
        value: `${savedCount}`,
      },
      {
        label: "Path steps completed",
        value: `${pathProgressCount}`,
      },
      {
        label: "Trusted adult on file",
        value: profile.trustedAdult ? "Yes" : "No",
      },
    ],
    [profile, chatCount, savedCount, pathProgressCount],
  );

  const totalBytes = keyRows.reduce((n, r) => n + r.bytes, 0);

  const handleExport = () => {
    exportUserData();
  };

  return (
    <div className="px-5 pt-6 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/settings"
          aria-label="Back to settings"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Privacy
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <p className="text-sm text-muted-foreground">Personal library</p>
        <h1 className="font-display text-3xl text-primary">Your data</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Everything Nest knows about you lives on this device. Nothing is sent
          to a server except the questions you type into Navigator — those are
          used once to generate an answer, then discarded. This page shows every
          byte kept locally and lets you export or delete it.
        </p>
      </motion.div>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          What's on this device
        </p>
        <div className="nest-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Snapshot
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-5">
            {snapshot.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-0 sm:border-0 sm:pb-0"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Storage keys
        </p>
        <div className="nest-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" /> Every key Nest writes
          </div>
          <dl className="mt-3 space-y-2">
            {keyRows.map((row) => (
              <div
                key={row.key}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <dt className="font-mono text-xs text-foreground">
                    {row.key}
                  </dt>
                  <p className="text-[11px] text-muted-foreground">
                    {row.label}
                  </p>
                </div>
                <dd className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {formatBytes(row.bytes)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
            Total on this device: {formatBytes(totalBytes)}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Take it with you
        </p>
        <div className="nest-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Download className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Download as JSON</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                One file with every <span className="font-mono">nest.*</span>{" "}
                key above. Save it to email, cloud drive, or a second device —
                nothing passes through any server.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleExport}
            variant="outline"
            className="w-full justify-center rounded-full min-h-[2.75rem]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download my data
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Erase it all
        </p>
        <div className="nest-card p-4 border-nest-coral/40 bg-nest-coral/5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nest-coral/15 text-nest-coral">
              <Trash2 className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Delete everything</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wipes every key above, clears the service worker cache, and
                restarts onboarding. Download first if you want a copy — this
                cannot be undone.
              </p>
            </div>
          </div>
          <Button
            type="button"
            asChild
            className="w-full justify-center rounded-full bg-nest-coral text-white hover:bg-nest-coral/90 min-h-[2.75rem]"
          >
            <Link to="/reset">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete everything
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <Link
          to="/privacy"
          className="nest-card flex items-start gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Read the full privacy label
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every data flow in Nest, listed in plain English — including what
              goes over the wire and what doesn't.
            </p>
          </div>
        </Link>
      </section>

      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Database className="h-3 w-3" />
        Numbers refresh when you come back to this page.
      </p>
    </div>
  );
};

export default YourData;
