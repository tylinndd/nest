import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronDown,
  FileText,
  Heart,
  GraduationCap,
  Briefcase,
  Hammer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, type EducationPlan } from "@/store/profile";

const TOTAL_QUESTIONS = 7;

const StepShell = ({
  stepIndex,
  eyebrow,
  title,
  subtitle,
  children,
  next,
  cta = "Continue",
  disabled = false,
}: {
  stepIndex?: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  next: string;
  cta?: string;
  disabled?: boolean;
}) => {
  const navigate = useNavigate();
  const derivedEyebrow = stepIndex
    ? `Step ${stepIndex} of ${TOTAL_QUESTIONS}`
    : eyebrow;
  return (
    <div className="flex h-full flex-col">
      {derivedEyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-nest-amber">
          {derivedEyebrow}
        </p>
      )}
      <h1 className="mt-3 font-display text-3xl leading-tight text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-8 flex-1">{children}</div>
      <Button
        size="lg"
        disabled={disabled}
        className="mt-8 h-14 min-h-[3.5rem] rounded-full text-base font-semibold"
        onClick={() => navigate(next)}
      >
        {cta}
      </Button>
    </div>
  );
};

const Choice = ({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full rounded-2xl border-2 px-5 py-4 text-left transition min-h-[3.5rem]",
      active
        ? "border-primary bg-secondary text-primary"
        : "border-border bg-card text-foreground hover:border-primary/40",
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <span className="text-base font-semibold">{label}</span>
      {active && <Check className="h-5 w-5 text-primary" />}
    </div>
    {description && (
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    )}
  </button>
);

export const StepName = () => {
  const name = useProfile((s) => s.name);
  const setName = useProfile((s) => s.setName);
  return (
    <StepShell
      stepIndex={1}
      title="What should we call you?"
      subtitle="A first name or nickname is fine — this stays on your device."
      next="/onboarding/age"
      disabled={!name.trim()}
    >
      <Label htmlFor="name" className="text-sm font-medium text-foreground">
        Your name
      </Label>
      <Input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="given-name"
        className="mt-2 h-14 rounded-2xl text-lg"
      />
    </StepShell>
  );
};

export const StepAge = () => {
  const age = useProfile((s) => s.age);
  const setAge = useProfile((s) => s.setAge);
  const [raw, setRaw] = useState(age !== null ? String(age) : "");
  const handleChange = (value: string) => {
    setRaw(value);
    if (value === "") {
      setAge(null);
      return;
    }
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n > 0) setAge(n);
  };
  const valid = age !== null && age >= 14 && age <= 26;
  return (
    <StepShell
      stepIndex={2}
      title="How old are you?"
      subtitle="Your age unlocks the right benefits and programs."
      next="/onboarding/county"
      disabled={!valid}
    >
      <Label htmlFor="age" className="text-sm font-medium text-foreground">
        Age
      </Label>
      <Input
        id="age"
        type="number"
        inputMode="numeric"
        min={14}
        max={26}
        step={1}
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-2 h-14 rounded-2xl text-lg"
      />
    </StepShell>
  );
};

