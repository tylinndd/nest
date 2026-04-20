"""Lightweight checks for crisis routing and the 211 Georgia fallback."""

from unittest.mock import patch

from rag import chain


def test_crisis_phrase_routes_to_emergency(maria_profile):
    result = chain.answer_question(
        "I am thinking about suicide tonight", maria_profile
    )

    assert result["route_to_emergency"] is True
    assert result["fallback"] is True
    assert "988" in " ".join(result["sources"])


def test_irrelevant_question_falls_back_to_211(maria_profile):
    with patch.object(chain, "retrieve_documents", return_value=[]):
        result = chain.answer_question(
            "What is the weather on Mars today?", maria_profile
        )

    assert result["fallback"] is True
    assert result["route_to_emergency"] is False
    assert "211 Georgia" in result["sources"]
    assert "211" in result["answer"]
