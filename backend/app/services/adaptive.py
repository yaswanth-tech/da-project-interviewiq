import random
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Question, InterviewSession, SessionQuestion, Answer, FeedbackScore

DIFFICULTY_LEVELS = ["easy", "medium", "hard"]

def select_next_question(
    db: Session,
    session: InterviewSession,
    already_asked_ids: List[int],
    target_category: Optional[str] = None
) -> Optional[Question]:
    """
    Adaptive difficulty selector algorithm:
    1. Evaluates running session average score from answered questions.
    2. Determines target difficulty:
       - Running score >= 7.5 -> Step UP difficulty (Easy -> Medium -> Hard)
       - Running score <= 5.0 -> Step DOWN difficulty (Hard -> Medium -> Easy)
       - Running score between 5.0 and 7.5 -> Maintain current difficulty
    3. If student has category-specific historical weaknesses, prioritizes weak category.
    4. Selects an unasked question matching the target criteria.
    """
    # 1. Calculate running session average
    session_answers = (
        db.query(FeedbackScore.total_score)
        .join(Answer, FeedbackScore.answer_id == Answer.id)
        .join(SessionQuestion, Answer.session_question_id == SessionQuestion.id)
        .filter(SessionQuestion.session_id == session.id)
        .all()
    )

    if session_answers:
        scores = [s[0] for s in session_answers]
        running_avg = sum(scores) / len(scores)
    else:
        running_avg = 6.5  # Neutral starting average

    # 2. Determine target difficulty
    if running_avg >= 7.5:
        target_diff = "hard" if running_avg >= 8.5 else "medium"
    elif running_avg <= 5.0:
        target_diff = "easy"
    else:
        target_diff = "medium"

    # Base query for questions in target_role not yet asked
    query = db.query(Question).filter(
        Question.role == session.target_role,
        Question.id.not_in(already_asked_ids) if already_asked_ids else True
    )

    if target_category:
        query = query.filter(Question.category == target_category)

    # Try exact match for target difficulty
    candidate_questions = query.filter(Question.difficulty == target_diff).all()
    
    if candidate_questions:
        return random.choice(candidate_questions)

    # Fallback to any difficulty if exact target difficulty has no remaining unasked questions
    fallback_questions = query.all()
    if fallback_questions:
        return random.choice(fallback_questions)

    # Fallback across all questions for role if category filter was too strict
    all_role_questions = db.query(Question).filter(
        Question.role == session.target_role,
        Question.id.not_in(already_asked_ids) if already_asked_ids else True
    ).all()

    if all_role_questions:
        return random.choice(all_role_questions)

    return None
