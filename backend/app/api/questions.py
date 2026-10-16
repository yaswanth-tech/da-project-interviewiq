import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Question, QuestionKeyword, User
from app.schemas.schemas import (
    QuestionCreate, QuestionResponse, KeywordExtractRequest, KeywordExtractResponse
)
from app.api.deps import require_trainer, get_current_user
from app.services.spacy_nlp import extract_keywords_from_model_answer

router = APIRouter(prefix="/questions", tags=["Question Bank"])

@router.get("", response_model=List[QuestionResponse])
def get_questions(
    role: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Question)
    if role:
        query = query.filter(Question.role == role)
    if category:
        query = query.filter(Question.category == category)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if question_type:
        query = query.filter(Question.question_type == question_type)
    if search:
        query = query.filter(Question.text.icontains(search))

    questions = query.offset(skip).limit(limit).all()
    return questions

@router.post("", response_model=QuestionResponse)
def create_question(
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    q = Question(
        text=q_in.text,
        question_type=q_in.question_type,
        role=q_in.role,
        category=q_in.category,
        difficulty=q_in.difficulty,
        time_limit_seconds=q_in.time_limit_seconds,
        model_answer=q_in.model_answer
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    for kw in q_in.keywords:
        key_obj = QuestionKeyword(
            question_id=q.id,
            keyword=kw.keyword.lower(),
            weight=kw.weight,
            synonyms_json=kw.synonyms
        )
        db.add(key_obj)
    
    db.commit()
    db.refresh(q)
    return q

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    q.text = q_in.text
    q.question_type = q_in.question_type
    q.role = q_in.role
    q.category = q_in.category
    q.difficulty = q_in.difficulty
    q.time_limit_seconds = q_in.time_limit_seconds
    q.model_answer = q_in.model_answer

    # Clear old keywords and replace
    db.query(QuestionKeyword).filter(QuestionKeyword.question_id == q.id).delete()
    for kw in q_in.keywords:
        key_obj = QuestionKeyword(
            question_id=q.id,
            keyword=kw.keyword.lower(),
            weight=kw.weight,
            synonyms_json=kw.synonyms
        )
        db.add(key_obj)

    db.commit()
    db.refresh(q)
    return q

@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Question deleted successfully"}

@router.post("/extract-keywords", response_model=KeywordExtractResponse)
def extract_keywords_endpoint(
    req: KeywordExtractRequest,
    current_user: User = Depends(require_trainer)
):
    kws = extract_keywords_from_model_answer(req.model_answer)
    return {"keywords": kws}

@router.get("/export/csv")
def export_questions_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    questions = db.query(Question).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Text", "Question Type", "Role", "Category", "Difficulty", "Time Limit (s)", "Model Answer"])
    for q in questions:
        writer.writerow([q.id, q.text, q.question_type, q.role, q.category, q.difficulty, q.time_limit_seconds, q.model_answer])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=questions_export.csv"}
    )
