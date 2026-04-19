from app.schemas import EligibilityResult, UserProfile


BESTFIT_URL = "https://www.best-fit.app"


def get_bestfit_url() -> str:
    return BESTFIT_URL


def evaluate_eligibility(profile: UserProfile) -> list[EligibilityResult]:
    return [
        _evaluate_chafee_etv(profile),
        _evaluate_eyss(profile),
        _evaluate_georgia_medicaid_extended(profile),
        _evaluate_ksu_ascend(profile),
    ]


def _evaluate_chafee_etv(profile: UserProfile) -> EligibilityResult:
    age_ok = profile.age is not None and 18 <= profile.age <= 25
    months_ok = profile.months_in_care is not None and profile.months_in_care >= 6
    qualified = age_ok and months_ok

    if qualified:
        reason = (
            f"You appear to qualify because you are {profile.age} and reported "
            f"{profile.months_in_care} months in care, which matches the demo rule "
            "for Chafee ETV."
        )
    else:
        blockers = []
        if profile.age is None:
            blockers.append("your age was not provided")
        elif not age_ok:
            blockers.append(
                f"the demo rule requires age 18 to 25 and your profile shows age {profile.age}"
            )

        if profile.months_in_care is None:
            blockers.append("months in care was not provided")
        elif not months_ok:
            blockers.append(
                "the demo rule requires at least 6 months in care and your profile "
                f"shows {profile.months_in_care}"
            )

        reason = "You do not qualify under the demo rule because " + " and ".join(blockers) + "."

    return EligibilityResult(
        program="Chafee ETV",
        qualified=qualified,
        reason=reason,
        what_it_provides="Up to $5,000 per year for education and training expenses.",
        documents_needed=_documents_needed(
            profile,
            [
                ("photo_id", "Government-issued photo ID"),
                ("foster_care_verification", "Proof of foster care history"),
                ("school_enrollment", "School enrollment or acceptance letter"),
                ("financial_aid", "FAFSA or financial aid record"),
            ],
        ),
        next_step=(
            "Apply through Embark Georgia and gather education enrollment documents "
            "before submitting."
        ),
        apply_url="https://embarkgeorgia.org/about-etv/",
    )


def _evaluate_eyss(profile: UserProfile) -> EligibilityResult:
    qualified = profile.aged_out_at_18 is True

    if qualified:
        reason = (
            "You appear to qualify because your profile says you aged out of foster care "
            "at 18, which matches the demo rule for EYSS."
        )
    elif profile.aged_out_at_18 is False:
        reason = (
            "You do not qualify under the demo rule because EYSS is only marked as a fit "
            "when someone aged out of foster care at 18."
        )
    else:
        reason = (
            "I cannot confirm EYSS eligibility yet because the profile does not say whether "
            "you aged out of foster care at 18."
        )

    return EligibilityResult(
        program="EYSS (Extended Foster Care)",
        qualified=qualified,
        reason=reason,
        what_it_provides="Housing support and transition services through Georgia extended foster care.",
        documents_needed=_documents_needed(
            profile,
            [
                ("photo_id", "Government-issued photo ID"),
                ("aged_out_letter", "Letter or paperwork showing you aged out at 18"),
                ("placement_history", "Foster care placement or case history records"),
            ],
        ),
        next_step=(
            "Contact your Georgia foster care or transition support contact to ask about "
            "EYSS re-enrollment steps."
        ),
        apply_url="https://www.childwelfare.gov/resources/extension-foster-care-beyond-age-18-georgia/",
    )


def _evaluate_georgia_medicaid_extended(profile: UserProfile) -> EligibilityResult:
    qualified = profile.in_foster_care_at_18 is True

    if qualified:
        reason = (
            "You appear to qualify because your profile says you were in foster care at 18, "
            "which matches the demo rule for Georgia Medicaid Extended."
        )
    elif profile.in_foster_care_at_18 is False:
        reason = (
            "You do not qualify under the demo rule because this program is only marked as a "
            "fit when someone was in foster care at age 18."
        )
    else:
        reason = (
            "I cannot confirm Medicaid extension eligibility yet because the profile does not "
            "say whether you were in foster care at age 18."
        )

    return EligibilityResult(
        program="Georgia Medicaid Extended",
        qualified=qualified,
        reason=reason,
        what_it_provides="Health insurance coverage and continued access to medical care through age 26.",
        documents_needed=_documents_needed(
            profile,
            [
                ("photo_id", "Government-issued photo ID"),
                ("foster_care_at_18_proof", "Proof you were in foster care at age 18"),
                ("medicaid_application", "Completed Medicaid application or renewal paperwork"),
            ],
        ),
        next_step=(
            "Start the Medicaid application or renewal process and be ready to verify your "
            "foster care status at age 18."
        ),
        apply_url="https://www.childwelfare.gov/resources/extension-foster-care-beyond-age-18-georgia/",
    )


def _evaluate_ksu_ascend(profile: UserProfile) -> EligibilityResult:
    qualified = profile.enrolled_at_ksu is True

    if qualified:
        reason = (
            "You appear to qualify because your profile says you are enrolled at KSU, which "
            "matches the demo rule for KSU ASCEND."
        )
    elif profile.enrolled_at_ksu is False:
        reason = (
            "You do not qualify under the demo rule because KSU ASCEND is only marked as a fit "
            "for students enrolled at Kennesaw State University."
        )
    else:
        reason = (
            "I cannot confirm KSU ASCEND eligibility yet because the profile does not say "
            "whether you are enrolled at Kennesaw State University."
        )

    return EligibilityResult(
        program="KSU ASCEND",
        qualified=qualified,
        reason=reason,
        what_it_provides="Campus-based wraparound support, mentoring, and education navigation at KSU.",
        documents_needed=_documents_needed(
            profile,
            [
                ("photo_id", "Government-issued photo ID"),
                ("ksu_student_id", "KSU student ID or enrollment record"),
                ("foster_care_verification", "Proof of foster care history"),
            ],
        ),
        next_step=(
            "Reach out to the KSU ASCEND team and have your enrollment information ready "
            "for follow-up."
        ),
        apply_url="https://embarkgeorgia.org/campus-programs/kennesaw-state-university/",
    )


def _documents_needed(profile: UserProfile, required_documents: list[tuple[str, str]]) -> list[str]:
    missing_documents = [
        label for key, label in required_documents if not profile.documents.get(key, False)
    ]
    return missing_documents or [label for _, label in required_documents]
