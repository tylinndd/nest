"""Build (or rebuild) the Chroma vector store from the resource catalog.

Run with: ``python -m rag.ingest`` from the ``backend/`` directory.
"""

from __future__ import annotations

import json
from typing import Any

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from app.config import get_settings


def resource_to_text(resource: dict[str, Any]) -> str:
    return f"""
Name: {resource.get('name', '')}
Category: {resource.get('category', '')}
County: {resource.get('county', '')}
Audience: {", ".join(resource.get("audience", []))}
Summary: {resource.get('summary', '')}
Eligibility: {resource.get('eligibility', '')}
Services: {", ".join(resource.get("services", []))}
Phone: {resource.get('contact_phone', 'Not listed')}
Website: {resource.get('contact_url', 'Not listed')}
Address: {resource.get('address', 'Not listed')}
Source: {resource.get('source_name', resource.get('name', 'Unknown source'))}
Last Verified: {resource.get('last_verified', 'Unknown')}
""".strip()


def load_documents() -> list[Document]:
    settings = get_settings()
    resources = json.loads(settings.resource_db_path.read_text(encoding="utf-8"))
    docs: list[Document] = []

    for r in resources:
        docs.append(
            Document(
                page_content=resource_to_text(r),
                metadata={
                    "id": r.get("id"),
                    "name": r.get("name"),
                    "category": r.get("category"),
                    "county": r.get("county"),
                    "source_name": r.get("source_name", r.get("name")),
                    "contact_url": r.get("contact_url", ""),
                },
            )
        )

    return docs


def main():
    settings = get_settings()
    docs = load_documents()

    embeddings = HuggingFaceEmbeddings(model_name=settings.embedding_model)

    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=settings.collection_name,
        persist_directory=str(settings.chroma_dir),
    )

    print(f"Ingested {len(docs)} documents into {settings.chroma_dir}")
    return vectorstore


if __name__ == "__main__":
    main()
