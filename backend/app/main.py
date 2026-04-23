import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import ConfigError, get_settings
from app.schemas import Benefit, ChatRequest, ChatResponse, IntakeRequest, IntakeResponse
from app.services.benefits import get_benefits_catalog
from app.services.intake import build_intake_response
from rag.chain import answer_question
from rag.retreiver import retrieve_documents

settings = get_settings()
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("nest warmup: loading embeddings + priming vectorstore")
    try:
        await asyncio.to_thread(retrieve_documents, "warmup", 1)
        logger.info("nest warmup: RAG pipeline ready")
    except Exception as exc:
        logger.warning("nest warmup failed (%s); first /chat may be slow", exc)
    yield


app = FastAPI(title="Nest API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/health")
async def health():
    return {
        "ok": True,
        "environment": settings.environment,
        "model": settings.model_name,
        "groq_api_key_configured": settings.has_groq_api_key,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = answer_question(request.query, request.user_profile)
    except ConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ChatResponse(**result)


@app.post("/intake", response_model=IntakeResponse)
async def intake(request: IntakeRequest):
    return build_intake_response(request.user_profile)


@app.get("/benefits", response_model=list[Benefit])
async def benefits():
    return get_benefits_catalog()
