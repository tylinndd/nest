from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    age: Optional[int] = None
    county: Optional[str] = None
    status: Optional[str] = None
    months_in_care: Optional[int] = None
    college_intent: Optional[str] = None
    top_concerns: List[str] = Field(default_factory=list)
    enrolled_at_ksu: Optional[bool] = None
    aged_out_at_18: Optional[bool] = None
    in_foster_care_at_18: Optional[bool] = None
    documents: Dict[str, bool] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    query: str
    user_profile: UserProfile


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    fallback: bool
    route_to_emergency: bool = False