const GA_COUNTIES = [
  "Appling","Atkinson","Bacon","Baker","Baldwin","Banks","Barrow","Bartow","Ben Hill","Berrien",
  "Bibb","Bleckley","Brantley","Brooks","Bryan","Bulloch","Burke","Butts","Calhoun","Camden",
  "Candler","Carroll","Catoosa","Charlton","Chatham","Chattahoochee","Chattooga","Cherokee","Clarke","Clay",
  "Clayton","Clinch","Cobb","Coffee","Colquitt","Columbia","Cook","Coweta","Crawford","Crisp",
  "Dade","Dawson","Decatur","DeKalb","Dodge","Dooly","Dougherty","Douglas","Early","Echols",
  "Effingham","Elbert","Emanuel","Evans","Fannin","Fayette","Floyd","Forsyth","Franklin","Fulton",
  "Gilmer","Glascock","Glynn","Gordon","Grady","Greene","Gwinnett","Habersham","Hall","Hancock",
  "Haralson","Harris","Hart","Heard","Henry","Houston","Irwin","Jackson","Jasper","Jeff Davis",
  "Jefferson","Jenkins","Johnson","Jones","Lamar","Lanier","Laurens","Lee","Liberty","Lincoln",
  "Long","Lowndes","Lumpkin","Macon","Madison","Marion","McDuffie","McIntosh","Meriwether","Miller",
  "Mitchell","Monroe","Montgomery","Morgan","Murray","Muscogee","Newton","Oconee","Oglethorpe","Paulding",
  "Peach","Pickens","Pierce","Pike","Polk","Pulaski","Putnam","Quitman","Rabun","Randolph",
  "Richmond","Rockdale","Schley","Screven","Seminole","Spalding","Stephens","Stewart","Sumter","Talbot",
  "Taliaferro","Tattnall","Taylor","Telfair","Terrell","Thomas","Tift","Toombs","Towns","Treutlen",
  "Troup","Turner","Twiggs","Union","Upson","Walker","Walton","Ware","Warren","Washington",
  "Wayne","Webster","Wheeler","White","Whitfield","Wilcox","Wilkes","Wilkinson","Worth",
];

export const StepCounty = () => {
  const [open, setOpen] = useState(false);
  const selected = useProfile((s) => s.county);
  const setCounty = useProfile((s) => s.setCounty);
  const label = selected ? `${selected} County` : "Select your county";
  return (
    <StepShell
      stepIndex={3}
      title="Which Georgia county are you in?"
      subtitle="This routes you to the right DFCS office and local supports."
      next="/onboarding/documents"
      disabled={!selected}
    >
      <Label className="text-sm font-medium text-foreground">County</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "mt-2 flex h-14 w-full items-center justify-between rounded-2xl border-2 border-border bg-card px-5 text-left text-lg transition",
              open ? "border-primary" : "hover:border-primary/40",
            )}
          >
            <span className={selected ? "text-foreground" : "text-muted-foreground"}>
              {label}
            </span>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-3rem)] max-w-sm p-0 rounded-2xl"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search 159 counties…" className="h-12" />
            <CommandList className="max-h-72">
              <CommandEmpty>No county found.</CommandEmpty>
              <CommandGroup>
                {GA_COUNTIES.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => {
                      setCounty(c);
                      setOpen(false);
                    }}
                    className="min-h-[2.75rem]"
                  >
                    <span className="flex-1">{c}</span>
                    {selected.toLowerCase() === c.toLowerCase() && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="mt-4 text-xs text-muted-foreground">
        Cobb, Fulton, DeKalb, and Gwinnett have the deepest listed resources right now.
      </p>
    </StepShell>
  );
};

const DOCUMENT_OPTIONS = [
  { id: "ssc", label: "Social Security card" },
  { id: "birth", label: "Birth certificate" },
  { id: "id", label: "State ID or driver's license" },
  { id: "medicaid", label: "Medicaid card" },
  { id: "transcript", label: "School transcript or diploma" },
];

