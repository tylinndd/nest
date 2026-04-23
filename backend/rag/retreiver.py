"""Vector store retrieval for the Nest RAG pipeline.

The Chroma client and HuggingFace embeddings are constructed lazily so
importing this module never touches disk or downloads model weights.
That keeps cold-start cheap on Render and lets ``/health`` respond even
when the vector store has not been ingested yet.
"""

from __future__ import annotations

import logging

from app.config import get_settings


logger = logging.getLogger("uvicorn.error")


class RetrievalInfrastructureError(RuntimeError):
    """Raised when similarity_search fails for non-domain reasons.

    The legitimate "no matching documents" case returns [] naturally from
    Chroma. This exception is for infrastructure failures (missing
    persistence dir, OOM, embedding model download failure, disk full)
    that must NOT be silently flattened into the empty-result path —
    doing so would hide every real outage behind a 211 fallback answer.
    """


_embeddings = None
_vectorstore = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_huggingface import HuggingFaceEmbeddings

        settings = get_settings()
        _embeddings = HuggingFaceEmbeddings(model_name=settings.embedding_model)
    return _embeddings


def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        from langchain_chroma import Chroma

        settings = get_settings()
        _vectorstore = Chroma(
            collection_name=settings.collection_name,
            persist_directory=str(settings.chroma_dir),
            embedding_function=get_embeddings(),
        )
    return _vectorstore


def retrieve_documents(query: str, k: int = 4):
    """Run a similarity search against the vector store.

    Returns ``[]`` when the store exists but has no matches (the domain
    no-match path). Raises :class:`RetrievalInfrastructureError` for any
    underlying infra failure so callers can return a distinguishable 503
    instead of conflating "we searched and found nothing" with "we
    couldn't search at all".
    """
    try:
        return get_vectorstore().similarity_search(query, k=k)
    except Exception as exc:
        logger.exception("retrieval infra failure (query=%r, k=%d)", query, k)
        raise RetrievalInfrastructureError(str(exc)) from exc


def rerank_for_profile(docs, user_profile):
    county = (user_profile.county or "").strip().lower()
    if not county:
        return docs

    boosted = []
    for doc in docs:
        score = 0
        doc_county = str(doc.metadata.get("county", "")).lower()

        if doc_county == county:
            score += 3
        elif doc_county == "statewide":
            score += 1

        boosted.append((score, doc))

    boosted.sort(key=lambda x: x[0], reverse=True)
    return [doc for _, doc in boosted]
