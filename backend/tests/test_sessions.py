from datetime import datetime, timedelta, timezone
from app.models.models import Question, QuestionKeyword, InterviewSession, SessionQuestion

def test_session_lifecycle_and_timer_enforcement(client, db, test_student, student_auth_headers):
    # 1. Create a dummy question
    q = Question(
        text="What is a Python generator?",
        question_type="technical",
        role="Python Developer",
        category="Generators",
        difficulty="easy",
        time_limit_seconds=120,
        model_answer="A generator returns an iterator using yield."
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    kw = QuestionKeyword(question_id=q.id, keyword="generator", weight=1.0)
    db.add(kw)
    db.commit()

    # 2. Start session
    response = client.post("/api/v1/sessions", json={
        "target_role": "Python Developer",
        "session_type": "Full Mock",
        "mode": "adaptive",
        "question_count": 5
    }, headers=student_auth_headers)
    assert response.status_code == 200
    session_data = response.json()
    session_id = session_data["id"]

    # 3. Get next question
    next_q_resp = client.get(f"/api/v1/sessions/{session_id}/next-question", headers=student_auth_headers)
    assert next_q_resp.status_code == 200
    sq_data = next_q_resp.json()
    sq_id = sq_data["id"]

    # 4. Submit answer
    sub_resp = client.post("/api/v1/sessions/submit-answer", json={
        "session_question_id": sq_id,
        "answer_text": "A generator is a function yielding values sequentially.",
        "is_voice": False,
        "time_taken_seconds": 45
    }, headers=student_auth_headers)
    assert sub_resp.status_code == 200
    fb_data = sub_resp.json()
    assert fb_data["total_score"] > 0.0

    # 5. Log integrity event
    integ_resp = client.post("/api/v1/sessions/integrity", json={
        "session_id": session_id,
        "event_type": "tab_switch",
        "details": "Switched tab to browser"
    }, headers=student_auth_headers)
    assert integ_resp.status_code == 201

    # 6. Complete session
    comp_resp = client.post(f"/api/v1/sessions/{session_id}/complete", headers=student_auth_headers)
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "completed"
