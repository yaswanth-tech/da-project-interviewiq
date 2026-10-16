import os
import sys
import pytest

# Ensure backend folder is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.models import User, Question, QuestionKeyword, StudentProfile

TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_interviewiq.db"

engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def _get_test_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_student(db):
    user = User(
        email="teststudent@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Test Student",
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = StudentProfile(user_id=user.id, target_role="Python Developer", college="Test College")
    db.add(profile)
    db.commit()
    return user

@pytest.fixture
def test_trainer(db):
    user = User(
        email="testtrainer@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Test Trainer",
        role="trainer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def student_auth_headers(test_student):
    token = create_access_token(test_student.id, "student")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def trainer_auth_headers(test_trainer):
    token = create_access_token(test_trainer.id, "trainer")
    return {"Authorization": f"Bearer {token}"}
