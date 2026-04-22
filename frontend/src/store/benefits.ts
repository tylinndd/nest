import { create } from "zustand";
import { ApiError, getBenefits, type BackendBenefit } from "@/lib/api";
import type { Benefit } from "@/data/placeholder";

type BenefitsState = {
  items: Benefit[] | null;
  loading: boolean;
  error: string | null;
};

type BenefitsActions = {
  fetchCatalog: () => Promise<void>;
  reset: () => void;
};

const initialState: BenefitsState = {
  items: null,
  loading: false,
  error: null,
};

const mapBenefit = (b: BackendBenefit): Benefit => ({
  id: b.id,
  title: b.title,
  eligibility: b.eligibility,
  summary: b.summary,
  source: b.source,
  status: b.status,
  cta: b.cta ?? undefined,
  href: b.href ?? undefined,
  verifiedOn: b.verified_on ?? undefined,
});

let activeController: AbortController | null = null;

export const useBenefitsCatalog = create<BenefitsState & BenefitsActions>()(
  (set, get) => ({
    ...initialState,
    fetchCatalog: async () => {
      const { loading, items, error } = get();
      if (loading) return;
      if (items && !error) return;

      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      set({ loading: true, error: null });

      try {
        const res = await getBenefits(controller.signal);
        if (controller.signal.aborted) return;
        set({ items: res.map(mapBenefit), loading: false, error: null });
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
  }),
);
