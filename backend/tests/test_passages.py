"""Tests for citation passage extraction (the "show the source" moment).

The frontend SourceReveal drawer renders these passages so judges and
users can verify that an answer is actually grounded in a specific
paragraph of a Georgia policy document.
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch

from rag import chain


def _doc(source_name: str, content: str, url: str | None = None):
    return SimpleNamespace(
        page_content=content,
        metadata={"source_name": source_name, "contact_url": url or ""},
    )


def test_extract_passages_returns_source_name_snippet_and_url():
    docs = [
        _doc(
            "DFCS Division 5.3",
            "Youth aging out of foster care in Georgia may qualify for the "
            "Chafee Education and Training Voucher through age 26.",
            "https://example.test/dfcs",
        )
    ]

    passages = chain.extract_passages(docs)

    assert len(passages) == 1
    p = passages[0]
    assert p["source_name"] == "DFCS Division 5.3"
    assert "Chafee" in p["snippet"]
    assert p["url"] == "https://example.test/dfcs"


def test_extract_passages_deduplicates_by_source_name():
    docs = [
        _doc("Chafee ETV", "First chunk talks about the voucher."),
        _doc("Chafee ETV", "Second chunk talks about the same program."),
        _doc("ILP Handbook", "Independent Living Program overview."),
    ]

    passages = chain.extract_passages(docs)

    names = [p["source_name"] for p in passages]
    assert names == ["Chafee ETV", "ILP Handbook"]


def test_extract_passages_truncates_long_content():
    long_text = "Sentence one. " + ("more detail. " * 200)
    docs = [_doc("Long Policy", long_text)]

    passages = chain.extract_passages(docs)

    snippet = passages[0]["snippet"]
    assert len(snippet) <= 521  # room for the ellipsis
    assert snippet.endswith("…")


def test_extract_passages_skips_empty_snippets():
    docs = [_doc("Empty Policy", "   ")]

    passages = chain.extract_passages(docs)

    assert passages == []


def test_extract_passages_skips_docs_without_source_name():
    docs = [
        SimpleNamespace(page_content="some text", metadata={}),
        _doc("Valid", "Valid passage text."),
    ]

    passages = chain.extract_passages(docs)

    assert len(passages) == 1
    assert passages[0]["source_name"] == "Valid"


def test_extract_passages_sets_url_to_none_when_missing():
    docs = [_doc("No URL Source", "Content here.", url="")]

    passages = chain.extract_passages(docs)

    assert passages[0]["url"] is None


def test_crisis_response_returns_empty_passages(maria_profile):
    result = chain.answer_question(
        "I am thinking about suicide tonight", maria_profile
    )

    assert result["passages"] == []


def test_retrieval_fallback_returns_empty_passages(maria_profile):
    with patch.object(chain, "retrieve_documents", return_value=[]):
        result = chain.answer_question(
            "Weather on Mars tonight", maria_profile
        )

    assert result["passages"] == []
