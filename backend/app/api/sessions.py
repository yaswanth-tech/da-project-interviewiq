from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import (
    InterviewSession, SessionQuestion, Question, Answer, FeedbackScore, IntegrityEvent, User
)
from app.schemas.schemas import (
    SessionCreate, SessionResponse, SessionQuestionResponse, AnswerSubmit, FeedbackResponse, IntegrityEventCreate
)
from app.api.deps import require_student, get_current_user
from app.services.adaptive import select_next_question
from app.services.scoring import evaluate_answer

router = APIRouter(prefix="/sessions", tags=["Interview Sessions"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("", response_model=SessionResponse)
def start_session(
    s_in: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    # Check if there is an active interrupted session
    active_session = db.query(InterviewSession).filter(
        InterviewSession.student_id == current_user.id,
        InterviewSession.status == "in_progress"
    ).first()

    if active_session:
        return active_session

    session = InterviewSession(
        student_id=current_user.id,
        session_type=s_in.session_type,
        target_role=s_in.target_role,
        mode=s_in.mode,
        status="in_progress",
        started_at=utc_now()
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Populate first question adaptively or fixed
    target_category = s_in.weak_categories[0] if s_in.weak_categories else None
    q1 = select_next_question(db, session, already_asked_ids=[], target_category=target_category)
    
    if not q1:
        # Fallback to any question in DB if role has no specific match
        q1 = db.query(Question).first()
        if not q1:
            raise HTTPException(status_code=400, detail="No questions available in question bank.")

    sq = SessionQuestion(
        session_id=session.id,
        question_id=q1.id,
        question_order=1,
        started_at=utc_now(),
        time_limit=q1.time_limit_seconds
    )
    db.add(sq)
    db.commit()
    db.refresh(session)
    return session

@router.get("/active", response_model=Optional[SessionResponse])
def get_active_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.student_id == current_user.id,
        InterviewSession.status == "in_progress"
    ).first()
    return session

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/{session_id}/next-question", response_model=SessionQuestionResponse)
def get_next_session_question(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.student_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check already asked questions in this session
    sqs = db.query(SessionQuestion).filter(SessionQuestion.session_id == session.id).order_by(SessionQuestion.question_order.asc()).all()
    
    if not sqs:
        raise HTTPException(status_code=400, detail="Session has no questions initialized.")

    # Find current unanswered question or pick next one
    for sq in sqs:
        if not sq.answer:
            return {
                "id": sq.id,
                "question_id": sq.question.id,
                "question_order": sq.question_order,
                "text": sq.question.text,
                "question_type": sq.question.question_type,
                "role": sq.question.role,
                "category": sq.question.category,
                "difficulty": sq.question.difficulty,
                "time_limit_seconds": sq.time_limit,
                "started_at": sq.started_at,
                "has_submitted": False
            }

    # Limit session length to 5 questions
    if len(sqs) >= 5:
        raise HTTPException(status_code=400, detail="Maximum session question limit reached.")

    # Pick adaptive next question
    already_asked = [s.question_id for s in sqs]
    next_q = select_next_question(db, session, already_asked_ids=already_asked)
    if not next_q:
        raise HTTPException(status_code=400, detail="No more questions available for this role.")

    new_sq = SessionQuestion(
        session_id=session.id,
        question_id=next_q.id,
        question_order=len(sqs) + 1,
        started_at=utc_now(),
        time_limit=next_q.time_limit_seconds
    )
    db.add(new_sq)
    db.commit()
    db.refresh(new_sq)

    return {
        "id": new_sq.id,
        "question_id": new_sq.question.id,
        "question_order": new_sq.question_order,
        "text": new_sq.question.text,
        "question_type": new_sq.question.question_type,
        "role": new_sq.question.role,
        "category": new_sq.question.category,
        "difficulty": new_sq.question.difficulty,
        "time_limit_seconds": new_sq.time_limit,
        "started_at": new_sq.started_at,
        "has_submitted": False
    }

@router.post("/submit-answer", response_model=FeedbackResponse)
def submit_answer(
    ans_in: AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    sq = db.query(SessionQuestion).filter(SessionQuestion.id == ans_in.session_question_id).first()
    if not sq:
        raise HTTPException(status_code=404, detail="Session question not found")

    if sq.session.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if sq.answer:
        raise HTTPException(status_code=400, detail="Answer already submitted for this question")

    # SERVER-SIDE TIMER ENFORCEMENT
    now_time = utc_now()
    started_time = sq.started_at.replace(tzinfo=timezone.utc) if sq.started_at.tzinfo is None else sq.started_at
    elapsed_seconds = (now_time - started_time).total_seconds()
    
    # 10s grace buffer allowed for network latency
    submitted_late = False
    if elapsed_seconds > (sq.time_limit + 10):
        submitted_late = True

    time_taken = ans_in.time_taken_seconds if ans_in.time_taken_seconds > 0 else int(elapsed_seconds)

    answer = Answer(
        session_question_id=sq.id,
        answer_text=ans_in.answer_text,
        is_voice=ans_in.is_voice,
        time_taken_seconds=time_taken,
        submitted_late=submitted_late,
        submitted_at=now_time
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)

    # Evaluate answer using NLP Engine
    q = sq.question
    keywords_list = [
        {"keyword": k.keyword, "weight": k.weight, "synonyms": k.synonyms_json or []}
        for k in q.keywords
    ]

    eval_result = evaluate_answer(
        answer_text=ans_in.answer_text,
        model_answer=q.model_answer,
        keywords_def=keywords_list,
        question_type=q.question_type,
        time_taken_seconds=time_taken
    )

    feedback = FeedbackScore(
        answer_id=answer.id,
        total_score=eval_result["total_score"],
        keyword_score=eval_result["keyword_score"],
        semantic_score=eval_result["semantic_score"],
        completeness_score=eval_result["completeness_score"],
        delivery_score=eval_result["delivery_score"],
        star_score=eval_result["star_score"],
        matched_keywords_json=eval_result["matched_keywords"],
        missed_keywords_json=eval_result["missed_keywords"],
        feedback_json={
            "strengths": eval_result["strengths"],
            "suggestions": eval_result["suggestions"],
            "model_comparison": eval_result["model_comparison"],
            "delivery_metrics": eval_result["delivery_metrics"]
        }
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "id": feedback.id,
        "answer_id": answer.id,
        "total_score": feedback.total_score,
        "keyword_score": feedback.keyword_score,
        "semantic_score": feedback.semantic_score,
        "completeness_score": feedback.completeness_score,
        "delivery_score": feedback.delivery_score,
        "star_score": feedback.star_score,
        "matched_keywords": feedback.matched_keywords_json or [],
        "missed_keywords": feedback.missed_keywords_json or [],
        "strengths": feedback.feedback_json.get("strengths", []),
        "suggestions": feedback.feedback_json.get("suggestions", []),
        "model_comparison": feedback.feedback_json.get("model_comparison", ""),
        "delivery_metrics": feedback.feedback_json.get("delivery_metrics")
    }

@router.post("/{session_id}/complete", response_model=SessionResponse)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.student_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Compute overall session average score
    scores = (
        db.query(FeedbackScore.total_score)
        .join(Answer, FeedbackScore.answer_id == Answer.id)
        .join(SessionQuestion, Answer.session_question_id == SessionQuestion.id)
        .filter(SessionQuestion.session_id == session.id)
        .all()
    )

    if scores:
        session.total_score = round(sum(s[0] for s in scores) / len(scores), 1)
    else:
        session.total_score = 0.0

    session.status = "completed"
    session.ended_at = utc_now()
    db.commit()
    db.refresh(session)
    return session

@router.post("/integrity", status_code=201)
def log_integrity_event(
    evt_in: IntegrityEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == evt_in.session_id,
        InterviewSession.student_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    event = IntegrityEvent(
        session_id=session.id,
        event_type=evt_in.event_type,
        timestamp=utc_now(),
        details=evt_in.details
    )
    db.add(event)

    # Flag session if integrity events exceed threshold (>2 events)
    event_count = db.query(IntegrityEvent).filter(IntegrityEvent.session_id == session.id).count()
    if event_count >= 2:
        session.is_flagged = True

    db.commit()
    return {"message": "Integrity event logged", "flagged": session.is_flagged}
