from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # 'student' or 'trainer'
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("InterviewSession", back_populates="student", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    college = Column(String, nullable=True)
    target_role = Column(String, nullable=True)  # e.g., 'Python Developer', 'Data Analyst'
    experience_level = Column(String, nullable=True, default="Fresher")  # Fresher, 1-2 years, etc.
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # 'technical' or 'hr'
    role = Column(String, nullable=False, index=True)  # e.g. 'Python Developer'
    category = Column(String, nullable=False, index=True)  # e.g. 'OOP', 'SQL', 'Behavioral'
    difficulty = Column(String, nullable=False, index=True)  # 'easy', 'medium', 'hard'
    time_limit_seconds = Column(Integer, nullable=False, default=120)
    model_answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    keywords = relationship("QuestionKeyword", back_populates="question", cascade="all, delete-orphan")
    session_questions = relationship("SessionQuestion", back_populates="question")

class QuestionKeyword(Base):
    __tablename__ = "question_keywords"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    keyword = Column(String, nullable=False)
    weight = Column(Float, nullable=False, default=1.0)
    synonyms_json = Column(JSON, nullable=True)  # List of synonym strings

    question = relationship("Question", back_populates="keywords")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_type = Column(String, nullable=False, default="Full Mock")  # 'Full Mock', 'Weak Area Retake', etc.
    target_role = Column(String, nullable=False)
    mode = Column(String, nullable=False, default="adaptive")  # 'adaptive' or 'fixed'
    status = Column(String, nullable=False, default="in_progress")  # 'in_progress', 'completed', 'abandoned'
    total_score = Column(Float, nullable=True)
    is_flagged = Column(Boolean, default=False)
    started_at = Column(DateTime, default=utc_now)
    ended_at = Column(DateTime, nullable=True)

    student = relationship("User", back_populates="sessions")
    session_questions = relationship("SessionQuestion", back_populates="session", cascade="all, delete-orphan", order_by="SessionQuestion.question_order")
    integrity_events = relationship("IntegrityEvent", back_populates="session", cascade="all, delete-orphan")

class SessionQuestion(Base):
    __tablename__ = "session_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    question_order = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=utc_now)
    time_limit = Column(Integer, nullable=False)

    session = relationship("InterviewSession", back_populates="session_questions")
    question = relationship("Question", back_populates="session_questions")
    answer = relationship("Answer", back_populates="session_question", uselist=False, cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    session_question_id = Column(Integer, ForeignKey("session_questions.id"), unique=True, nullable=False)
    answer_text = Column(Text, nullable=False)
    is_voice = Column(Boolean, default=False)
    time_taken_seconds = Column(Integer, nullable=False, default=0)
    submitted_late = Column(Boolean, default=False)
    submitted_at = Column(DateTime, default=utc_now)

    session_question = relationship("SessionQuestion", back_populates="answer")
    feedback = relationship("FeedbackScore", back_populates="answer", uselist=False, cascade="all, delete-orphan")

class FeedbackScore(Base):
    __tablename__ = "feedback_scores"

    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("answers.id"), unique=True, nullable=False)
    total_score = Column(Float, nullable=False)
    keyword_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    completeness_score = Column(Float, nullable=False)
    delivery_score = Column(Float, nullable=False)
    star_score = Column(Float, nullable=True)  # Only for HR questions
    matched_keywords_json = Column(JSON, nullable=True)
    missed_keywords_json = Column(JSON, nullable=True)
    feedback_json = Column(JSON, nullable=True)  # Strengths, suggestions, WPM, filler counts

    answer = relationship("Answer", back_populates="feedback")

class IntegrityEvent(Base):
    __tablename__ = "integrity_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    event_type = Column(String, nullable=False)  # 'tab_switch', 'paste'
    timestamp = Column(DateTime, default=utc_now)
    details = Column(String, nullable=True)

    session = relationship("InterviewSession", back_populates="integrity_events")
