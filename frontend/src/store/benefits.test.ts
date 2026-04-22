import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useBenefitsCatalog } from "./benefits";

const payload = [
  {
    id: "chafee-etv",
    title: "Chafee ETV",
    eligibility: "Through age 26",
    summary: "Tuition + books.",
    source: "DFCS",
    status: "qualify",
    cta: "Apply",
    href: "https://example.com/etv",
    verified_on: "2026-04-19",
  },
];

const okResponse = () =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("useBenefitsCatalog", () => {
  beforeEach(() => {
    useBenefitsCatalog.getState().reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchCatalog maps backend shape to Benefit on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okResponse()));
    await useBenefitsCatalog.getState().fetchCatalog();
    const s = useBenefitsCatalog.getState();
    expect(s.items).toHaveLength(1);
    expect(s.items?.[0]).toMatchObject({
      id: "chafee-etv",
      title: "Chafee ETV",
      status: "qualify",
      cta: "Apply",
      href: "https://example.com/etv",
      verifiedOn: "2026-04-19",
    });
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });

  it("null backend cta/href/verified_on become undefined", async () => {
    const nullPayload = [
      { ...payload[0], cta: null, href: null, verified_on: null },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(nullPayload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    await useBenefitsCatalog.getState().fetchCatalog();
    const b = useBenefitsCatalog.getState().items?.[0];
    expect(b?.cta).toBeUndefined();
    expect(b?.href).toBeUndefined();
    expect(b?.verifiedOn).toBeUndefined();
  });

  it("sets error on 502 bad-shape response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ not: "an-array" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    await useBenefitsCatalog.getState().fetchCatalog();
    const s = useBenefitsCatalog.getState();
    expect(s.error).toBe("api_502");
    expect(s.items).toBeNull();
  });

  it("sets 'unavailable' on 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 503 })),
    );
    await useBenefitsCatalog.getState().fetchCatalog();
    expect(useBenefitsCatalog.getState().error).toBe("unavailable");
  });

  it("sets 'network' on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    await useBenefitsCatalog.getState().fetchCatalog();
    expect(useBenefitsCatalog.getState().error).toBe("network");
  });

  it("dedupes concurrent + repeat calls after success", async () => {
    const spy = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", spy);
    await Promise.all([
      useBenefitsCatalog.getState().fetchCatalog(),
      useBenefitsCatalog.getState().fetchCatalog(),
    ]);
    await useBenefitsCatalog.getState().fetchCatalog();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("reset clears state", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okResponse()));
    await useBenefitsCatalog.getState().fetchCatalog();
    useBenefitsCatalog.getState().reset();
    const s = useBenefitsCatalog.getState();
    expect(s.items).toBeNull();
    expect(s.error).toBeNull();
    expect(s.loading).toBe(false);
  });
});
