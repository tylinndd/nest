from pathlib import Path
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

BASE_DIR = Path(__file__).resolve().parent.parent
PERSIST_DIR = str(BASE_DIR / "vectorstore")
COLLECTION_NAME = "nest_resources"

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = Chroma(
    collection_name=COLLECTION_NAME,
    persist_directory=PERSIST_DIR,
    embedding_function=embeddings,
)


def retrieve_documents(query: str, k: int = 4):
    return vectorstore.similarity_search(query, k=k)


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