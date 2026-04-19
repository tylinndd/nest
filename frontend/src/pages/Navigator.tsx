import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send } from "lucide-react";
import { chatSeed } from "@/data/placeholder";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string; source?: string };

const suggestionChips = [
  "I might be couch-surfing this weekend",
  "What docs do I need for KSU ASCEND?",
  "Can I keep Medicaid after I turn 18?",
];

const Navigator = () => {
  const [messages, setMessages] = useState<Msg[]>(chatSeed);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;
    const userMsg: Msg = { role: "user", text };
    const reply: Msg = {
      role: "assistant",
      text:
        "You're still covered — Georgia automatically keeps former foster youth on Medicaid until age 26 with no income test. I can pull up the exact member ID lookup if you want.",
      source: "Georgia DFCS · Title IV-E Medicaid · Section 1002.1",
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="px-5 pt-5">
        <p className="text-sm text-muted-foreground">Always on · private</p>
        <h1 className="font-display text-3xl text-primary">AI Navigator</h1>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar"
      >
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={isUser ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-3xl px-4 py-3 text-sm",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border text-foreground rounded-bl-md",
                )}
              >
                <p className="leading-relaxed">{m.text}</p>
                {m.source && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Source · {m.source}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {suggestionChips.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-full bg-nest-cream border border-border px-2 py-2">
          <button
            aria-label="Attach"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary"
          >
            <Plus className="h-5 w-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask Nest anything…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <button
            onClick={() => send()}
            aria-label="Send"
            disabled={!input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigator;
