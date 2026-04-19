from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ChatRequest, ChatResponse, IntakeRequest, IntakeResponse
from app.rag.chain import answer_question
from app.services.intake import build_intake_response

app = FastAPI(title="Nest API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = answer_question(request.query, request.user_profile)
    return ChatResponse(**result)


@app.post("/intake", response_model=IntakeResponse)
async def intake(request: IntakeRequest):
    return build_intake_response(request.user_profile)