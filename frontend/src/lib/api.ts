const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"
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

export type ChatResponse = {
  answer: string;
  sources: string[];
  fallback: boolean;
  route_to_emergency: boolean;
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
  signal?: AbortSignal,
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
  return (await res.json()) as T;
};

export const postChat = (
  query: string,
  user_profile: BackendUserProfile,
  signal?: AbortSignal,
): Promise<ChatResponse> =>
  post<ChatResponse>("/chat", { query, user_profile }, signal);

export const postIntake = (
  user_profile: BackendUserProfile,
  signal?: AbortSignal,
): Promise<IntakeResponse> =>
  post<IntakeResponse>("/intake", { user_profile }, signal);

export const getHealth = async (signal?: AbortSignal): Promise<HealthResponse> => {
  const res = await fetch(`${API_BASE}/health`, { signal });
  if (!res.ok) {
    throw new ApiError(`GET /health failed (${res.status})`, res.status);
  }
  return (await res.json()) as HealthResponse;
};
