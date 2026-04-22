import { create } from "zustand";
import type { DemoPersona } from "@/lib/demo";

export type TourStop = {
  persona: DemoPersona;
  path: string;
  durationMs: number;
  headline: string;
};

export const TOUR_STOPS: TourStop[] = [
  {
    persona: "maria",
    path: "/",
    durationMs: 8000,
    headline: "Maria · 18 · aging out this month",
  },
  {
    persona: "maria",
    path: "/navigator",
    durationMs: 6000,
    headline: "Maria asks Navigator for guidance",
  },
  {
    persona: "maria",
    path: "/vault",
    durationMs: 5000,
    headline: "Maria's document vault",
  },
  {
    persona: "marcus",
    path: "/",
    durationMs: 8000,
    headline: "Marcus · 17 · one year to plan",
  },
  {
    persona: "marcus",
    path: "/navigator",
    durationMs: 6000,
    headline: "Marcus plans his senior year",
  },
  {
    persona: "marcus",
    path: "/vault",
    durationMs: 5000,
    headline: "Marcus's empty vault — where to start",
  },
  {
    persona: "jade",
    path: "/",
    durationMs: 8000,
    headline: "Jade · 22 · two years post-care",
  },
  {
    persona: "jade",
    path: "/navigator",
    durationMs: 6000,
    headline: "Jade on Medicaid + next steps",
  },
  {
    persona: "jade",
    path: "/vault",
    durationMs: 5000,
    headline: "Jade's vault — ready for anything",
  },
];

export const TOUR_TOTAL_MS = TOUR_STOPS.reduce(
  (sum, s) => sum + s.durationMs,
  0,
);

type TourState = {
  active: boolean;
  paused: boolean;
  stepIndex: number;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  next: () => void;
  prev: () => void;
};

export const useTour = create<TourState>((set) => ({
  active: false,
  paused: false,
  stepIndex: 0,
  start: () => set({ active: true, paused: false, stepIndex: 0 }),
  stop: () => set({ active: false, paused: false, stepIndex: 0 }),
  pause: () => set({ paused: true }),
  resume: () => set({ paused: false }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  next: () =>
    set((s) => {
      const nextIdx = s.stepIndex + 1;
      if (nextIdx >= TOUR_STOPS.length) {
        return { active: false, paused: false, stepIndex: 0 };
      }
      return { stepIndex: nextIdx };
    }),
  prev: () =>
    set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),
}));
