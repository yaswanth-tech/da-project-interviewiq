import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "InterviewIQ"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "interviewiq_super_secret_hackathon_jwt_key_2026_data_hunters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for ease of demo
    
    # SQLite default, can override with DATABASE_URL env var
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interviewiq.db")
    
    # NLP Configuration
    USE_SENTENCE_TRANSFORMERS: bool = True
    SPACY_MODEL: str = "en_core_web_sm"

    class Config:
        case_sensitive = True

settings = Settings()
