import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, QrCode } from "lucide-react";
import { toast } from "sonner";

type Props = {
  /** Override the URL for tests or when hardcoding the prod URL. */
  url?: string;
  /** Optional label override; defaults to the target URL's hostname. */
  label?: string;
  /** Optional hint text under the URL. */
  hint?: string;
};

const DEFAULT_HINT =
  "Open Nest on a second device without typing the URL. Same site, same data locally — nothing is sent to us.";

export function QRPanel({ url, label, hint = DEFAULT_HINT }: Props) {
  const [copied, setCopied] = useState(false);

  const resolved = useMemo(() => {
    if (url) return url;
    if (typeof window === "undefined") return "";
    return window.location.origin + "/";
  }, [url]);

  const display = useMemo(() => {
    if (label) return label;
    try {
      return new URL(resolved).host;
    } catch {
      return resolved;
    }
  }, [resolved, label]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resolved);
      setCopied(true);
      toast.success("Copied", { id: "qr-copy", duration: 1400 });
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Couldn't copy", { id: "qr-copy" });
    }
  };

  if (!resolved) return null;

  return (
    <section className="nest-card flex items-start gap-4 p-4">
      <div className="shrink-0 rounded-xl border border-border bg-white p-2">
        <QRCodeSVG
          value={resolved}
          size={124}
          level="M"
          marginSize={0}
          aria-label={`QR code for ${display}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <QrCode className="h-3 w-3" />
          Scan to open on phone
        </p>
        <p className="mt-1 font-mono text-sm font-semibold text-foreground truncate">
          {display}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
          {hint}
        </p>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy link"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy link
            </>
          )}
        </button>
      </div>
    </section>
  );
}
