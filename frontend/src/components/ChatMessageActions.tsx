import { useEffect, useState } from "react";
import { Copy, Check, Volume2, Square, Mail, Printer } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  source?: string;
  share?: boolean;
};

const supportsSpeech = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

const buildShareBody = (text: string, source: string | undefined) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines = [text.trim()];
  if (source) lines.push("", `Source: ${source}`);
  lines.push("", `Shared from Nest · ${origin}`);
  return lines.join("\n");
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const printAnswer = (text: string, source: string | undefined) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const body = escapeHtml(text.trim()).replace(/\n/g, "<br />");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>From Nest</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
         color: #1a1a1a; margin: 0; padding: 48px; line-height: 1.55;
         font-size: 14px; }
  .wordmark { font-weight: 700; color: #2f5d3a; font-size: 18px;
              letter-spacing: 0.02em; }
  h1 { font-size: 22px; font-weight: 700; margin: 8px 0 24px; color: #2f5d3a; }
  p { margin: 0 0 16px; }
  .answer { white-space: pre-wrap; border-left: 3px solid #2f5d3a;
            padding: 4px 0 4px 16px; margin: 0 0 24px; color: #1a1a1a; }
  .source { display: inline-block; font-size: 11px; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.1em;
            color: #555; background: #eee; padding: 4px 10px; border-radius: 999px; }
  footer { margin-top: 40px; font-size: 11px; color: #777; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="wordmark">Nest</div>
  <h1>From Nest</h1>
  <div class="answer">${body}</div>
  ${source ? `<span class="source">Source &middot; ${escapeHtml(source)}</span>` : ""}
  <footer>Shared from Nest &middot; ${escapeHtml(origin)}</footer>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    toast.error("Couldn't open the print view", { id: "chat-print" });
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 200);
  };
  win.onafterprint = cleanup;
  const runPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      toast.error("Couldn't open the print view", { id: "chat-print" });
      iframe.remove();
      return;
    }
    // Safari / some browsers never fire onafterprint — hard fallback.
    window.setTimeout(cleanup, 2000);
  };
  if (doc.readyState === "complete") {
    runPrint();
  } else {
    iframe.onload = runPrint;
  }
};

export function ChatMessageActions({ text, source, share = true }: Props) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = supportsSpeech();

  useEffect(() => {
    return () => {
      if (canSpeak && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [canSpeak]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied", { id: "chat-copy", duration: 1600 });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy", { id: "chat-copy" });
    }
  };

  const handleSpeak = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.speak(utter);
    setSpeaking(true);
  };

  const mailHref = `mailto:?subject=${encodeURIComponent(
    "From Nest",
  )}&body=${encodeURIComponent(buildShareBody(text, source))}`;

  return (
    <div className="mt-1.5 flex items-center gap-1 pl-1">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy message"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {canSpeak && (
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={speaking ? "Stop reading" : "Read aloud"}
          aria-pressed={speaking}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            speaking
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "hover:bg-muted hover:text-foreground",
          )}
        >
          {speaking ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      {share && (
        <>
          <a
            href={mailHref}
            aria-label="Email this answer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => printAnswer(text, source)}
            aria-label="Print this answer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
