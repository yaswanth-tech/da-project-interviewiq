from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.schemas.schemas import QuestionKeywordSchema, FeedbackResponse
from app.services.scoring import evaluate_answer
from app.api.deps import get_current_user

router = APIRouter(prefix="/evaluation", tags=["Evaluation Engine"])

class EvaluateDirectRequest(BaseModel):
    answer_text: str
    model_answer: str
    question_type: str = "technical"
    keywords: List[QuestionKeywordSchema] = []
    time_taken_seconds: int = 0

@router.post("/test", response_model=dict)
def test_evaluation(req: EvaluateDirectRequest):
    kw_defs = [{"keyword": k.keyword, "weight": k.weight, "synonyms": k.synonyms} for k in req.keywords]
    res = evaluate_answer(
        answer_text=req.answer_text,
        model_answer=req.model_answer,
        keywords_def=kw_defs,
        question_type=req.question_type,
        time_taken_seconds=req.time_taken_seconds
    )
    return res
