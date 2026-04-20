import { create } from "zustand";
import {
  postIntake,
  ApiError,
  type BackendTask,
  type EligibilityResult,
} from "@/lib/api";
import { toBackendProfile } from "@/lib/profileMap";
import type { Profile } from "@/store/profile";

type IntakeState = {
  bestfitUrl: string | null;
  daysRemaining: number | null;
  eligibility: EligibilityResult[];
  tasks: BackendTask[];
  loading: boolean;
  error: string | null;
  profileHash: string | null;
};

type IntakeActions = {
  fetchIntake: (profile: Profile) => Promise<void>;
  reset: () => void;
};

const initialState: IntakeState = {
  bestfitUrl: null,
  daysRemaining: null,
  eligibility: [],
  tasks: [],
  loading: false,
  error: null,
  profileHash: null,
};

let activeController: AbortController | null = null;

export const hashProfile = (profile: Profile): string =>
  JSON.stringify(toBackendProfile(profile));

export const useIntake = create<IntakeState & IntakeActions>()((set, get) => ({
  ...initialState,
  fetchIntake: async (profile) => {
    const hash = hashProfile(profile);
    const current = get();
    if (current.loading && current.profileHash === hash) return;
    if (!current.loading && current.profileHash === hash && current.error === null) return;

    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    set({ loading: true, error: null, profileHash: hash });

    try {
      const res = await postIntake(toBackendProfile(profile), controller.signal);
      if (controller.signal.aborted) return;
      set({
        bestfitUrl: res.bestfit_url,
        daysRemaining: res.days_remaining,
        eligibility: res.eligibility,
        tasks: res.tasks,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "unavailable"
            : `api_${err.status}`
          : "network";
      set({ loading: false, error: message });
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  },
  reset: () => {
    activeController?.abort();
    activeController = null;
    set(initialState);
  },
}));
