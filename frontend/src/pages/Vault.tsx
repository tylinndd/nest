import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

type Doc = VaultDoc;

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
}: {
  Icon: typeof Camera;
  title: string;
  detail: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card px-4 py-3 text-left transition hover:border-primary/40 min-h-[3.5rem]"
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

const Vault = () => {
  const [target, setTarget] = useState<AddTarget>(null);
  const prefersReducedMotion = useReducedMotion();
  const profile = useProfile();
  const docs = useMemo(() => derivePersonalizedVault(profile), [profile]);
  const isOpen = target !== null;
  const secured = docs.filter((d) => d.state === "uploaded").length;

  const handleRowClick = (doc: Doc) => {
    if (doc.state === "missing") {
      setTarget({ mode: "doc", doc });
      return;
    }
    if (doc.state === "requested") {
      toast.info("Request in progress", {
        id: "vault-action",
        description: doc.detail,
      });
    }
  };

  const handleAction = (label: string, description: string) => {
    setTarget(null);
    toast(label, { id: "vault-action", description });
  };

  const drawerTitle =
    target?.mode === "doc" ? `Add your ${target.doc.title}` : "Add a document";
  const drawerSubtitle =
    target?.mode === "doc"
      ? "Upload what you have, or we'll request it on your behalf."
      : "Pick how you want to add it.";

  return (
    <div className="px-5 pt-5 pb-6">
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
          End-to-end encrypted · passcode required to open
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {docs.map((d, i) => {
          const m = stateMeta[d.state];
          const Icon = m.icon;
          const interactive = d.state !== "uploaded";
          return (
            <motion.button
              type="button"
              key={d.id}
              disabled={!interactive}
              onClick={() => handleRowClick(d)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.04 }}
              className={cn(
                "nest-card p-4 flex items-center gap-4 border-l-4 w-full text-left",
                m.border,
                interactive
                  ? "cursor-pointer transition hover:border-primary/30"
                  : "cursor-default",
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
              detail="Snap the front and back. We'll detect edges and store it encrypted."
              onClick={() =>
                handleAction("Opening your camera", "Center the document in the frame.")
              }
            />
            <Option
              Icon={Upload}
              title="Upload from files"
              detail="PDF, JPG, PNG, or HEIC up to 20MB."
              onClick={() =>
                handleAction("Choose a file", "Pick a document from your device.")
              }
            />
            <Option
              Icon={Send}
              title="Request from Georgia DFCS"
              detail="We'll draft an email to your caseworker with the right form attached."
              onClick={() =>
                handleAction(
                  "Drafting request to DFCS",
                  target?.mode === "doc"
                    ? `We'll ask for your ${target.doc.title.toLowerCase()}.`
                    : "Review and send from your email app.",
                )
              }
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
    </div>
  );
};

export default Vault;
