const API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000"
).replace(/\/+$/, "");

export type BackendUserProfile = {
  age: number | null;
  county: string | null;
  status: string | null;
  months_in_care: number | null;
  college_intent: string | null;
  top_concerns: string[];
  enrolled_at_ksu: boolean | null;
  aged_out_at_18: boolean | null;
  in_foster_care_at_18: boolean | null;
  documents: Record<string, boolean>;
};

export type Passage = {
  source_name: string;
  snippet: string;
  url: string | null;
};

export type ChatResponse = {
  answer: string;
  sources: string[];
  fallback: boolean;
  route_to_emergency: boolean;
  passages: Passage[];
};

export type EligibilityResult = {
  program: string;
  qualified: boolean;
  reason: string;
  what_it_provides: string;
  documents_needed: string[];
  next_step: string;
  apply_url: string | null;
};

export type TaskUrgency = "overdue" | "this_week" | "soon";

export type BackendTask = {
  id: string;
  title: string;
  description: string;
  urgency: TaskUrgency;
  due_label: string;
  action_label: string;
  action_type: string;
  action_target: string;
  completed: boolean;
};

export type IntakeResponse = {
  normalized_profile: BackendUserProfile;
  eligibility: EligibilityResult[];
  tasks: BackendTask[];
  bestfit_url: string | null;
  days_remaining: number | null;
};

export type HealthResponse = {
  ok: boolean;
  environment: string;
  model: string;
  groq_api_key_configured: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const readError = async (res: Response): Promise<unknown> => {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
};

const post = async <T>(
  path: string,
  body: unknown,
  signal: AbortSignal | undefined,
  validate: (value: unknown) => value is T,
): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    throw new ApiError(
      `POST ${path} failed (${res.status})`,
      res.status,
      await readError(res),
    );
  }
  const parsed: unknown = await res.json();
  if (!validate(parsed)) {
    throw new ApiError(`POST ${path} returned unexpected shape`, 502, parsed);
  }
  return parsed;
};

const isPassage = (v: unknown): v is Passage => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.source_name === "string" &&
    typeof r.snippet === "string" &&
    (r.url === null || typeof r.url === "string" || r.url === undefined)
  );
};

const isChatResponse = (v: unknown): v is ChatResponse => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  // `passages` is tolerated as missing so a newer frontend can still
  // talk to an older backend without crashing validation.
  const passagesOk =
    r.passages === undefined ||
    (Array.isArray(r.passages) && r.passages.every(isPassage));
  return (
    typeof r.answer === "string" &&
    Array.isArray(r.sources) &&
    r.sources.every((s) => typeof s === "string") &&
    typeof r.fallback === "boolean" &&
    typeof r.route_to_emergency === "boolean" &&
    passagesOk
  );
};

const isIntakeResponse = (v: unknown): v is IntakeResponse => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.normalized_profile === "object" &&
    Array.isArray(r.eligibility) &&
    Array.isArray(r.tasks) &&
    (r.bestfit_url === null || typeof r.bestfit_url === "string") &&
    (r.days_remaining === null || typeof r.days_remaining === "number")
  );
};

export const postChat = async (
  query: string,
  user_profile: BackendUserProfile,
  signal?: AbortSignal,
): Promise<ChatResponse> => {
  const res = await post("/chat", { query, user_profile }, signal, isChatResponse);
  // Normalize passages to an array so downstream code never branches on
  // `passages === undefined`.
  return { ...res, passages: res.passages ?? [] };
};

export const postIntake = (
  user_profile: BackendUserProfile,
  signal?: AbortSignal,
): Promise<IntakeResponse> =>
  post("/intake", { user_profile }, signal, isIntakeResponse);

const isHealthResponse = (v: unknown): v is HealthResponse => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.ok === "boolean" &&
    typeof r.environment === "string" &&
    typeof r.model === "string" &&
    typeof r.groq_api_key_configured === "boolean"
  );
};

export const getHealth = async (signal?: AbortSignal): Promise<HealthResponse> => {
  const res = await fetch(`${API_BASE}/health`, { signal });
  if (!res.ok) {
    throw new ApiError(
      `GET /health failed (${res.status})`,
      res.status,
      await readError(res),
    );
  }
  const parsed: unknown = await res.json();
  if (!isHealthResponse(parsed)) {
    throw new ApiError("GET /health returned unexpected shape", 502, parsed);
  }
  return parsed;
};
