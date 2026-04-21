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
import { useProfile, type EducationPlan } from "@/store/profile";

type Props = { source: string; showProfile?: boolean };

const EDUCATION_LABEL: Record<EducationPlan, string> = {
  college: "Heading to college",
  trade: "Heading to trade school",
  working: "Heading to work, not school",
};

export function SourceReveal({ source, showProfile = false }: Props) {
  const [open, setOpen] = useState(false);
  const name = useProfile((s) => s.name);
  const age = useProfile((s) => s.age);
  const county = useProfile((s) => s.county);
  const education = useProfile((s) => s.education);
  const housing = useProfile((s) => s.housing);

  const facts: { label: string; value: string }[] = [];
  if (age !== null) facts.push({ label: "Age", value: `${age}` });
  if (county.trim()) facts.push({ label: "County", value: `${county} County` });
  if (education) facts.push({ label: "Plan", value: EDUCATION_LABEL[education] });
  if (housing) facts.push({ label: "Living now", value: housing });

  const renderProfileCard = showProfile && facts.length > 0;

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
              Why this answer
            </DrawerTitle>
            <DrawerDescription>
              Nest's Navigator is instructed to answer only from cited passages,
              shaped by what you told us about your situation.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-3">
            <div className="rounded-2xl border-2 border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cited document
              </p>
              <p className="mt-1 text-sm text-foreground break-words">
                {source}
              </p>
            </div>

            {renderProfileCard && (
              <div className="rounded-2xl border-2 border-border bg-card px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your profile
                </p>
                {name.trim() && (
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {name}
                  </p>
                )}
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                  {facts.map((f) => (
                    <div key={f.label} className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-foreground break-words">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
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
