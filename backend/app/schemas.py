from typing import Any, Dict, List, Literal, Optional
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


class EligibilityResult(BaseModel):
    program: str
    qualified: bool
    reason: str
    what_it_provides: str
    documents_needed: List[str] = Field(default_factory=list)
    next_step: str
    apply_url: Optional[str] = None


class TaskItem(BaseModel):
    id: str
    title: str
    description: str
    urgency: str
    due_label: str
    action_label: str
    action_type: str
    action_target: str
    completed: bool = False


class ChatRequest(BaseModel):
    query: str
    user_profile: UserProfile


class IntakeRequest(BaseModel):
    user_profile: UserProfile


class Passage(BaseModel):
    source_name: str
    snippet: str
    url: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    fallback: bool
    route_to_emergency: bool = False
    passages: List[Passage] = Field(default_factory=list)


class IntakeResponse(BaseModel):
    normalized_profile: UserProfile
    eligibility: List[EligibilityResult] = Field(default_factory=list)
    tasks: List[TaskItem] = Field(default_factory=list)
    bestfit_url: Optional[str] = None
    days_remaining: Optional[int] = None


BenefitStatus = Literal["qualify", "action", "auto"]


class Benefit(BaseModel):
    id: str
    title: str
    eligibility: str
    summary: str
    source: str
    status: BenefitStatus
    cta: Optional[str] = None
    href: Optional[str] = None
    verified_on: Optional[str] = None