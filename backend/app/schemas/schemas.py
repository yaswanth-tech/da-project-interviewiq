from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- Auth & User Schemas ---
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    type: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = Field(default="student", pattern="^(student|trainer)$")
    college: Optional[str] = None
    target_role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    college: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None

class StudentProfileResponse(BaseModel):
    college: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    profile: Optional[StudentProfileResponse] = None

    class Config:
        from_attributes = True

# --- Question & Keyword Schemas ---
class QuestionKeywordSchema(BaseModel):
    keyword: str
    weight: float = 1.0
    synonyms: List[str] = Field(default_factory=list)

class QuestionCreate(BaseModel):
    text: str
    question_type: str = Field(..., pattern="^(technical|hr)$")
    role: str
    category: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    time_limit_seconds: int = 120
    model_answer: str
    keywords: List[QuestionKeywordSchema] = Field(default_factory=list)

class QuestionResponse(BaseModel):
    id: int
    text: str
    question_type: str
    role: str
    category: str
    difficulty: str
    time_limit_seconds: int
    model_answer: str
    keywords: List[QuestionKeywordSchema] = []
    created_at: datetime

    class Config:
        from_attributes = True

class KeywordExtractRequest(BaseModel):
    model_answer: str

class KeywordExtractResponse(BaseModel):
    keywords: List[QuestionKeywordSchema]

# --- Session & Evaluation Schemas ---
class SessionCreate(BaseModel):
    target_role: str
    session_type: str = "Full Mock"  # 'Full Mock', 'Weak Area Retake', etc.
    mode: str = "adaptive"  # 'adaptive' or 'fixed'
    difficulty: Optional[str] = "medium"  # used if mode is fixed or starting preference
    question_count: int = Field(default=5, ge=1, le=15)
    weak_categories: Optional[List[str]] = None

class SessionQuestionResponse(BaseModel):
    id: int  # session_question_id
    question_id: int
    question_order: int
    text: str
    question_type: str
    role: str
    category: str
    difficulty: str
    time_limit_seconds: int
    started_at: datetime
    has_submitted: bool = False

class SessionQuestionInSession(BaseModel):
    id: int
    session_id: int
    question_id: int
    question_order: int
    started_at: datetime
    time_limit: int

    class Config:
        from_attributes = True

class SessionResponse(BaseModel):
    id: int
    student_id: int
    session_type: str
    target_role: str
    mode: str
    status: str
    total_score: Optional[float] = None
    is_flagged: bool
    started_at: datetime
    ended_at: Optional[datetime] = None
    session_questions: List[SessionQuestionInSession] = []

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    session_question_id: int
    answer_text: str
    is_voice: bool = False
    time_taken_seconds: int = 0

class DeliveryMetrics(BaseModel):
    wpm: float = 0.0
    filler_count: int = 0
    filler_words_found: List[str] = []
    pause_estimate: str = "Normal"

class FeedbackResponse(BaseModel):
    id: int
    answer_id: int
    total_score: float
    keyword_score: float
    semantic_score: float
    completeness_score: float
    delivery_score: float
    star_score: Optional[float] = None
    matched_keywords: List[str] = []
    missed_keywords: List[str] = []
    strengths: List[str] = []
    suggestions: List[str] = []
    model_comparison: str = ""
    delivery_metrics: Optional[DeliveryMetrics] = None

class IntegrityEventCreate(BaseModel):
    session_id: int
    event_type: str = Field(..., pattern="^(tab_switch|paste)$")
    details: Optional[str] = None

# --- Analytics Schemas ---
class CategoryMastery(BaseModel):
    category: str
    total_questions: int
    avg_score: float

class StudentAnalyticsResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    overall_avg_score: float
    total_practice_time_seconds: int
    current_streak_days: int
    score_trends: List[Dict[str, Any]]
    category_mastery: List[CategoryMastery]
    weakest_categories: List[str]

class MissedCategory(BaseModel):
    category: str
    total_attempts: int
    avg_score: float

class MissedKeyword(BaseModel):
    keyword: str
    category: str
    miss_count: int

class HardestQuestion(BaseModel):
    id: int
    text: str
    role: str
    category: str
    avg_score: float
    attempt_count: int

class LeaderboardEntry(BaseModel):
    student_id: int
    student_name: str
    college: Optional[str] = None
    sessions_completed: int
    avg_score: float

class TrainerAnalyticsResponse(BaseModel):
    total_students: int
    total_sessions: int
    cohort_avg_score: float
    missed_categories: List[MissedCategory]
    most_missed_keywords: List[MissedKeyword]
    hardest_questions: List[HardestQuestion]
    leaderboard: List[LeaderboardEntry]
    flagged_sessions_count: int

class FlaggedSessionItem(BaseModel):
    session_id: int
    student_name: str
    student_email: str
    target_role: str
    started_at: datetime
    integrity_events: List[Dict[str, Any]]
    total_score: Optional[float]
