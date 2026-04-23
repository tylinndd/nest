import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";
import type { Passage } from "@/lib/api";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: string;
  followUps?: string[];
  fallback?: boolean;
  passages?: Passage[];
  elapsedMs?: number;
};

export const CHAT_MESSAGE_CAP = 200;

const cap = (messages: ChatMsg[]): ChatMsg[] =>
  messages.length > CHAT_MESSAGE_CAP
    ? messages.slice(messages.length - CHAT_MESSAGE_CAP)
    : messages;

export const PENDING_INPUT_CAP = 2000;

type ChatState = {
  messages: ChatMsg[];
  pendingInput: string;
  setMessages: (updater: (m: ChatMsg[]) => ChatMsg[]) => void;
  addMessage: (msg: ChatMsg) => void;
  setPendingInput: (value: string) => void;
  clear: () => void;
};

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      pendingInput: "",
      setMessages: (updater) =>
        set((s) => ({ messages: cap(updater(s.messages)) })),
      addMessage: (msg) =>
        set((s) => ({ messages: cap([...s.messages, msg]) })),
      setPendingInput: (value) =>
        set({ pendingInput: value.slice(0, PENDING_INPUT_CAP) }),
      clear: () => set({ messages: [], pendingInput: "" }),
    }),
    {
      name: "nest.chat",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        messages: s.messages,
        pendingInput: s.pendingInput,
      }),
      migrate: (persisted, version) => {
        const p = (persisted as Partial<ChatState>) ?? {};
        if (version < 2) {
          return { ...p, pendingInput: "" };
        }
        return p;
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            "[nest.chat] rehydrate failed, starting fresh:",
            error,
          );
        }
      },
    },
  ),
);
