import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  MapPin,
  Shield,
} from "lucide-react";
import { hotlines } from "@/data/placeholder";
import { cn } from "@/lib/utils";

type EmergencyLocationState = { fromCrisis?: boolean } | null;

const Emergency = () => {
  const { state } = useLocation();
  const fromCrisis = Boolean((state as EmergencyLocationState)?.fromCrisis);

  return (
  <div className="min-h-screen bg-primary text-primary-foreground flex flex-col">
    <div
      className="pt-[calc(env(safe-area-inset-top)+1.25rem)] px-5 pb-6"
    >
      <div className="flex items-center justify-between">
        <Link
          to="/"
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/85">
          <Shield className="h-4 w-4" />
          Emergency mode
        </span>
        <div className="h-11 w-11" />
      </div>

      {fromCrisis && (
        <p
          role="status"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/90"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-nest-amber" />
          Routed by Nest · no AI on this screen
        </p>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 font-display text-4xl leading-tight"
      >
        Help is available.
      </motion.h1>
      <p className="mt-3 text-sm opacity-85">
        Tap any line to call or text. If you're in immediate danger, dial 911.
      </p>

      <a
        href="tel:911"
        className="mt-6 flex items-center justify-center gap-2 w-full rounded-full bg-nest-coral text-white py-4 font-semibold shadow-sm min-h-[3.5rem]"
      >
        <Phone className="h-5 w-5" /> Call 911
      </a>
    </div>

    <div className="flex-1 bg-background text-foreground rounded-t-[2rem] px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <h2 className="font-display text-xl text-primary">Crisis lines</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        24/7 · confidential · no cost
      </p>
      <div className="mt-4 space-y-3">
        {hotlines.map((h, i) => {
          const Icon = h.kind === "text" ? MessageSquare : Phone;
          const href =
            h.kind === "text"
              ? `sms:${h.number.replace(/\D/g, "")}?body=HOME`
              : `tel:${h.number.replace(/\D/g, "")}`;
          return (
            <motion.a
              key={h.id}
              href={href}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.05 }}
              className={cn(
                "nest-card p-4 flex items-center gap-4 min-h-[4.5rem] border-l-4",
                h.kind === "text" ? "border-l-nest-amber" : "border-l-nest-coral",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  h.kind === "text"
                    ? "bg-nest-amber/15 text-nest-amber"
                    : "bg-nest-coral/15 text-nest-coral",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground leading-tight">
                  {h.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {h.subtitle}
                </p>
              </div>
              <span className="font-display text-lg text-primary">
                {h.number}
              </span>
            </motion.a>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-xl text-primary">
        Need a safe place tonight?
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <a
          href="tel:211"
          className="nest-card p-5 text-left min-h-[6.5rem]"
        >
          <MapPin className="h-6 w-6 text-primary" />
          <p className="mt-3 font-semibold">Nearest shelter</p>
          <p className="text-xs text-muted-foreground mt-1">
            211 routes you to local beds
          </p>
        </a>
        <a
          href="sms:741741?body=HOME"
          className="nest-card p-5 text-left min-h-[6.5rem]"
        >
          <MessageSquare className="h-6 w-6 text-primary" />
          <p className="mt-3 font-semibold">Text a counselor</p>
          <p className="text-xs text-muted-foreground mt-1">
            Free & confidential
          </p>
        </a>
      </div>
    </div>
  </div>
  );
};

export default Emergency;
