import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: string;
  followUps?: string[];
};

type ChatState = {
  messages: ChatMsg[];
  setMessages: (updater: (m: ChatMsg[]) => ChatMsg[]) => void;
  addMessage: (msg: ChatMsg) => void;
  clear: () => void;
};

const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn("[nest.chat] read failed:", err);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(
        "[nest.chat] write failed — conversation will not persist this session:",
        err,
      );
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("[nest.chat] remove failed:", err);
    }
  },
};

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (updater) =>
        set((s) => ({ messages: updater(s.messages) })),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      clear: () => set({ messages: [] }),
    }),
    {
      name: "nest.chat",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ messages: s.messages }),
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
