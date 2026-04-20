import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useIntake, hashProfile } from "./intake";
import type { Profile } from "./profile";

const maria: Profile = {
  name: "Maria",
  age: 18,
  county: "Cobb",
  documentsHave: [],
  uploadedDocs: [],
  education: "college",
  housing: "Group home",
  health: ["I have Medicaid right now"],
  completedTaskIds: [],
};

const intakePayload = {
  normalized_profile: {
    age: 18,
    county: "Cobb",
    status: null,
    months_in_care: null,
    college_intent: "thinking",
    top_concerns: ["school"],
    enrolled_at_ksu: null,
    aged_out_at_18: null,
    in_foster_care_at_18: null,
    documents: {},
  },
  eligibility: [],
  tasks: [],
  bestfit_url: "https://bestfit.example/?county=Cobb",
  days_remaining: 365,
};

const mockFetchOk = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify(intakePayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

describe("useIntake store", () => {
  beforeEach(() => {
    useIntake.getState().reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hashProfile is stable for identical profiles", () => {
    expect(hashProfile(maria)).toBe(hashProfile({ ...maria }));
  });

  it("hashProfile changes when profile changes", () => {
    const a = hashProfile(maria);
    const b = hashProfile({ ...maria, age: 19 });
    expect(a).not.toBe(b);
  });

  it("fetchIntake stores bestfit_url and days_remaining on success", async () => {
    mockFetchOk();
    await useIntake.getState().fetchIntake(maria);
    const s = useIntake.getState();
    expect(s.bestfitUrl).toBe("https://bestfit.example/?county=Cobb");
    expect(s.daysRemaining).toBe(365);
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });

  it("fetchIntake dedupes identical hashes after success", async () => {
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify(intakePayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await useIntake.getState().fetchIntake(maria);
    await useIntake.getState().fetchIntake(maria);
    await useIntake.getState().fetchIntake({ ...maria });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fetchIntake refetches when profile changes", async () => {
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify(intakePayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await useIntake.getState().fetchIntake(maria);
    await useIntake.getState().fetchIntake({ ...maria, age: 19 });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("stores 'unavailable' on 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 503 })),
    );
    await useIntake.getState().fetchIntake(maria);
    const s = useIntake.getState();
    expect(s.error).toBe("unavailable");
    expect(s.loading).toBe(false);
    expect(s.bestfitUrl).toBeNull();
  });

  it("stores 'network' on non-Response failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    await useIntake.getState().fetchIntake(maria);
    const s = useIntake.getState();
    expect(s.error).toBe("network");
    expect(s.loading).toBe(false);
  });

  it("reset clears state", async () => {
    mockFetchOk();
    await useIntake.getState().fetchIntake(maria);
    useIntake.getState().reset();
    const s = useIntake.getState();
    expect(s.bestfitUrl).toBeNull();
    expect(s.daysRemaining).toBeNull();
    expect(s.profileHash).toBeNull();
    expect(s.error).toBeNull();
  });
});
