"""Georgia foster-youth benefits catalog.

Static catalog mirroring ``frontend/src/data/placeholder.ts``. Kept in
sync with the frontend offline fallback so ``GET /benefits`` and the
bundled copy never drift.
"""

from __future__ import annotations

from typing import List

from app.schemas import Benefit

_CATALOG: List[Benefit] = [
    Benefit(
        id="chafee-etv",
        title="Chafee Education & Training Voucher",
        eligibility="Up to $5,000 per academic year through age 26",
        summary=(
            "Pays for tuition, books, housing, and transportation while "
            "you're enrolled in post-secondary school or training."
        ),
        source="Georgia DFCS · Chafee Program",
        status="qualify",
        cta="Start application",
        href="https://dfcs.georgia.gov/education-and-training",
        verified_on="2026-04-19",
    ),
    Benefit(
        id="eyss",
        title="Extended Youth Support Services (EYSS)",
        eligibility="Ages 18–23 who were in foster care at 18",
        summary=(
            "Continued case management, a monthly stipend, and support "
            "for housing, school, and work goals."
        ),
        source="Georgia DHS · Connected By 21",
        status="qualify",
        cta="Open Connected By 21",
        href="https://dhs.georgia.gov/connected-21",
        verified_on="2026-04-19",
    ),
    Benefit(
        id="medicaid-ext",
        title="Georgia Medicaid — Former Foster Care",
        eligibility="Automatic coverage until age 26",
        summary=(
            "Free health insurance if you aged out of Georgia foster "
            "care. No income limit."
        ),
        source="Georgia Gateway · Title IV-E",
        status="auto",
        cta="Open Gateway",
        href="https://gateway.ga.gov/access/",
        verified_on="2026-04-19",
    ),
    Benefit(
        id="ksu-ascend",
        title="KSU ASCEND Program",
        eligibility="Foster, former foster, and unstably housed students",
        summary=(
            "Year-round housing, textbooks, personal coach, and a care "
            "team at Kennesaw State."
        ),
        source="Kennesaw State · CARE Services",
        status="action",
        cta="Book intake call",
        href=(
            "https://campus.kennesaw.edu/current-students/student-affairs/"
            "wellbeing/care-services/ascend-program.php"
        ),
        verified_on="2026-04-19",
    ),
    Benefit(
        id="hud-fyi",
        title="HUD Foster Youth to Independence (FYI)",
        eligibility="Ages 18–24, aged out within 5 years",
        summary=(
            "Up to 36 months of rental assistance paired with support "
            "services through your local PHA."
        ),
        source="HUD · FYI Voucher",
        status="action",
        cta="See how to apply",
        href="https://www.hud.gov/hud-partners/public-indian-housing-fyi",
        verified_on="2026-04-19",
    ),
    Benefit(
        id="tuition-waiver",
        title="Georgia Post-Secondary Tuition Waiver",
        eligibility="Georgia foster youth under 28 at eligible public institutions",
        summary=(
            "Waives tuition and fees at TCSG technical colleges and "
            "eligible University System schools."
        ),
        source="Georgia DFCS · Tuition Waiver",
        status="qualify",
        cta="Open application",
        href="https://dfcs.georgia.gov/form/postsecondary-tuition-waiver-app",
        verified_on="2026-04-19",
    ),
]


def get_benefits_catalog() -> List[Benefit]:
    # Defensive copy so callers can't mutate the shared module-level list.
    return [benefit.model_copy() for benefit in _CATALOG]
