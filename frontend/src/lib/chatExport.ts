import type { ChatMsg } from "@/store/chat";

export type ChatExportInput = {
  messages: ChatMsg[];
  exportedAt: Date;
};

const escapeMd = (s: string): string =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");

const formatTurn = (m: ChatMsg): string => {
  const label = m.role === "user" ? "**You:**" : "**Nest:**";
  const body = escapeMd(m.text.trim());
  const lines = [`${label} ${body}`];
  if (m.role === "assistant" && m.passages && m.passages.length > 0) {
    lines.push("");
    lines.push("Sources:");
    for (const p of m.passages) {
      if (p.url) {
        lines.push(`- [${escapeMd(p.source_name)}](${p.url})`);
      } else {
        lines.push(`- ${escapeMd(p.source_name)}`);
      }
    }
  }
  return lines.join("\n");
};

export const chatToMarkdown = ({
  messages,
  exportedAt,
}: ChatExportInput): string => {
  const iso = exportedAt.toISOString().slice(0, 10);
  const header = [
    "# Nest Navigator transcript",
    "",
    `_Exported ${iso}._ This transcript was exported from your device; Nest keeps no server-side record of your chat.`,
    "",
    "---",
    "",
  ];

  const body =
    messages.length === 0
      ? ["_No messages yet._"]
      : messages.map(formatTurn);

  const footer = [
    "",
    "---",
    "",
    "_This file was generated on your device. Share it how you like._",
  ];

  return [...header, ...body, ...footer].join("\n").trimEnd() + "\n";
};

export const downloadMarkdown = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
