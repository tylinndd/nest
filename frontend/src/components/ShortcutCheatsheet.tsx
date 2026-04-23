import type { ReactNode } from "react";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Shortcut = {
  keys: string[];
  description: string;
};

const SHORTCUTS: Shortcut[] = [
  { keys: ["Enter"], description: "Send your question" },
  { keys: ["Shift", "Enter"], description: "Insert a newline" },
  { keys: ["\u2318", "Enter"], description: "Send (Cmd+Enter on Mac)" },
  { keys: ["Ctrl", "Enter"], description: "Send (on Windows / Linux)" },
  { keys: ["/"], description: "Focus the question input" },
  { keys: ["\u2318", "/"], description: "Open this cheatsheet" },
  { keys: ["Esc"], description: "Close this cheatsheet" },
];

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] font-semibold text-foreground shadow-sm">
    {children}
  </kbd>
);

export const ShortcutCheatsheet = ({ open, onOpenChange }: Props) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-w-md mx-auto">
      <DrawerHeader className="text-left">
        <DrawerTitle className="font-display text-xl text-primary">
          Keyboard shortcuts
        </DrawerTitle>
        <DrawerDescription>
          Nest is faster with the keyboard. These work anywhere on this page.
        </DrawerDescription>
      </DrawerHeader>
      <div className="px-4 pb-4">
        <ul className="divide-y divide-border rounded-2xl border-2 border-border bg-card">
          {SHORTCUTS.map((s) => (
            <li
              key={s.description}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="text-sm text-foreground">{s.description}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <span
                    key={`${s.description}-${i}`}
                    className="flex items-center gap-1"
                  >
                    <Kbd>{k}</Kbd>
                    {i < s.keys.length - 1 && (
                      <span
                        className="text-muted-foreground"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    )}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
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
);
