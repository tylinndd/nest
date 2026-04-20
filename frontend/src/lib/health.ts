import { getHealth } from "@/lib/api";

const PROBE_TIMEOUT_MS = 3000;

export type ProbeResult = { ok: boolean; detail?: string };

export const probeHealth = async (): Promise<ProbeResult> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await getHealth(controller.signal);
    return { ok: res.ok === true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, detail: "timeout" };
    }
    const detail =
      err instanceof Error && err.message ? err.message : "unreachable";
    return { ok: false, detail };
  } finally {
    clearTimeout(timer);
  }
};
