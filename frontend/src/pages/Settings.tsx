import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  Lock,
  MapPin,
  Phone,
  Printer,
  Trash2,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, type EducationPlan } from "@/store/profile";
import { DOCUMENT_CATALOG } from "@/lib/personalize";
import { printNestCard, profileToCardData } from "@/lib/nestCard";
import { exportUserData } from "@/lib/dataExport";
import { cn } from "@/lib/utils";

const EDUCATION_LABEL: Record<EducationPlan, string> = {
  college: "Heading to college",
  trade: "Heading to trade school",
  working: "Heading to work, not school",
};

const Settings = () => {
  const navigate = useNavigate();
  const profile = useProfile();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ageDraft, setAgeDraft] = useState<string>(
    profile.age !== null ? String(profile.age) : "",
  );
  const [trustedName, setTrustedName] = useState<string>(
    profile.trustedAdult?.name ?? "",
  );
  const [trustedPhone, setTrustedPhone] = useState<string>(
    profile.trustedAdult?.phone ?? "",
  );

  const docsSummary = useMemo(() => {
    const haveSet = new Set(profile.documentsHave);
    const uploadedSet = new Set(profile.uploadedDocs);
    return DOCUMENT_CATALOG.map((entry) => ({
      id: entry.id,
      title: entry.title,
      state: uploadedSet.has(entry.id)
        ? ("uploaded" as const)
        : haveSet.has(entry.id)
          ? ("have" as const)
          : ("missing" as const),
    }));
  }, [profile.documentsHave, profile.uploadedDocs]);

  const handleAgeBlur = () => {
    const trimmed = ageDraft.trim();
    if (trimmed === "") {
      profile.setAge(null);
      return;
    }
    const n = Number.parseInt(trimmed, 10);
    if (Number.isFinite(n) && n >= 10 && n <= 30) {
      profile.setAge(n);
      setAgeDraft(String(n));
    } else {
      setAgeDraft(profile.age !== null ? String(profile.age) : "");
    }
  };

  const handleWipe = () => {
    setConfirmOpen(false);
    navigate("/reset");
  };

  const saveTrustedAdult = () => {
    const name = trustedName.trim();
    const phone = trustedPhone.trim();
    if (!name || !phone) {
      profile.setTrustedAdult(null);
      return;
    }
    profile.setTrustedAdult({ name, phone });
  };

  const clearTrustedAdult = () => {
    setTrustedName("");
    setTrustedPhone("");
    profile.setTrustedAdult(null);
  };

  const handlePrintCard = () => {
    printNestCard(profileToCardData(profile));
  };

  const handleExportJson = () => {
    exportUserData();
  };

  return (
    <div className="px-5 pt-6 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Back to home"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your data
        </span>
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <h1 className="font-display text-3xl text-primary">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit the basics or review everything Nest remembers about you. All of
          it lives in this browser.
        </p>
      </motion.div>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          About you
        </p>
        <div className="nest-card p-4 space-y-4">
          <div>
            <Label
              htmlFor="settings-name"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              <UserIcon className="h-3.5 w-3.5" /> Name
            </Label>
            <Input
              id="settings-name"
              value={profile.name}
              onChange={(e) => profile.setName(e.target.value)}
              placeholder="Your name"
              className="mt-2"
            />
          </div>
          <div>
            <Label
              htmlFor="settings-age"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Age
            </Label>
            <Input
              id="settings-age"
              type="number"
              inputMode="numeric"
              min={10}
              max={30}
              value={ageDraft}
              onChange={(e) => setAgeDraft(e.target.value)}
              onBlur={handleAgeBlur}
              placeholder="18"
              className="mt-2"
            />
          </div>
          <div>
            <Label
              htmlFor="settings-county"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              <MapPin className="h-3.5 w-3.5" /> Georgia county
            </Label>
            <Input
              id="settings-county"
              value={profile.county}
              onChange={(e) => profile.setCounty(e.target.value)}
              placeholder="Cobb"
              className="mt-2"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted adult
        </p>
        <div className="nest-card p-4 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="h-4 w-4" />
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One person who picks up when you need them — caseworker, mentor,
              aunt, coach. Nest pins their number on your Home so it's one tap
              from anywhere.
            </p>
          </div>
          <div>
            <Label
              htmlFor="settings-trusted-name"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              <UserIcon className="h-3.5 w-3.5" /> Name + role
            </Label>
            <Input
              id="settings-trusted-name"
              value={trustedName}
              onChange={(e) => setTrustedName(e.target.value)}
              onBlur={saveTrustedAdult}
              placeholder="Ms. Carter · caseworker"
              className="mt-2"
            />
          </div>
          <div>
            <Label
              htmlFor="settings-trusted-phone"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              <Phone className="h-3.5 w-3.5" /> Phone
            </Label>
            <Input
              id="settings-trusted-phone"
              type="tel"
              inputMode="tel"
              value={trustedPhone}
              onChange={(e) => setTrustedPhone(e.target.value)}
              onBlur={saveTrustedAdult}
              placeholder="(470) 555-0198"
              className="mt-2"
            />
          </div>
          {profile.trustedAdult && (
            <Button
              type="button"
              variant="outline"
              onClick={clearTrustedAdult}
              className="w-full justify-center rounded-full min-h-[2.75rem]"
            >
              Remove contact
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          What Nest knows
        </p>

        <div className="nest-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Documents
          </div>
          <ul className="mt-3 space-y-2">
            {docsSummary.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-foreground">{d.title}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                    d.state === "uploaded"
                      ? "bg-primary/10 text-primary"
                      : d.state === "have"
                        ? "bg-nest-amber/15 text-nest-amber"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {d.state === "uploaded"
                    ? "Uploaded"
                    : d.state === "have"
                      ? "Have · not uploaded"
                      : "Missing"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Update documents from{" "}
            <Link
              to="/vault"
              className="font-semibold text-primary hover:underline"
            >
              the vault
            </Link>
            .
          </p>
        </div>

        <div className="nest-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" /> Plan
          </div>
          <p className="mt-2 text-sm text-foreground">
            {profile.education
              ? EDUCATION_LABEL[profile.education]
              : "Not set yet"}
          </p>
        </div>

        <div className="nest-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <HomeIcon className="h-3.5 w-3.5" /> Housing
          </div>
          <p className="mt-2 text-sm text-foreground">
            {profile.housing || "Not set yet"}
          </p>
        </div>

        <div className="nest-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> Health
          </div>
          {profile.health.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing shared yet
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {profile.health.map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Privacy
        </p>
        <Link
          to="/privacy"
          className="nest-card flex items-start gap-3 p-4 transition hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              See the privacy label
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every piece of data Nest touches, where it lives, and who ever
              sees it — listed honestly.
            </p>
          </div>
        </Link>
        <p className="text-xs text-muted-foreground">
          More on who built Nest and how it answers{" "}
          <Link
            to="/about"
            className="font-semibold text-primary hover:underline"
          >
            on the About page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Offline backup
        </p>
        <div className="nest-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Printer className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Print a Nest Card</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A wallet-sized card with your name, county, blank lines for
                Medicaid + ID numbers, and the crisis numbers that matter when
                your phone is dead.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handlePrintCard}
            variant="outline"
            className="w-full justify-center rounded-full min-h-[2.75rem]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print my Nest Card
          </Button>
        </div>

        <div className="nest-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Download className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-foreground">
                Download a JSON copy
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Everything this browser stores about you — profile, documents
                checklist, chat history, theme — in one file you can save or
                move to another device.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleExportJson}
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
          Danger zone
        </p>
        {confirmOpen ? (
          <div className="nest-card p-4 border-nest-coral/40 bg-nest-coral/5 space-y-3">
            <div>
              <p className="font-display text-lg text-foreground">
                Wipe all data?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This clears your profile, documents, and chat history from this
                browser. You'll start onboarding fresh — it can't be undone.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-full min-h-[3rem]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleWipe}
                className="flex-1 rounded-full bg-nest-coral text-white hover:bg-nest-coral/90 min-h-[3rem]"
              >
                Yes, wipe it
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmOpen(true)}
            className="w-full justify-center rounded-full border-nest-coral/40 bg-nest-coral/5 text-nest-coral hover:bg-nest-coral/10 hover:text-nest-coral min-h-[3rem]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Wipe all data
          </Button>
        )}
      </section>
    </div>
  );
};

export default Settings;
