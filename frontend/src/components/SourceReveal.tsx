import { useState } from "react";
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

type Props = { source: string };

export function SourceReveal({ source }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View source: ${source}`}
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        Source · {source}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl text-primary">
              Source
            </DrawerTitle>
            <DrawerDescription>
              Nest's Navigator is instructed to answer only from cited passages.
              When it can't cite, it refuses.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <div className="rounded-2xl border-2 border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cited document
              </p>
              <p className="mt-1 text-sm text-foreground break-words">
                {source}
              </p>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
