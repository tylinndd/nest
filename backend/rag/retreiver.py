"""Vector store retrieval for the Nest RAG pipeline.

The Chroma client and HuggingFace embeddings are constructed lazily so
importing this module never touches disk or downloads model weights.
That keeps cold-start cheap on Render and lets ``/health`` respond even
when the vector store has not been ingested yet.
"""

from __future__ import annotations

from app.config import get_settings


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
    """Run a similarity search; return ``[]`` if the store isn't ready."""
    try:
        return get_vectorstore().similarity_search(query, k=k)
    except Exception:
        return []


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
