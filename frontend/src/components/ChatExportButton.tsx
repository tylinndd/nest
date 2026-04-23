import { Download } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "@/store/chat";
import { chatToMarkdown, downloadMarkdown } from "@/lib/chatExport";

export const ChatExportButton = () => {
  const messages = useChat((s) => s.messages);
  const disabled = messages.length === 0;

  const handleDownload = () => {
    const now = new Date();
    const md = chatToMarkdown({ messages, exportedAt: now });
    const iso = now.toISOString().slice(0, 10);
    downloadMarkdown(md, `nest-chat-${iso}.md`);
    toast.success("Transcript downloaded", { duration: 1500 });
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      aria-label="Download chat transcript"
      title="Download chat transcript"
      className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground"
    >
      <Download className="h-3.5 w-3.5" />
    </button>
  );
};
