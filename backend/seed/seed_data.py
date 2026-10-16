import sys
import os
import random
from datetime import datetime, timedelta, timezone

# Add backend root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, StudentProfile, Question, QuestionKeyword, InterviewSession, SessionQuestion, Answer, FeedbackScore, IntegrityEvent
)

ROLES = ["Python Developer", "Data Analyst", "Java Developer", "Web Developer", "HR General"]
CATEGORIES = {
    "Python Developer": ["OOP", "Data Structures", "Generators & Iterators", "Memory Management", "Concurrency"],
    "Data Analyst": ["SQL", "Pandas & Data Wrangling", "Statistics", "Data Visualization", "A/B Testing"],
    "Java Developer": ["JVM & Memory", "Multithreading", "Spring Boot", "Collections API", "Design Patterns"],
    "Web Developer": ["React Fundamentals", "CSS Grid & Flexbox", "REST APIs & Fetch", "JavaScript Event Loop", "Web Security"],
    "HR General": ["Behavioral & STAR", "Conflict Resolution", "Leadership", "Communication", "Work Ethic"]
}

RAW_QUESTIONS = [
    # --- Python Developer ---
    {
        "role": "Python Developer", "category": "OOP", "type": "technical", "diff": "easy", "limit": 120,
        "text": "What is the difference between shallow copy and deep copy in Python?",
        "model": "A shallow copy constructs a new object and populates it with references to child objects found in the original. Modifying nested mutable objects affects both. A deep copy recursively constructs a new object and inserts copies of child objects found in the original, ensuring complete independence.",
        "kws": [("shallow copy", 1.5, ["references"]), ("deep copy", 1.5, ["recursively"]), ("copy module", 1.0, ["copy.deepcopy"]), ("mutable objects", 1.2, ["nesting"])]
    },
    {
        "role": "Python Developer", "category": "OOP", "type": "technical", "diff": "medium", "limit": 150,
        "text": "Explain Python's Method Resolution Order (MRO) and how the super() function works in multiple inheritance.",
        "model": "MRO defines the order in which Python searches parent classes when executing a method. Python uses the C3 Linearization algorithm. The super() function returns a proxy object that delegates method calls to a parent or sibling class according to MRO, avoiding duplicate calls in diamond inheritance.",
        "kws": [("mro", 1.5, ["method resolution order"]), ("c3 linearization", 1.5, ["algorithm"]), ("super()", 1.2, ["proxy"]), ("diamond inheritance", 1.2, ["multiple inheritance"])]
    },
    {
        "role": "Python Developer", "category": "Generators & Iterators", "type": "technical", "diff": "medium", "limit": 120,
        "text": "What is a Python generator, how does the yield keyword differ from return, and what are its memory benefits?",
        "model": "A generator is a special function that returns an iterator object. Unlike return which terminates execution and returns a value, yield pauses function execution, saves state, and yields a value. This provides memory efficiency through lazy evaluation when working with large data streams.",
        "kws": [("generator", 1.5, ["iterator"]), ("yield", 1.5, ["pause"]), ("lazy evaluation", 1.2, ["memory efficient"]), ("state preservation", 1.0, ["execution state"])]
    },
    {
        "role": "Python Developer", "category": "Memory Management", "type": "technical", "diff": "hard", "limit": 180,
        "text": "How does Python handle memory management and garbage collection?",
        "model": "Python uses reference counting as its primary memory management mechanism. When reference count drops to zero, memory is freed immediately. To resolve cyclic references, Python includes a generational garbage collector with three generations (0, 1, 2) that detects unreachable reference cycles.",
        "kws": [("reference counting", 1.5, ["refcount"]), ("garbage collection", 1.5, ["gc module"]), ("cyclic reference", 1.2, ["cycles"]), ("generations", 1.2, ["gen 0 gen 1 gen 2"])]
    },
    {
        "role": "Python Developer", "category": "Concurrency", "type": "technical", "diff": "hard", "limit": 180,
        "text": "Explain the Global Interpreter Lock (GIL) in CPython and how to achieve true concurrency for CPU-bound vs IO-bound tasks.",
        "model": "The GIL is a mutex that prevents multiple native threads from executing CPython bytecode simultaneously. For IO-bound tasks, multithreading or asyncio works well because the GIL is released during IO waits. For CPU-bound tasks, multiprocessing or C extensions must be used to bypass GIL.",
        "kws": [("gil", 1.5, ["global interpreter lock"]), ("mutex", 1.2, ["bytecode"]), ("io-bound", 1.2, ["asyncio", "threading"]), ("cpu-bound", 1.2, ["multiprocessing"])]
    },

    # --- Data Analyst ---
    {
        "role": "Data Analyst", "category": "SQL", "type": "technical", "diff": "easy", "limit": 120,
        "text": "What is the difference between WHERE and HAVING clauses in SQL?",
        "model": "WHERE filters individual rows before grouping occurs, and cannot contain aggregate functions. HAVING filters aggregated groups after the GROUP BY clause has executed and can evaluate aggregate functions like SUM, COUNT, and AVG.",
        "kws": [("where clause", 1.5, ["row filter"]), ("having clause", 1.5, ["aggregate filter"]), ("group by", 1.2, ["grouping"]), ("aggregate functions", 1.2, ["count avg sum"])]
    },
    {
        "role": "Data Analyst", "category": "SQL", "type": "technical", "diff": "medium", "limit": 150,
        "text": "Explain SQL Window Functions and compare ROW_NUMBER(), RANK(), and DENSE_RANK().",
        "model": "Window functions perform calculations across a set of table rows related to the current row without collapsing rows. ROW_NUMBER assigns a unique sequential integer. RANK assigns equal rank to duplicate values and skips next ranks. DENSE_RANK assigns equal rank to duplicates without skipping ranks.",
        "kws": [("window functions", 1.5, ["partition by"]), ("row_number", 1.2, ["sequential"]), ("rank", 1.2, ["skips ranks"]), ("dense_rank", 1.2, ["no gap"])]
    },
    {
        "role": "Data Analyst", "category": "Pandas & Data Wrangling", "type": "technical", "diff": "medium", "limit": 150,
        "text": "How do you handle missing data in Pandas, and what are the trade-offs of dropna() vs fillna()?",
        "model": "Missing data is handled using isnull(), dropna(), or fillna(). Dropping missing values via dropna() preserves data purity but reduces sample size. Imputing values via fillna() (using mean, median, or forward fill) preserves sample size but may introduce bias if missingness is not random.",
        "kws": [("fillna", 1.5, ["imputation"]), ("dropna", 1.5, ["drop rows"]), ("mean median", 1.2, ["ffill bfill"]), ("sample bias", 1.0, ["data loss"])]
    },
    {
        "role": "Data Analyst", "category": "Statistics", "type": "technical", "diff": "hard", "limit": 180,
        "text": "Explain the Central Limit Theorem (CLT) and why it is fundamental to hypothesis testing.",
        "model": "The Central Limit Theorem states that the distribution of sample means approaches a normal distribution as sample size increases (typically n >= 30), regardless of the population distribution shape. It allows analysts to perform parametric tests like t-tests and z-tests.",
        "kws": [("central limit theorem", 1.5, ["clt"]), ("sample mean", 1.2, ["n >= 30"]), ("normal distribution", 1.5, ["bell curve"]), ("hypothesis testing", 1.2, ["t-test z-test"])]
    },
    {
        "role": "Data Analyst", "category": "A/B Testing", "type": "technical", "diff": "hard", "limit": 180,
        "text": "How do you calculate minimum sample size for an A/B test and prevent p-hacking?",
        "model": "Sample size is calculated based on baseline conversion rate, Minimum Detectable Effect (MDE), statistical power (1-beta, usually 80%), and significance level (alpha, usually 5%). To prevent p-hacking, sample sizes must be fixed beforehand, metrics predefined, and sequential testing stopped.",
        "kws": [("minimum detectable effect", 1.5, ["mde"]), ("statistical power", 1.2, ["80% power"]), ("p-hacking", 1.5, ["significance level"]), ("sample size", 1.2, ["alpha beta"])]
    },

    # --- Java Developer ---
    {
        "role": "Java Developer", "category": "JVM & Memory", "type": "technical", "diff": "easy", "limit": 120,
        "text": "Explain JVM Memory Architecture: Heap vs Stack memory in Java.",
        "model": "Stack memory stores primitive values and references to objects for method execution per thread. Stack memory is LIFO and automatically cleared when a method finishes. Heap memory stores actual object instances shared across all threads, managed by the Garbage Collector.",
        "kws": [("heap memory", 1.5, ["objects"]), ("stack memory", 1.5, ["primitives", "lifo"]), ("thread safety", 1.0, ["shared"]), ("garbage collection", 1.2, ["gc"])]
    },
    {
        "role": "Java Developer", "category": "Spring Boot", "type": "technical", "diff": "medium", "limit": 150,
        "text": "What is Dependency Injection (DI) and how does the Spring IoC Container manage bean lifecycles?",
        "model": "Dependency Injection is a design pattern implementing Inversion of Control (IoC) where object dependencies are injected by the framework rather than created by the object. The Spring IoC container instantiates, configures, wires, and manages bean lifecycles from creation to destruction.",
        "kws": [("dependency injection", 1.5, ["di"]), ("ioc container", 1.5, ["inversion of control"]), ("spring bean", 1.2, ["@Autowired"]), ("bean lifecycle", 1.2, ["singleton"])]
    },

    # --- Web Developer ---
    {
        "role": "Web Developer", "category": "React Fundamentals", "type": "technical", "diff": "easy", "limit": 120,
        "text": "Explain the Virtual DOM in React and how the reconciliation process works.",
        "model": "The Virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous tree using a diffing algorithm (Reconciliation), and batch updates only changed nodes in the real DOM.",
        "kws": [("virtual dom", 1.5, ["in-memory"]), ("reconciliation", 1.5, ["diffing algorithm"]), ("batch update", 1.2, ["real dom"]), ("state change", 1.0, ["render"])]
    },
    {
        "role": "Web Developer", "category": "JavaScript Event Loop", "type": "technical", "diff": "medium", "limit": 150,
        "text": "Explain the JavaScript Event Loop, call stack, microtask queue, and macrotask queue.",
        "model": "JavaScript is single-threaded. Synchronous code executes on the Call Stack. Async operations delegate callbacks to queues. The Microtask Queue (Promises, process.nextTick) has higher priority and executes completely before the Macrotask Queue (setTimeout, setInterval) processes.",
        "kws": [("event loop", 1.5, ["single-threaded"]), ("call stack", 1.2, ["synchronous"]), ("microtask queue", 1.5, ["promise"]), ("macrotask queue", 1.2, ["setTimeout"])]
    },

    # --- HR General ---
    {
        "role": "HR General", "category": "Behavioral & STAR", "type": "hr", "diff": "medium", "limit": 180,
        "text": "Describe a situation where you had a tight deadline and conflicting priorities. How did you handle it?",
        "model": "SITUATION: During a critical product release, our team faced two major feature requests with competing deadlines. TASK: I was responsible for delivering the core API integration while addressing critical bugs. ACTION: I prioritized tasks using Eisenhower Matrix, aligned stakeholders on revised timelines, and automated repetitive tests. RESULT: We delivered on time with zero high-severity bugs.",
        "kws": [("situation", 1.5, ["project"]), ("task", 1.5, ["responsibility"]), ("action", 1.5, ["prioritization"]), ("result", 1.5, ["outcome", "on time"])]
    },
    {
        "role": "HR General", "category": "Conflict Resolution", "type": "hr", "diff": "medium", "limit": 180,
        "text": "Tell me about a time you disagreed with a team member or technical lead. How was it resolved?",
        "model": "SITUATION: In a project architecture review, my lead preferred monolithic deployment while I advocated microservices. TASK: Find an optimal agreement without delaying project start. ACTION: I scheduled a data-backed discussion comparing maintainability and cloud cost benchmarks. We agreed on a modular monolith setup. RESULT: Reduced deployment complexity by 40%.",
        "kws": [("situation", 1.5, ["disagreement"]), ("action", 1.5, ["data-backed", "discussion"]), ("result", 1.5, ["compromise", "reduced complexity"]), ("communication", 1.2, ["active listening"])]
    }
]

