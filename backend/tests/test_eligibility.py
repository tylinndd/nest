"""Eligibility checks for the Maria demo persona."""

from app.services.eligibility import evaluate_eligibility


EDUCATION_KEYWORDS = ("education", "school", "campus", "training", "ksu", "chafee")


def _is_education_related(result) -> bool:
    haystack = f"{result.program} {result.what_it_provides}".lower()
    return any(keyword in haystack for keyword in EDUCATION_KEYWORDS)


def test_maria_qualifies_for_chafee_etv(maria_profile):
    results = evaluate_eligibility(maria_profile)
    chafee = next((r for r in results if r.program == "Chafee ETV"), None)

    assert chafee is not None, "Chafee ETV should always be evaluated"
    assert chafee.qualified is True


def test_maria_has_at_least_one_education_eligibility_result(maria_profile):
    results = evaluate_eligibility(maria_profile)

    education_results = [r for r in results if _is_education_related(r)]
    assert education_results, "expected at least one education-related program"
