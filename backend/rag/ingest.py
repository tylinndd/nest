import json
from pathlib import Path

from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "georgia_resources.json"
PERSIST_DIR = str(BASE_DIR / "vectorstore")
COLLECTION_NAME = "nest_resources"


def resource_to_text(resource: dict) -> str:
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
    resources = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    docs = []

    for r in resources:
        doc = Document(
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
        docs.append(doc)

    return docs


def main():
    docs = load_documents()

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=PERSIST_DIR,
    )

    print(f"Ingested {len(docs)} documents into {PERSIST_DIR}")
    return vectorstore


if __name__ == "__main__":
    main()