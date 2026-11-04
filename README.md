# 🧠 InterviewIQ — AI Mock Interview & Feedback Platform

[![Live on Vercel](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://da-project-interviewiq.vercel.app)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite%20+%20TS-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20+%20Python%203.11+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Plotly](https://img.shields.io/badge/Data%20Viz-Plotly.js-3F4F75?style=for-the-badge&logo=plotly)](https://plotly.com/javascript/)

> **Codegnan Hackathon 2026** • Built by Team **Data Hunters**  
> 🌐 **Live Web Application:** [https://da-project-interviewiq.vercel.app](https://da-project-interviewiq.vercel.app)  
> 📂 **GitHub Repository:** [https://github.com/yaswanth-tech/da-project-interviewiq](https://github.com/yaswanth-tech/da-project-interviewiq)

---

## 📖 What is InterviewIQ?

Campus placement interviews can feel intimidating when students don't have enough opportunities for structured practice. Many candidates understand technical concepts well, but freeze up or struggle to structure their thoughts clearly when answering an interviewer out loud under real time pressure.

**InterviewIQ** is an AI-powered mock interview partner that provides a friendly, realistic, and stress-free environment for students to practice role-specific technical and HR interviews anytime.

Candidates can **speak their answers out loud** using speech recognition or type them, receive an **explainable 0–10 score breakdown**, and review actionable suggestions on what concepts they nailed and what they missed. College placement trainers get aggregated cohort analytics to identify exactly which subjects students struggle with most.

---

## 🌟 Core Features in Plain English

### 1. 🎙️ Realistic, Distraction-Free Interview Room
- **Voice or Typed Answers**: Speak naturally using Web Speech API or type your answers directly.
- **Server-Side Enforced Countdown Timer**: Stored question start timestamps prevent client-side timer manipulation.
- **Anti-Cheat Integrity Detection**: Monitors tab-switching and paste events, gently flagging suspicious sessions for trainer review.

### 2. 🎯 Adaptive Question Selection
- The system automatically tunes question difficulty in real time:
  - Performing well? The system steps up the challenge to test deeper knowledge.
  - Finding a topic tricky? It adjusts to help reinforce core fundamentals.
- **"Retake Weak Areas" Button**: One-click targeted mock interview focusing exclusively on the student's lowest-scoring categories.

### 3. 🔍 Transparent & Explainable AI Scorecards
Every answer receives a transparent 0 to 10 score composed of 5 clear components:
1. **Core Concept Coverage**: SpaCy lemmatized keyword and synonym matching.
2. **Semantic Similarity**: MiniLM sentence embedding comparison against reference benchmark answers.
3. **Answer Depth & Completeness**: Ratio check ensuring answers provide sufficient technical depth.
4. **Speaking Pace & Delivery**: Measures words per minute (WPM), flags excessive filler words (*"um"*, *"like"*, *"basically"*), and evaluates pause fluency.
5. **HR Storytelling (STAR Method)**: For HR behavioral questions, detects Situation, Task, Action, and Result structure.

### 4. 📊 Student Mastery Dashboard
- Interactive Plotly line charts displaying score improvement over time.
- Category mastery heatmaps showing performance across OOP, SQL, Data Structures, Concurrency, and Behavioral topics.
- Practice streak counter and total practice time logs.
- Downloadable PDF feedback reports.

### 5. 🧑‍🏫 Trainer & Placement Cell Portal
- **Cohort Weak-Area Analytics**: Bar charts revealing the most commonly missed question categories across all students.
- **Hardest Questions Ranking**: Identifies questions with the lowest cohort average score.
- **Student Leaderboards**: Displays top-performing candidates across colleges and interview attempts.
- **Question Bank Management**: Full CRUD, search, role filters, CSV import/export, and automated spaCy keyword extraction from model answers.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (React 18 + Vite + TypeScript)"]
        UI["Tailwind CSS + Lucide Icons + Framer Motion"]
        Charts["Plotly.js (Trend Lines & Radar Charts)"]
        STT["Web Speech API (Speech-to-Text)"]
        Router["React Router v6 + Protected Role Guards"]
    end

    subgraph Backend ["Backend Engine (FastAPI + Python 3.11+)"]
        Auth["JWT Auth (Access + Refresh) & Role Guards"]
        Timer["Server-Side Question Timer Enforcement"]
        Adaptive["Adaptive Difficulty Selector"]
        Evaluator["NLP Evaluation Engine (spaCy + SentenceTransformers)"]
    end

    subgraph Database ["Persistence Layer"]
        DB[(SQLite / PostgreSQL via SQLAlchemy 2.0 ORM)]
    end

    UI --> Auth
    UI --> Timer
    UI --> Charts
    Auth --> DB
    Timer --> Evaluator
    Evaluator --> DB
    Adaptive --> DB
```

---

## 🗄️ Database Design (Entity Relationships)

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : profile
    USERS ||--o{ INTERVIEW_SESSIONS : takes
    QUESTIONS ||--o{ QUESTION_KEYWORDS : keywords
    QUESTIONS ||--o{ SESSION_QUESTIONS : appears_in
    INTERVIEW_SESSIONS ||--o{ SESSION_QUESTIONS : contains
    SESSION_QUESTIONS ||--o| ANSWERS : receives
    ANSWERS ||--o| FEEDBACK_SCORES : produces
    INTERVIEW_SESSIONS ||--o{ INTEGRITY_EVENTS : logs

    USERS {
        int id PK
        string email UK
        string password_hash
        string role "student | trainer"
        string full_name
        datetime created_at
    }

    STUDENT_PROFILES {
        int id PK
        int user_id FK
        string college
        string target_role
        string experience_level
    }

    QUESTIONS {
        int id PK
        text text
        string question_type "technical | hr"
        string role
        string category
        string difficulty "easy | medium | hard"
        int time_limit_seconds
        text model_answer
    }

    QUESTION_KEYWORDS {
        int id PK
        int question_id FK
        string keyword
        float weight
        json synonyms_json
    }

    INTERVIEW_SESSIONS {
        int id PK
        int student_id FK
        string session_type
        string target_role
        string mode "adaptive | fixed"
        string status "in_progress | completed"
        float total_score
        boolean is_flagged
        datetime started_at
        datetime ended_at
    }

    SESSION_QUESTIONS {
        int id PK
        int session_id FK
        int question_id FK
        int question_order
        datetime started_at
        int time_limit
    }

    ANSWERS {
        int id PK
        int session_question_id FK
        text answer_text
        boolean is_voice
        int time_taken_seconds
        boolean submitted_late
    }

    FEEDBACK_SCORES {
        int id PK
        int answer_id FK
        float total_score
        float keyword_score
        float semantic_score
        float completeness_score
        float delivery_score
        float star_score
        json matched_keywords_json
        json missed_keywords_json
        json feedback_json
    }

    INTEGRITY_EVENTS {
        int id PK
        int session_id FK
        string event_type "tab_switch | paste"
        datetime timestamp
    }
```

---

## 📐 Scoring Formula & Math

Each answer is scored on an objective scale of $0.0$ to $10.0$:

- **Technical Questions:**
  $$S = 10 \times \left( 0.40 \cdot S_{\text{keyword}} + 0.35 \cdot S_{\text{semantic}} + 0.15 \cdot S_{\text{completeness}} + 0.10 \cdot S_{\text{delivery}} \right)$$

- **HR / Behavioral Questions:**
  $$S = 10 \times \left( 0.25 \cdot S_{\text{keyword}} + 0.25 \cdot S_{\text{semantic}} + 0.20 \cdot S_{\text{STAR}} + 0.15 \cdot S_{\text{completeness}} + 0.15 \cdot S_{\text{delivery}} \right)$$

Where:
- $S_{\text{keyword}}$: Proportion of weighted target concept lemmas matched in candidate response.
- $S_{\text{semantic}}$: Cosine similarity between embeddings from `all-MiniLM-L6-v2` and reference model answer (with automatic TF-IDF fallback).
- $S_{\text{completeness}}$: Answer depth vs expected benchmark ratio.
- $S_{\text{delivery}}$: Pace scoring (optimal: 110–160 WPM) minus filler-word penalties.
- $S_{\text{STAR}}$: Detection of Situation, Task, Action, and Result structure.

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Student** | `student1@interviewiq.ai` | `Student@123` | Pre-loaded historical sessions, trends, streak, and retake options |
| **Trainer / Admin** | `trainer@interviewiq.ai` | `Trainer@123` | Cohort analytics, hardest questions, question bank CRUD, flagged queue |

*(You can also register a brand new Student or Trainer account from the registration page!)*

---

## 💻 Local Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/yaswanth-tech/da-project-interviewiq.git
cd da-project-interviewiq
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt

# Seed 80+ questions, trainer, 25 students, and 100+ completed sessions:
python seed/seed_data.py

# Run FastAPI backend:
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

The backend includes a comprehensive pytest suite covering Auth, Scoring Engine, Adaptive Difficulty, Server-Side Timer, and Analytics:

```bash
cd backend
pytest -v
```
*(All 9/9 test suites pass 100% cleanly).*

---

## 🐳 Docker Deployment

To launch the entire platform using Docker Compose:

```bash
docker-compose up --build
```

---

## 👥 Team Data Hunters (Codegnan Hackathon 2026)
- **Lead Developer**: Yaswanth Rajana ([@yaswanth-tech](https://github.com/yaswanth-tech))
- **Project**: InterviewIQ — AI Mock Interview & Feedback Platform