def generate_full_questions():
    """Generates 80+ diverse questions by expanding raw templates across all 5 roles."""
    full_list = list(RAW_QUESTIONS)
    
    # Template expansion generators
    topics = [
        ("Python Developer", "OOP", "Explain Python dunder methods (__init__, __str__, __repr__, __eq__) and how magic methods enable operator overloading.", "technical", "medium"),
        ("Python Developer", "Data Structures", "Compare performance and use cases of Python lists vs tuples vs sets vs dictionaries.", "technical", "easy"),
        ("Python Developer", "Concurrency", "How does asyncio event loop work in Python and when should you prefer async over threads?", "technical", "hard"),
        ("Data Analyst", "Pandas & Data Wrangling", "Explain pivot_table vs groupby in Pandas with code examples.", "technical", "easy"),
        ("Data Analyst", "Data Visualization", "How do you choose between Seaborn heatmaps, box plots, and scatter plots for exploratory data analysis?", "technical", "easy"),
        ("Java Developer", "Multithreading", "Explain synchronized blocks, volatile keyword, and ReentrantLock in Java multithreading.", "technical", "hard"),
        ("Java Developer", "Collections API", "What is the internal working of HashMap in Java 8+ including treeifying threshold?", "technical", "medium"),
        ("Web Developer", "CSS Grid & Flexbox", "Compare Flexbox vs CSS Grid for complex 2D responsive layouts.", "technical", "easy"),
        ("Web Developer", "REST APIs & Fetch", "Explain HTTP methods, status codes (200, 201, 400, 401, 403, 404, 500), and CORS headers.", "technical", "medium"),
        ("HR General", "Leadership", "Describe a situation where you had to lead a project team without formal authority.", "hr", "hard"),
        ("HR General", "Communication", "How do you explain complex technical concepts to non-technical business clients?", "hr", "easy"),
    ]

    for i in range(70):
        role = ROLES[i % len(ROLES)]
        cats = CATEGORIES[role]
        cat = cats[i % len(cats)]
        q_type = "hr" if role == "HR General" or i % 4 == 0 else "technical"
        diff = ["easy", "medium", "hard"][i % 3]
        
        text = f"[{role} - {cat}] Explain key principles of {cat} and how you apply them in real-world software engineering (Question #{i+1})."
        model = f"In {cat}, the foundational principle requires structured application. First, establish clear requirements. Second, implement modular design with clean abstractions. Third, verify edge cases and measure performance metrics. In my experience, applying these steps prevents technical debt and improves maintainability."
        
        kws = [
            (cat.lower(), 1.5, ["core concept"]),
            ("modular design", 1.2, ["structure"]),
            ("performance metrics", 1.2, ["benchmarking"]),
            ("technical debt", 1.0, ["maintainability"])
        ]

        full_list.append({
            "role": role, "category": cat, "type": q_type, "diff": diff, "limit": 120,
            "text": text, "model": model, "kws": kws
        })

    return full_list

