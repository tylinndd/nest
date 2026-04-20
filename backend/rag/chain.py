"""Question-answering chain for the Nest backend.

The LLM client is created lazily on first use so importing this module
(or hitting ``/health``) never crashes when ``GROQ_API_KEY`` is unset.
"""

from __future__ import annotations

from app.config import ConfigError, get_settings
from rag.prompt import SYSTEM_PROMPT
from rag.retreiver import retrieve_documents, rerank_for_profile

FALLBACK_TEXT = (
    "I don't have that specific information. Please call 211 Georgia: dial 2-1-1."
)

CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "hurt myself",
    "self harm",
    "unsafe",
    "abuse",
    "crisis",
    "emergency",
    "homeless tonight",
    "need help right now",
    "i am not safe",
]


def is_crisis(query: str) -> bool:
    q = query.lower()
    return any(keyword in q for keyword in CRISIS_KEYWORDS)


def format_context(docs) -> str:
    blocks = []
    for i, doc in enumerate(docs, 1):
        blocks.append(
            f"""[Document {i}]
{doc.page_content}
SourceName: {doc.metadata.get("source_name", "Unknown")}
"""
        )
    return "\n\n".join(blocks)


def extract_sources(docs) -> list[str]:
    seen = []
    for doc in docs:
        source = doc.metadata.get("source_name")
        if source and source not in seen:
            seen.append(source)
    return seen


_llm = None


def get_llm():
    """Construct the Groq chat client on first use.

    Kept lazy so module import (and ``/health``) succeeds even when the
    key is missing. Raises :class:`ConfigError` with an actionable message
    when the key truly is needed.
    """
    global _llm
    if _llm is None:
        from langchain_groq import ChatGroq

        settings = get_settings()
        _llm = ChatGroq(
            model=settings.model_name,
            api_key=settings.groq_api_key,
            temperature=0,
            max_retries=2,
        )
    return _llm


def answer_question(query: str, user_profile):
    if is_crisis(query):
        return {
            "answer": (
                "You deserve immediate human support right now. "
                "Please call 988 for crisis help or 211 Georgia for urgent "
                "housing, food, and support."
            ),
            "sources": ["988", "211 Georgia"],
            "fallback": True,
            "route_to_emergency": True,
        }

    docs = retrieve_documents(query, k=4)
    docs = rerank_for_profile(docs, user_profile)

    if not docs:
        return {
            "answer": FALLBACK_TEXT,
            "sources": ["211 Georgia"],
            "fallback": True,
            "route_to_emergency": False,
        }

    context = format_context(docs)

    profile_summary = f"""
User profile:
- Age: {user_profile.age}
- County: {user_profile.county}
- Status: {user_profile.status}
- Top concerns: {", ".join(user_profile.top_concerns)}
- Enrolled at KSU: {user_profile.enrolled_at_ksu}
- Aged out at 18: {user_profile.aged_out_at_18}
- In foster care at 18: {user_profile.in_foster_care_at_18}
""".strip()

    user_prompt = f"""
{profile_summary}

Context:
{context}

Question:
{query}
""".strip()

    response = get_llm().invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
    )

    answer = response.content.strip()
    sources = extract_sources(docs)

    if "I don't have that specific information" in answer:
        return {
            "answer": FALLBACK_TEXT,
            "sources": ["211 Georgia"],
            "fallback": True,
            "route_to_emergency": False,
        }

    return {
        "answer": answer,
        "sources": sources,
        "fallback": False,
        "route_to_emergency": False,
    }


__all__ = [
    "FALLBACK_TEXT",
    "CRISIS_KEYWORDS",
    "ConfigError",
    "answer_question",
    "format_context",
    "extract_sources",
    "get_llm",
    "is_crisis",
    "retrieve_documents",
]
