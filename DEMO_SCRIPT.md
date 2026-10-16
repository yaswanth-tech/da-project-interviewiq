# 🎬 InterviewIQ - 5-Minute Hackathon Demo Script

**Team:** Data Hunters (Codegnan Hackathon)  
**Target Flow:** End-to-end Student Mock Interview, Server-Side Timer, AI Feedback Scorecard, and Trainer Cohort Analytics.

---

## ⏱ Time Breakdown (5 Minutes Total)

### 0:00 - 0:45 | Step 1: Introduction & Student Role Setup
- **Presenter Action:** Open `http://localhost:5173`. Point out the clean UI, Team Data Hunters badge, and quick demo credentials box.
- **Script:** *"Judges, students preparing for campus placements lack accessible, structured mock interview practice. Meet InterviewIQ. I'll log in as Student Candidate 1 using our one-click demo filler."*
- **UI Action:** Click **"Fill Demo Student"** on Login page and click **"Sign In"**.
- **Script:** *"Notice the candidate dashboard: we have 100+ seeded historical sessions showing real-time Plotly improvement trends, category heatmaps, practice streak counters, and target role customization."*

---

### 0:45 - 2:00 | Step 2: Configure & Launch Mock Interview
- **Presenter Action:** Click **"Start Mock Interview"**.
- **Script:** *"The student selects their target role—for example, Python Developer—and picks Adaptive Mode. Our adaptive algorithm dynamically tunes question difficulty based on their live performance."*
- **UI Action:** Click **"Enter Interview Room"**.
- **Script:** *"We are now in the distraction-free interview room. Notice the circular animated countdown timer. Crucially, this timer is enforced server-side—storing question start timestamps to prevent client-side tampering."*

---

### 2:00 - 3:15 | Step 3: Typed & Voice Answer Submission + Anti-Cheat Detection
- **Presenter Action:** Answer Question #1 typed, then answer Question #2 using Voice STT.
- **Script:** *"Candidates can type or speak their answers using Web Speech API. Let's record a spoken answer: 'A generator function yields values using the yield keyword with lazy evaluation...'"*
- **UI Action:** Click **"Answer via Voice"**, speak answer, then switch browser tabs for 2 seconds to trigger integrity listener.
- **Script:** *"Notice our anti-cheat integrity listener logged a tab switch event in the header, flagging this session for trainer review!"*
- **UI Action:** Click **"Submit Answer"**.

---

### 3:15 - 4:15 | Step 4: AI Feedback Report & Score Breakdown
- **Presenter Action:** Complete session or click **"End & View Report"**.
- **Script:** *"Our NLP Evaluation Engine calculates a transparent 0-10 score by combining spaCy lemmatized keyword coverage, SentenceTransformers semantic similarity, length completeness, delivery metrics (WPM and filler words), and STAR method detection for HR questions."*
- **UI Action:** Scroll through the generated Scorecard, Radar Chart, matched/missed keyword pills, and click **"Export Report PDF"**.
- **Script:** *"Students can immediately see missed concepts to include, benchmark model answers, and click 'Retake Weak Areas' to launch a targeted retry."*

---

### 4:15 - 5:00 | Step 5: Trainer & Placement Analytics Portal
- **Presenter Action:** Log out and log in as Trainer (`trainer@interviewiq.ai`).
- **Script:** *"Finally, let's switch to the Trainer & Placement Portal. Placement officers see aggregated weak-area analytics across all students, hardest questions, student leaderboards, and the Flagged Sessions Queue."*
- **UI Action:** Show **Missed Categories Bar Chart**, **Flagged Sessions Queue** (showing tab switch events), click **"Export Cohort CSV"**, and navigate to **Question Bank** showing spaCy keyword auto-generation.
- **Script:** *"InterviewIQ bridges the gap between student practice and trainer oversight. Thank you!"*
