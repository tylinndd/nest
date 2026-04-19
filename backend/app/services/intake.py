from app.schemas import IntakeResponse, UserProfile
from app.services.eligibility import evaluate_eligibility, get_bestfit_url
from app.services.tasks import generate_tasks


KNOWN_DOCUMENT_KEYS = {
    "birth_certificate",
    "ssn_card",
    "state_id",
    "immunization_records",
    "photo_id",
    "foster_care_verification",
    "school_enrollment",
    "financial_aid",
    "aged_out_letter",
    "placement_history",
    "foster_care_at_18_proof",
    "medicaid_application",
    "ksu_student_id",
}


def normalize_profile(profile: UserProfile) -> UserProfile:
    normalized_documents = {
        key: bool(value)
        for key, value in profile.documents.items()
        if key in KNOWN_DOCUMENT_KEYS
    }

    for key in KNOWN_DOCUMENT_KEYS:
        normalized_documents.setdefault(key, False)

    normalized_concerns = []
    for concern in profile.top_concerns:
        normalized_concern = concern.strip().lower()
        if normalized_concern and normalized_concern not in normalized_concerns:
            normalized_concerns.append(normalized_concern)

    return UserProfile(
        age=profile.age,
        county=_normalize_county(profile.county),
        status=_normalize_status(profile.status),
        months_in_care=profile.months_in_care,
        college_intent=_normalize_college_intent(profile.college_intent),
        top_concerns=normalized_concerns,
        enrolled_at_ksu=bool(profile.enrolled_at_ksu),
        aged_out_at_18=bool(profile.aged_out_at_18),
        in_foster_care_at_18=bool(profile.in_foster_care_at_18),
        documents=normalized_documents,
    )


def build_intake_response(profile: UserProfile) -> IntakeResponse:
    normalized_profile = normalize_profile(profile)
    eligibility = evaluate_eligibility(normalized_profile)
    tasks = generate_tasks(normalized_profile, eligibility)

    return IntakeResponse(
        normalized_profile=normalized_profile,
        eligibility=eligibility,
        tasks=tasks,
        bestfit_url=get_bestfit_url(),
        days_remaining=_compute_days_remaining(normalized_profile),
    )


def _normalize_county(county: str | None) -> str | None:
    if county is None:
        return None

    normalized = county.strip()
    if not normalized:
        return None

    lowered = normalized.lower()
    if lowered.endswith(" county"):
        normalized = normalized[: -len(" county")].strip()

    return " ".join(part.capitalize() for part in normalized.split())


def _normalize_status(status: str | None) -> str | None:
    if status is None:
        return None

    normalized = status.strip().lower()
    if normalized in {"aged out", "aged_out"}:
        return "aged_out"
    if normalized in {"in care", "in_care"}:
        return "in_care"
    return normalized or None


def _normalize_college_intent(college_intent: str | None) -> str | None:
    if college_intent is None:
        return None

    normalized = college_intent.strip().lower()
    if not normalized:
        return None

    if normalized in {"not now", "not_now"}:
        return "not_now"

    return normalized


def _compute_days_remaining(profile: UserProfile) -> int:
    if profile.status == "aged_out":
        return 0

    return 90