export const StepDocuments = () => {
  const have = useProfile((s) => s.documentsHave);
  const toggle = useProfile((s) => s.toggleDocument);
  return (
    <StepShell
      stepIndex={4}
      title="Which documents do you already have?"
      subtitle="We'll build a checklist for the ones still missing."
      next="/onboarding/education"
    >
      <div className="space-y-3">
        {DOCUMENT_OPTIONS.map((d) => {
          const active = have.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition min-h-[3.5rem]",
                active
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {active && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {d.label}
                </span>
              </span>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Don't have one? We'll show you exactly how to request it in Georgia.
      </p>
    </StepShell>
  );
};

const EDUCATION_OPTIONS: {
  id: EducationPlan;
  label: string;
  description: string;
  Icon: typeof GraduationCap;
}[] = [
  {
    id: "college",
    label: "4-year college",
    description: "KSU, GSU, UGA — Chafee ETV + HB 136 apply",
    Icon: GraduationCap,
  },
  {
    id: "trade",
    label: "Trade or 2-year program",
    description: "Tech colleges, apprenticeships, certifications",
    Icon: Hammer,
  },
  {
    id: "working",
    label: "Working or taking a break",
    description: "Benefits don't require school enrollment",
    Icon: Briefcase,
  },
];

export const StepEducation = () => {
  const pick = useProfile((s) => s.education);
  const setEducation = useProfile((s) => s.setEducation);
  return (
    <StepShell
      stepIndex={5}
      title="What's your education plan?"
      subtitle="Pick what fits right now. You can change this anytime."
      next="/onboarding/housing"
      disabled={!pick}
    >
      <div className="space-y-3">
        {EDUCATION_OPTIONS.map(({ id, label, description, Icon }) => {
          const active = pick === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setEducation(id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border-2 px-5 py-4 text-left transition min-h-[3.5rem]",
                active
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {label}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {description}
                </span>
              </span>
              {active && <Check className="h-5 w-5 text-primary mt-1" />}
            </button>
          );
        })}
      </div>
    </StepShell>
  );
};

export const StepHousing = () => {
  const pick = useProfile((s) => s.housing);
  const setHousing = useProfile((s) => s.setHousing);
  const options = [
    "Foster home",
    "Group home",
    "Independent living program",
    "With a relative",
    "Unsure / something else",
  ];
  return (
    <StepShell
      stepIndex={6}
      title="Where are you living right now?"
      subtitle="This helps us recommend the right transitional housing path."
      next="/onboarding/health"
      disabled={!pick}
    >
      <div className="space-y-3">
        {options.map((o) => (
          <Choice
            key={o}
            label={o}
            active={pick === o}
            onClick={() => setHousing(o)}
          />
        ))}
      </div>
    </StepShell>
  );
};

export const StepHealth = () => {
  const picks = useProfile((s) => s.health);
  const toggle = useProfile((s) => s.toggleHealth);
  const options = [
    "I have Medicaid right now",
    "I take prescriptions",
    "I see a therapist or counselor",
    "I need a primary care doctor",
    "None of these apply",
  ];
  return (
    <StepShell
      stepIndex={7}
      title="Anything we should know about your health?"
      subtitle="Pick any that apply. Nothing is shared without your permission."
      next="/onboarding/review"
    >
      <div className="space-y-3">
        {options.map((o) => (
          <Choice
            key={o}
            label={o}
            active={picks.includes(o)}
            onClick={() => toggle(o)}
          />
        ))}
      </div>
    </StepShell>
  );
};

const describeProfile = (name: string, age: number | null, county: string) => {
  const parts = [name.trim() || "you"];
  if (age !== null) parts.push(String(age));
  if (county) parts.push(`${county} County`);
  return parts.join(", ");
};

export const StepReview = () => {
  const name = useProfile((s) => s.name);
  const age = useProfile((s) => s.age);
  const county = useProfile((s) => s.county);
  const descriptor = describeProfile(name, age, county);
  const highlights = [
    {
      Icon: FileText,
      title: "Your 90-day plan",
      note: `Seven priorities tailored to ${descriptor}.`,
    },
    {
      Icon: Heart,
      title: "Six benefits you likely qualify for",
      note: "Chafee ETV, EYSS, extended Medicaid, KSU ASCEND, HUD FYI, HB 136.",
    },
    {
      Icon: GraduationCap,
      title: "Documents and school plan",
      note: "We tracked what you already have and what's next.",
    },
  ];
  return (
    <StepShell
      eyebrow="Review"
      title="Here's your starting plan."
      subtitle="Update any of this later from Home."
      next="/"
      cta="See my plan"
    >
      <div className="space-y-3">
        {highlights.map(({ Icon, title, note }) => (
          <div key={title} className="nest-card p-5 flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
};

export const ONBOARDING_STEPS = [
  "name",
  "age",
  "county",
  "documents",
  "education",
  "housing",
  "health",
  "review",
] as const;
