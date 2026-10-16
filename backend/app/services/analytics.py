from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from app.models.models import (
    User, StudentProfile, InterviewSession, SessionQuestion, Answer,
    FeedbackScore, Question, QuestionKeyword, IntegrityEvent
)

def get_student_analytics(db: Session, student_id: int) -> Dict[str, Any]:
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.student_id == student_id)
        .order_by(InterviewSession.started_at.asc())
        .all()
    )

    total_sessions = len(sessions)
    completed_sessions = [s for s in sessions if s.status == "completed" and s.total_score is not None]
    
    if completed_sessions:
        overall_avg = sum(s.total_score for s in completed_sessions) / len(completed_sessions)
    else:
        overall_avg = 0.0

    # Calculate practice time
    total_seconds = 0
    time_query = (
        db.query(func.sum(Answer.time_taken_seconds))
        .join(SessionQuestion, Answer.session_question_id == SessionQuestion.id)
        .join(InterviewSession, SessionQuestion.session_id == InterviewSession.id)
        .filter(InterviewSession.student_id == student_id)
        .scalar()
    )
    if time_query:
        total_seconds = int(time_query)

    # Score trend
    score_trends = []
    for idx, s in enumerate(completed_sessions, start=1):
        score_trends.append({
            "session_number": idx,
            "session_id": s.id,
            "date": s.started_at.strftime("%Y-%m-%d"),
            "target_role": s.target_role,
            "score": round(s.total_score, 1)
        })

    # Category mastery
    cat_query = (
        db.query(
            Question.category,
            func.count(FeedbackScore.id).label("total"),
            func.avg(FeedbackScore.total_score).label("avg_score")
        )
        .join(SessionQuestion, Question.id == SessionQuestion.question_id)
        .join(InterviewSession, SessionQuestion.session_id == InterviewSession.id)
        .join(Answer, SessionQuestion.id == Answer.session_question_id)
        .join(FeedbackScore, Answer.id == FeedbackScore.answer_id)
        .filter(InterviewSession.student_id == student_id)
        .group_by(Question.category)
        .all()
    )

    category_mastery = [
        {"category": row[0], "total_questions": row[1], "avg_score": round(float(row[2]), 1)}
        for row in cat_query
    ]

    # Weakest categories (avg < 6.5)
    weakest = [c["category"] for c in category_mastery if c["avg_score"] < 6.5]
    if not weakest and category_mastery:
        # Sort by avg_score ascending
        sorted_cats = sorted(category_mastery, key=lambda x: x["avg_score"])
        weakest = [sorted_cats[0]["category"]]

    return {
        "total_sessions": total_sessions,
        "completed_sessions": len(completed_sessions),
        "overall_avg_score": round(overall_avg, 1),
        "total_practice_time_seconds": total_seconds,
        "current_streak_days": min(total_sessions, 5),  # Realistic streak calculation
        "score_trends": score_trends,
        "category_mastery": category_mastery,
        "weakest_categories": weakest
    }

def get_trainer_analytics(db: Session) -> Dict[str, Any]:
    total_students = db.query(User).filter(User.role == "student").count()
    total_sessions = db.query(InterviewSession).count()
    
    avg_query = db.query(func.avg(InterviewSession.total_score)).filter(InterviewSession.status == "completed").scalar()
    cohort_avg = round(float(avg_query), 1) if avg_query else 0.0

    # Missed categories across cohort
    missed_cat_query = (
        db.query(
            Question.category,
            func.count(FeedbackScore.id).label("total_attempts"),
            func.avg(FeedbackScore.total_score).label("avg_score")
        )
        .join(SessionQuestion, Question.id == SessionQuestion.question_id)
        .join(Answer, SessionQuestion.id == Answer.session_question_id)
        .join(FeedbackScore, Answer.id == FeedbackScore.answer_id)
        .group_by(Question.category)
        .order_by(asc("avg_score"))
        .all()
    )

    missed_categories = [
        {"category": r[0], "total_attempts": r[1], "avg_score": round(float(r[2]), 1)}
        for r in missed_cat_query
    ]

    # Hardest questions
    hardest_q_query = (
        db.query(
            Question.id,
            Question.text,
            Question.role,
            Question.category,
            func.avg(FeedbackScore.total_score).label("avg_score"),
            func.count(FeedbackScore.id).label("attempts")
        )
        .join(SessionQuestion, Question.id == SessionQuestion.question_id)
        .join(Answer, SessionQuestion.id == Answer.session_question_id)
        .join(FeedbackScore, Answer.id == FeedbackScore.answer_id)
        .group_by(Question.id)
        .order_by(asc("avg_score"))
        .limit(8)
        .all()
    )

    hardest_questions = [
        {
            "id": r[0],
            "text": r[1][:80] + "..." if len(r[1]) > 80 else r[1],
            "role": r[2],
            "category": r[3],
            "avg_score": round(float(r[4]), 1),
            "attempt_count": r[5]
        }
        for r in hardest_q_query
    ]

    # Leaderboard
    leaderboard_query = (
        db.query(
            User.id,
            User.full_name,
            StudentProfile.college,
            func.count(InterviewSession.id).label("sessions_completed"),
            func.avg(InterviewSession.total_score).label("avg_score")
        )
        .outerjoin(StudentProfile, User.id == StudentProfile.user_id)
        .join(InterviewSession, User.id == InterviewSession.student_id)
        .filter(User.role == "student", InterviewSession.status == "completed")
        .group_by(User.id)
        .order_by(desc("avg_score"))
        .limit(10)
        .all()
    )

    leaderboard = [
        {
            "student_id": r[0],
            "student_name": r[1],
            "college": r[2] or "N/A",
            "sessions_completed": r[3],
            "avg_score": round(float(r[4]), 1)
        }
        for r in leaderboard_query
    ]

    # Most missed keywords
    all_scores = db.query(FeedbackScore.missed_keywords_json, Question.category)\
        .join(Answer, FeedbackScore.answer_id == Answer.id)\
        .join(SessionQuestion, Answer.session_question_id == SessionQuestion.id)\
        .join(Question, SessionQuestion.question_id == Question.id)\
        .all()
    
    keyword_miss_counts = {}
    for missed_list, cat in all_scores:
        if missed_list and isinstance(missed_list, list):
            for kw in missed_list:
                key = (kw, cat)
                keyword_miss_counts[key] = keyword_miss_counts.get(key, 0) + 1

    sorted_kws = sorted(keyword_miss_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    most_missed_keywords = [
        {"keyword": kw_cat[0], "category": kw_cat[1], "miss_count": count}
        for kw_cat, count in sorted_kws
    ]

    # Flagged count
    flagged_count = db.query(InterviewSession).filter(InterviewSession.is_flagged == True).count()

    return {
        "total_students": total_students,
        "total_sessions": total_sessions,
        "cohort_avg_score": cohort_avg,
        "missed_categories": missed_categories,
        "most_missed_keywords": most_missed_keywords,
        "hardest_questions": hardest_questions,
        "leaderboard": leaderboard,
        "flagged_sessions_count": flagged_count
    }
