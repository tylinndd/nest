"""Catalog contract for the Nest benefits listing."""

from app.schemas import Benefit
from app.services.benefits import get_benefits_catalog


EXPECTED_IDS = [
    "chafee-etv",
    "eyss",
    "medicaid-ext",
    "ksu-ascend",
    "hud-fyi",
    "tuition-waiver",
]


def test_catalog_returns_all_six_programs_in_order():
    catalog = get_benefits_catalog()

    assert [b.id for b in catalog] == EXPECTED_IDS


def test_catalog_entries_are_benefit_models():
    catalog = get_benefits_catalog()

    assert all(isinstance(b, Benefit) for b in catalog)
    for b in catalog:
        assert b.status in {"qualify", "action", "auto"}
        assert b.title and b.eligibility and b.summary and b.source
        assert b.verified_on, f"{b.id} should carry a verified_on date"


def test_catalog_returns_defensive_copy():
    catalog = get_benefits_catalog()
    catalog.pop()
    catalog[0].title = "mutated"

    fresh = get_benefits_catalog()

    assert [b.id for b in fresh] == EXPECTED_IDS
    assert fresh[0].title == "Chafee Education & Training Voucher"
