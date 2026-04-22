import { create } from "zustand";

/**
 * In-memory log of every network request Nest makes this session.
 *
 * Deliberately NOT persisted. The log lives only in memory and resets on
 * refresh — the point is to prove transparency in the moment, not to
 * keep a history. We also never log request bodies so the log itself
 * can't leak profile data back out of the privacy guarantee.
 */

export type NetworkStatus = number | "network-error" | "pending";

export type NetworkEntry = {
  id: string;
  method: string;
  path: string;
  purpose: string;
  status: NetworkStatus;
  startedAt: number;
  durationMs: number | null;
  ok: boolean;
};

type StartInput = {
  method: string;
  path: string;
  purpose: string;
};

type FinishInput = {
  status: NetworkStatus;
  ok: boolean;
};

const MAX_ENTRIES = 50;

const nextId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

type NetworkLogState = {
  entries: NetworkEntry[];
  start: (input: StartInput) => string;
  finish: (id: string, input: FinishInput) => void;
  clear: () => void;
};

export const useNetworkLog = create<NetworkLogState>((set) => ({
  entries: [],
  start: (input) => {
    const id = nextId();
    const entry: NetworkEntry = {
      id,
      method: input.method,
      path: input.path,
      purpose: input.purpose,
      status: "pending",
      startedAt: Date.now(),
      durationMs: null,
      ok: false,
    };
    set((s) => {
      const next = [...s.entries, entry];
      return {
        entries:
          next.length > MAX_ENTRIES
            ? next.slice(next.length - MAX_ENTRIES)
            : next,
      };
    });
    return id;
  },
  finish: (id, { status, ok }) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              ok,
              durationMs: Date.now() - e.startedAt,
            }
          : e,
      ),
    })),
  clear: () => set({ entries: [] }),
}));
