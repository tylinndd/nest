import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle2,
  CircleDashed,
  Camera,
  Upload,
  Send,
  ChevronRight,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/store/profile";
import { derivePersonalizedVault, type VaultDoc } from "@/lib/personalize";
import {
  deleteDocument,
  getDocument,
  saveDocument,
  type StoredDoc,
} from "@/lib/vaultStorage";
import { cn } from "@/lib/utils";

type Doc = VaultDoc;

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const stateMeta = {
  uploaded: {
    label: "Secured",
    chip: "bg-nest-sage/15 text-[#2E7D5B]",
    icon: CheckCircle2,
    border: "border-l-nest-sage",
  },
  requested: {
    label: "In progress",
    chip: "bg-nest-amber/15 text-nest-amber",
    icon: CircleDashed,
    border: "border-l-nest-amber",
  },
  missing: {
    label: "Add now",
    chip: "bg-nest-coral/15 text-nest-coral",
    icon: Plus,
    border: "border-l-nest-coral",
  },
} as const;

type AddTarget = { mode: "doc"; doc: Doc } | { mode: "new" } | null;

const Option = ({
  Icon,
  title,
  detail,
  onClick,
  disabled,
}: {
  Icon: typeof Camera;
  title: string;
  detail: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card px-4 py-3 text-left transition hover:border-primary/40 min-h-[3.5rem] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
      <Icon className="h-5 w-5" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </button>
);

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUploadedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Vault = () => {
  const [target, setTarget] = useState<AddTarget>(null);
  const [preview, setPreview] = useState<{
    docId: string;
    title: string;
    stored: StoredDoc | null;
    previewUrl: string | null;
  } | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const profile = useProfile();
  const markUploaded = useProfile((s) => s.markUploaded);
  const unmarkUploaded = useProfile((s) => s.unmarkUploaded);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocId = useRef<string | null>(null);

  const docs = useMemo(() => derivePersonalizedVault(profile), [profile]);
  const isOpen = target !== null;
  const secured = docs.filter((d) => d.state === "uploaded").length;

  useEffect(() => {
    return () => {
      if (preview?.previewUrl) URL.revokeObjectURL(preview.previewUrl);
    };
  }, [preview?.previewUrl]);

  const openPreview = async (doc: Doc) => {
    try {
      const stored = await getDocument(doc.id);
      const previewUrl = stored ? URL.createObjectURL(stored.blob) : null;
      setPreview({ docId: doc.id, title: doc.title, stored, previewUrl });
    } catch (err) {
      console.warn("[vault] read failed:", err);
      toast.error("Couldn't open this file", {
        id: "vault-action",
        description:
          "Your browser blocked secure storage — try disabling private mode.",
      });
    }
  };

  const closePreview = () => {
    if (preview?.previewUrl) URL.revokeObjectURL(preview.previewUrl);
    setPreview(null);
  };

  const handleRowClick = (doc: Doc) => {
    if (doc.state === "uploaded") {
      openPreview(doc);
      return;
    }
    if (doc.state === "missing") {
      setTarget({ mode: "doc", doc });
      return;
    }
    toast.info("Request in progress", {
      id: "vault-action",
      description: doc.detail,
    });
  };

  const triggerInput = (which: "camera" | "file") => {
    if (target?.mode !== "doc") {
      setTarget(null);
      toast.info("Pick a document first", {
        id: "vault-action",
        description: "Choose which document you're adding, then pick camera or upload.",
      });
      return;
    }
    pendingDocId.current = target.doc.id;
    const ref = which === "camera" ? cameraInputRef : fileInputRef;
    ref.current?.click();
  };

  const handleFileSelected = async (file: File | null) => {
    const docId = pendingDocId.current;
    pendingDocId.current = null;
    if (!file || !docId) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File too large", {
        id: "vault-action",
        description: `${formatBytes(file.size)} exceeds the 20MB limit.`,
      });
      return;
    }

    try {
      await saveDocument(docId, file);
      markUploaded(docId);
      setTarget(null);
      toast.success("Secured in your vault", {
        id: "vault-action",
        description: file.name,
      });
    } catch (err) {
      console.warn("[vault] save failed:", err);
      toast.error("Couldn't save to vault", {
        id: "vault-action",
        description: "Try again, or check your device storage.",
      });
    }
  };

  const handleDelete = async () => {
    if (!preview) return;
    try {
      await deleteDocument(preview.docId);
      unmarkUploaded(preview.docId);
      closePreview();
      toast("Removed from vault", {
        id: "vault-action",
        description: preview.title,
      });
    } catch (err) {
      console.warn("[vault] delete failed:", err);
      toast.error("Couldn't remove file", { id: "vault-action" });
    }
  };

  const handleRequest = () => {
    setTarget(null);
    toast("Drafting request to DFCS", {
      id: "vault-action",
      description:
        target?.mode === "doc"
          ? `We'll ask for your ${target.doc.title.toLowerCase()}.`
          : "Review and send from your email app.",
    });
  };

  const drawerTitle =
    target?.mode === "doc" ? `Add your ${target.doc.title}` : "Add a document";
  const drawerSubtitle =
    target?.mode === "doc"
      ? "Upload what you have, or we'll request it on your behalf."
      : "Pick a document below first, then choose camera or upload.";

  const previewIsImage =
    preview?.stored?.mime.startsWith("image/") ?? false;
  const previewIsPdf = preview?.stored?.mime === "application/pdf";

  return (
    <div className="px-5 pt-5 pb-6">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = "";
          void handleFileSelected(file);
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = "";
          void handleFileSelected(file);
        }}
      />

      <p className="text-sm text-muted-foreground">Encrypted on your device</p>
      <h1 className="font-display text-3xl text-primary">Document Vault</h1>
      <p className="mt-2 text-muted-foreground">
        Every ID, letter, and record in one place.
      </p>

      <div className="mt-5 nest-card p-5 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
            Your vault
          </span>
        </div>
        <p className="mt-3 font-display text-3xl">
          {secured} of {docs.length} secured
        </p>
        <div
          role="progressbar"
          aria-label="Documents secured"
          aria-valuenow={Math.round((secured / docs.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-4 h-1 rounded-full bg-primary-foreground/20 overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(secured / docs.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-nest-sage"
          />
        </div>
        <p className="mt-3 text-xs opacity-80">
          Stored in your browser · never leaves this device
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {docs.map((d, i) => {
          const m = stateMeta[d.state];
          const Icon = m.icon;
          return (
            <motion.button
              type="button"
              key={d.id}
              onClick={() => handleRowClick(d)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.04 }}
              className={cn(
                "nest-card p-4 flex items-center gap-4 border-l-4 w-full text-left cursor-pointer transition hover:border-primary/30",
                m.border,
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  d.state === "uploaded"
                    ? "bg-nest-sage text-white"
                    : d.state === "requested"
                      ? "bg-nest-amber/15 text-nest-amber"
                      : "bg-muted text-foreground",
                )}
              >
                {d.state === "uploaded" ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.detail}</p>
              </div>
              <span className={cn("nest-chip", m.chip)}>
                {d.state === "requested" && !prefersReducedMotion ? (
                  <motion.span
                    aria-hidden
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-1 inline-flex"
                  >
                    <Icon className="h-3 w-3" />
                  </motion.span>
                ) : (
                  <Icon className="mr-1 h-3 w-3" />
                )}
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setTarget({ mode: "new" })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-border bg-card py-4 text-sm font-semibold text-primary min-h-[3.5rem] transition hover:border-primary/40"
      >
        <Plus className="h-4 w-4" />
        Add another document
      </button>

      <Drawer open={isOpen} onOpenChange={(o) => !o && setTarget(null)}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl text-primary">
              {drawerTitle}
            </DrawerTitle>
            <DrawerDescription>{drawerSubtitle}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-3">
            <Option
              Icon={Camera}
              title="Take a photo"
              detail="Snap the front and back with your camera."
              onClick={() => triggerInput("camera")}
              disabled={target?.mode !== "doc"}
            />
            <Option
              Icon={Upload}
              title="Upload from files"
              detail="PDF, JPG, PNG, or HEIC up to 20MB."
              onClick={() => triggerInput("file")}
              disabled={target?.mode !== "doc"}
            />
            <Option
              Icon={Send}
              title="Request from Georgia DFCS"
              detail="We'll draft an email to your caseworker with the right form attached."
              onClick={handleRequest}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={preview !== null}
        onOpenChange={(o) => !o && closePreview()}
      >
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl text-primary">
              {preview?.title}
            </DrawerTitle>
            <DrawerDescription>
              {preview?.stored
                ? `${preview.stored.name} · ${formatBytes(preview.stored.size)} · added ${formatUploadedAt(preview.stored.uploadedAt)}`
                : "Looking up your file…"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">
            {preview?.previewUrl && previewIsImage && (
              <div className="overflow-hidden rounded-2xl border-2 border-border bg-muted">
                <img
                  src={preview.previewUrl}
                  alt={preview.title}
                  className="h-auto w-full object-contain max-h-72"
                />
              </div>
            )}
            {preview?.previewUrl && previewIsPdf && (
              <a
                href={preview.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 transition hover:border-primary/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Eye className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Open PDF</p>
                  <p className="text-xs text-muted-foreground">
                    Opens in a new tab
                  </p>
                </div>
              </a>
            )}
            {preview && !preview.stored && (
              <p className="text-sm text-muted-foreground">
                We couldn't find this file — it may have been cleared from your device.
              </p>
            )}
          </div>
          <DrawerFooter>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="rounded-full text-nest-coral border-nest-coral/40 hover:bg-nest-coral/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from vault
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Vault;
