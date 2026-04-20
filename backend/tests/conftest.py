"""Shared pytest setup and fixtures for the Nest backend tests.

The tests run offline, so we stub the LangChain integrations (Groq,
Chroma, HuggingFace) before any production module imports them. This
also pre-populates a dummy ``GROQ_API_KEY`` so :mod:`app.config`
considers the environment fully configured.
"""

from __future__ import annotations

import os
import sys
import types
from pathlib import Path
from unittest.mock import MagicMock

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("ENVIRONMENT", "test")


def _stub_module(name: str) -> types.ModuleType:
    module = types.ModuleType(name)
    sys.modules[name] = module
    return module


if "langchain_groq" not in sys.modules:
    _stub_module("langchain_groq").ChatGroq = MagicMock()

if "langchain_chroma" not in sys.modules:
    _stub_module("langchain_chroma").Chroma = MagicMock()

if "langchain_huggingface" not in sys.modules:
    _stub_module("langchain_huggingface").HuggingFaceEmbeddings = MagicMock()


from app.schemas import UserProfile  # noqa: E402


@pytest.fixture
def maria_profile() -> UserProfile:
    """Demo persona Maria - the canonical Nest test user.

    18 years old, Cobb County, foster care history, missing birth
    certificate, interested in attending KSU.
    """
    return UserProfile(
        age=18,
        county="Cobb",
        status="aged_out",
        months_in_care=24,
        college_intent="thinking",
        top_concerns=["school", "housing"],
        enrolled_at_ksu=False,
        aged_out_at_18=True,
        in_foster_care_at_18=True,
        documents={
            "birth_certificate": False,
            "ssn_card": True,
            "state_id": True,
        },
    )
