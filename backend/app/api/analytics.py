import csv
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import InterviewSession, User, IntegrityEvent, StudentProfile
from app.schemas.schemas import (
    StudentAnalyticsResponse, TrainerAnalyticsResponse, FlaggedSessionItem
)
from app.api.deps import require_student, require_trainer, get_current_user
from app.services.analytics import get_student_analytics, get_trainer_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/student", response_model=StudentAnalyticsResponse)
def student_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    data = get_student_analytics(db, current_user.id)
    return data

@router.get("/trainer", response_model=TrainerAnalyticsResponse)
def trainer_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    data = get_trainer_analytics(db)
    return data

@router.get("/trainer/flagged", response_model=List[FlaggedSessionItem])
def get_flagged_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    flagged = db.query(InterviewSession).filter(InterviewSession.is_flagged == True).all()
    results = []
    for s in flagged:
        evts = [
            {"event_type": e.event_type, "timestamp": e.timestamp.isoformat(), "details": e.details}
            for e in s.integrity_events
        ]
        results.append({
            "session_id": s.id,
            "student_name": s.student.full_name,
            "student_email": s.student.email,
            "target_role": s.target_role,
            "started_at": s.started_at,
            "integrity_events": evts,
            "total_score": s.total_score
        })
    return results

@router.get("/trainer/export/csv")
def export_trainer_analytics_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    data = get_trainer_analytics(db)
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["=== TRAINER ANALYTICS SUMMARY ==="])
    writer.writerow(["Total Students", data["total_students"]])
    writer.writerow(["Total Sessions", data["total_sessions"]])
    writer.writerow(["Cohort Average Score", data["cohort_avg_score"]])
    writer.writerow([])

    writer.writerow(["=== MISSED CATEGORIES ==="])
    writer.writerow(["Category", "Total Attempts", "Average Score"])
    for mc in data["missed_categories"]:
        writer.writerow([mc["category"], mc["total_attempts"], mc["avg_score"]])
    writer.writerow([])

    writer.writerow(["=== STUDENT LEADERBOARD ==="])
    writer.writerow(["Student ID", "Name", "College", "Sessions Completed", "Average Score"])
    for lb in data["leaderboard"]:
        writer.writerow([lb["student_id"], lb["student_name"], lb["college"], lb["sessions_completed"], lb["avg_score"]])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=trainer_analytics.csv"}
    )
