from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict

class CandidateMatchProfile(BaseModel):
    id: uuid.UUID
    name: Optional[str] = "Candidate"
    email: Optional[str] = None
    title: Optional[str] = "Software Engineer"

    model_config = ConfigDict(from_attributes=True)

class MatchResponse(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    final_score: float
    score_components: Dict[str, float]
    flags: List[str]
    explanation: Optional[Dict[str, Any]] = None
    model_versions: Optional[Dict[str, str]] = None
    candidate: Optional[CandidateMatchProfile] = None

    model_config = ConfigDict(from_attributes=True)
