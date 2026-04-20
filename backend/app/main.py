from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import ConfigError, get_settings
from app.schemas import ChatRequest, ChatResponse, IntakeRequest, IntakeResponse
from app.services.intake import build_intake_response
from rag.chain import answer_question

settings = get_settings()

app = FastAPI(title="Nest API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
