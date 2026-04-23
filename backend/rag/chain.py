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


_SNIPPET_MAX = 520


def _shorten(text: str, limit: int = _SNIPPET_MAX) -> str:
    clean = " ".join(text.split())
    if len(clean) <= limit:
        return clean
    # prefer breaking at a sentence/clause boundary close to the limit
    window = clean[:limit]
    for sep in (". ", "; ", ", "):
        idx = window.rfind(sep)
        if idx >= int(limit * 0.6):
            return window[: idx + 1].rstrip() + "…"
    return window.rstrip() + "…"


def extract_passages(docs) -> list[dict]:
    """Build passage payloads (deduped by source) for the frontend drawer.

    The frontend already shows a source name; passages let it also show
    the exact text the RAG retriever fed the LLM so judges and users can
    verify that answers are actually grounded.
    """
    seen: dict[str, dict] = {}
    ordered: list[str] = []
    for doc in docs:
        name = doc.metadata.get("source_name")
        if not name or name in seen:
            continue
        snippet = _shorten(doc.page_content or "")
        if not snippet:
            continue
        url = doc.metadata.get("contact_url") or None
        seen[name] = {"source_name": name, "snippet": snippet, "url": url or None}
        ordered.append(name)
    return [seen[n] for n in ordered]


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


def _wrap_user_query(query: str) -> str:
    """Strip any pre-existing delimiter tags, then wrap in <user_query>.

    Prevents a user from closing the tag early and emitting their own
    "instructions" section that the model might treat as system text.
    """
    stripped = query.replace("<user_query>", "").replace("</user_query>", "")
    return f"<user_query>{stripped}</user_query>"


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
            "passages": [],
        }

    docs = retrieve_documents(query, k=4)
    docs = rerank_for_profile(docs, user_profile)

    if not docs:
        return {
            "answer": FALLBACK_TEXT,
            "sources": ["211 Georgia"],
            "fallback": True,
            "route_to_emergency": False,
            "passages": [],
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
{_wrap_user_query(query)}
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
            "passages": [],
        }

    return {
        "answer": answer,
        "sources": sources,
        "fallback": False,
        "route_to_emergency": False,
        "passages": extract_passages(docs),
    }


__all__ = [
    "FALLBACK_TEXT",
    "CRISIS_KEYWORDS",
    "ConfigError",
    "answer_question",
    "format_context",
    "extract_sources",
    "extract_passages",
    "get_llm",
    "is_crisis",
    "retrieve_documents",
]
