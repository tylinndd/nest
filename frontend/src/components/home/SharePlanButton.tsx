import { useState } from "react";
import { Share2, Printer, Copy } from "lucide-react";
import { toast } from "sonner";
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
import { buildPlanText, buildPlanHtml } from "@/lib/planExport";
import { openPrintWindow } from "@/lib/print";
import type { Profile } from "@/store/profile";
import type { Task, Benefit } from "@/data/placeholder";

type Props = {
  profile: Profile;
  tasks: Task[];
  benefits: Benefit[];
};

const canNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export const SharePlanButton = ({ profile, tasks, benefits }: Props) => {
  const [open, setOpen] = useState(false);

  const handleShare = async () => {
    const text = buildPlanText(profile, tasks, benefits);
    const first = profile.name.trim().split(/\s+/)[0];
    const title = first ? `${first}'s Nest plan` : "My Nest plan";
    if (canNativeShare()) {
      try {
        await navigator.share({ title, text });
        setOpen(false);
        return;
      } catch (err) {
        if ((err as DOMException).name === "AbortError") {
          setOpen(false);
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Plan copied — paste it anywhere", { id: "plan-share" });
      setOpen(false);
    } catch {
      toast.error("Couldn't copy the plan", { id: "plan-share" });
    }
  };

  const handlePrint = () => {
    openPrintWindow(buildPlanHtml(profile, tasks, benefits));
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="nest-pill bg-secondary text-primary hover:bg-secondary/80 min-h-[2.5rem]"
        aria-label="Share my plan"
      >
        <Share2 className="mr-1 h-4 w-4" />
        Share my plan
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Share your plan</DrawerTitle>
            <DrawerDescription>
              A rollup of what you're working on and the benefits you qualify
              for.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-2">
            <Button
              type="button"
              variant="default"
              onClick={handleShare}
              className="w-full justify-start"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {canNativeShare() ? "Share…" : "Copy to clipboard"}
              {!canNativeShare() && (
                <Copy className="ml-auto h-4 w-4 opacity-60" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="w-full justify-start"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print as checklist
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