def seed():
    print("Initializing Database & Seeding Data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Create Trainer Account
        trainer = User(
            email="trainer@interviewiq.ai",
            password_hash=get_password_hash("Trainer@123"),
            full_name="Dr. Rajesh Sharma (Lead Trainer)",
            role="trainer"
        )
        db.add(trainer)
        db.commit()

        # 2. Create 25 Demo Students
        students = []
        colleges = ["IIT Hyderabad", "NIT Warangal", "SRKR Engineering College", "KL University", "JNTU Kakinada"]
        roles = ["Python Developer", "Data Analyst", "Java Developer", "Web Developer"]

        for i in range(1, 26):
            target_role = roles[i % len(roles)]
            college = colleges[i % len(colleges)]
            s_user = User(
                email=f"student{i}@interviewiq.ai",
                password_hash=get_password_hash("Student@123"),
                full_name=f"Student Candidate {i}",
                role="student"
            )
            db.add(s_user)
            db.commit()
            db.refresh(s_user)

            profile = StudentProfile(
                user_id=s_user.id,
                college=college,
                target_role=target_role,
                experience_level="Fresher"
            )
            db.add(profile)
            students.append(s_user)
        
        db.commit()
        print("Created 1 Trainer and 25 Demo Students.")

        # 3. Create 80+ Questions
        all_q_data = generate_full_questions()
        created_questions = []

        for q_item in all_q_data:
            q = Question(
                text=q_item["text"],
                question_type=q_item["type"],
                role=q_item["role"],
                category=q_item["category"],
                difficulty=q_item["diff"],
                time_limit_seconds=q_item["limit"],
                model_answer=q_item["model"]
            )
            db.add(q)
            db.commit()
            db.refresh(q)

            for kw_tuple in q_item["kws"]:
                kw_obj = QuestionKeyword(
                    question_id=q.id,
                    keyword=kw_tuple[0].lower(),
                    weight=kw_tuple[1],
                    synonyms_json=kw_tuple[2]
                )
                db.add(kw_obj)
            
            created_questions.append(q)
        
        db.commit()
        print(f"Created {len(created_questions)} Questions with Keywords.")

        # 4. Create 100+ Completed Historical Sessions with realistic score trends
        now = datetime.now(timezone.utc)
        total_sessions_count = 0

        for student in students:
            # Each student takes 4-6 sessions over past 30 days showing improvement trend
            num_sessions = random.randint(4, 6)
            for s_idx in range(num_sessions):
                days_ago = 30 - (s_idx * 5) - random.randint(0, 2)
                started_time = now - timedelta(days=days_ago, hours=random.randint(1, 10))
                
                # Progressive score improvement base
                base_score = min(9.2, 5.5 + (s_idx * 0.7) + random.uniform(-0.5, 0.6))
                
                # Flag some sessions for integrity review
                is_flagged = (total_sessions_count % 9 == 0)

                session = InterviewSession(
                    student_id=student.id,
                    session_type="Full Mock" if s_idx != 2 else "Weak Area Retake",
                    target_role=student.profile.target_role or "Python Developer",
                    mode="adaptive",
                    status="completed",
                    total_score=round(base_score, 1),
                    is_flagged=is_flagged,
                    started_at=started_time,
                    ended_at=started_time + timedelta(minutes=20)
                )
                db.add(session)
                db.commit()
                db.refresh(session)
                total_sessions_count += 1

                # Select 4 questions for this session
                role_qs = [q for q in created_questions if q.role == session.target_role or q.question_type == "hr"]
                if len(role_qs) < 4:
                    role_qs = created_questions[:4]
                
                selected_qs = random.sample(role_qs, min(4, len(role_qs)))

                for q_order, q in enumerate(selected_qs, start=1):
                    sq = SessionQuestion(
                        session_id=session.id,
                        question_id=q.id,
                        question_order=q_order,
                        started_at=started_time + timedelta(minutes=q_order*4),
                        time_limit=q.time_limit_seconds
                    )
                    db.add(sq)
                    db.commit()
                    db.refresh(sq)

                    # Create Answer & Feedback
                    q_score = max(2.0, min(10.0, base_score + random.uniform(-1.0, 1.0)))
                    ans = Answer(
                        session_question_id=sq.id,
                        answer_text=f"Sample realistic answer explaining {q.category} concepts clearly. First, we define {q.keywords[0].keyword if q.keywords else 'the concept'}. Then we apply modular structure.",
                        is_voice=(q_order % 2 == 0),
                        time_taken_seconds=random.randint(45, 110),
                        submitted_late=False
                    )
                    db.add(ans)
                    db.commit()
                    db.refresh(ans)

                    fb = FeedbackScore(
                        answer_id=ans.id,
                        total_score=round(q_score, 1),
                        keyword_score=round(min(10.0, q_score + 0.5), 1),
                        semantic_score=round(q_score, 1),
                        completeness_score=round(max(4.0, q_score - 0.5), 1),
                        delivery_score=round(random.uniform(7.0, 9.5), 1),
                        star_score=round(q_score, 1) if q.question_type == "hr" else None,
                        matched_keywords_json=[k.keyword for k in q.keywords[:2]],
                        missed_keywords_json=[k.keyword for k in q.keywords[2:]],
                        feedback_json={
                            "strengths": [f"Good grasp of {q.category} fundamentals."],
                            "suggestions": [f"Deepen knowledge of edge cases in {q.category}."],
                            "model_comparison": q.model_answer[:120] + "...",
                            "delivery_metrics": {"wpm": 135.0, "filler_count": 1, "filler_words_found": ["like"], "pause_estimate": "Fluent pace"}
                        }
                    )
                    db.add(fb)

                if is_flagged:
                    evt1 = IntegrityEvent(
                        session_id=session.id,
                        event_type="tab_switch",
                        timestamp=started_time + timedelta(minutes=5),
                        details="User switched tab during question #2"
                    )
                    evt2 = IntegrityEvent(
                        session_id=session.id,
                        event_type="paste",
                        timestamp=started_time + timedelta(minutes=9),
                        details="Large text block pasted into answer field"
                    )
                    db.add_all([evt1, evt2])

        db.commit()
        print(f"Seeded {total_sessions_count} Completed Sessions across students!")
        print("\n--- SEEDING COMPLETE ---")
        print("Demo Credentials:")
        print("Trainer: trainer@interviewiq.ai / Trainer@123")
        print("Student: student1@interviewiq.ai / Student@123")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
