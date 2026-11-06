import { 
  User, 
  Question, 
  InterviewSession, 
  SessionQuestion, 
  FeedbackScore, 
  StudentAnalytics, 
  TrainerAnalytics,
  FlaggedSession 
} from '../types';

export const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'student1@interviewiq.ai': {
    password: 'Student@123',
    user: {
      id: 2,
      email: 'student1@interviewiq.ai',
      full_name: 'Student Candidate 1',
      role: 'student',
      created_at: new Date().toISOString(),
      profile: {
        college: 'NIT Warangal',
        target_role: 'Python Developer',
        experience_level: 'Fresher'
      }
    }
  },
  'trainer@interviewiq.ai': {
    password: 'Trainer@123',
    user: {
      id: 1,
      email: 'trainer@interviewiq.ai',
      full_name: 'Dr. Rajesh Sharma (Lead Trainer)',
      role: 'trainer',
      created_at: new Date().toISOString()
    }
  }
};

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    role: 'Python Developer',
    category: 'OOP',
    question_type: 'technical',
    difficulty: 'easy',
    time_limit_seconds: 120,
    text: 'What is the difference between shallow copy and deep copy in Python?',
    model_answer: 'A shallow copy constructs a new object and populates it with references to child objects found in the original. Modifying nested mutable objects affects both. A deep copy recursively constructs a new object and inserts copies of child objects found in the original, ensuring complete independence.',
    keywords: [
      { keyword: 'shallow copy', weight: 1.5, synonyms: ['references'] },
      { keyword: 'deep copy', weight: 1.5, synonyms: ['recursively'] },
      { keyword: 'copy module', weight: 1.0, synonyms: ['copy.deepcopy'] },
      { keyword: 'mutable objects', weight: 1.2, synonyms: ['nesting'] }
    ]
  },
  {
    id: 2,
    role: 'Python Developer',
    category: 'Generators & Iterators',
    question_type: 'technical',
    difficulty: 'medium',
    time_limit_seconds: 120,
    text: 'What is a Python generator, how does the yield keyword differ from return, and what are its memory benefits?',
    model_answer: 'A generator is a special function that returns an iterator object. Unlike return which terminates execution and returns a value, yield pauses function execution, saves state, and yields a value. This provides memory efficiency through lazy evaluation when working with large data streams.',
    keywords: [
      { keyword: 'generator', weight: 1.5, synonyms: ['iterator'] },
      { keyword: 'yield', weight: 1.5, synonyms: ['pause'] },
      { keyword: 'lazy evaluation', weight: 1.2, synonyms: ['memory efficient'] },
      { keyword: 'state preservation', weight: 1.0, synonyms: ['execution state'] }
    ]
  },
  {
    id: 3,
    role: 'Python Developer',
    category: 'Memory Management',
    question_type: 'technical',
    difficulty: 'hard',
    time_limit_seconds: 180,
    text: 'How does Python handle memory management and garbage collection?',
    model_answer: 'Python uses reference counting as its primary memory management mechanism. When reference count drops to zero, memory is freed immediately. To resolve cyclic references, Python includes a generational garbage collector with three generations (0, 1, 2) that detects unreachable reference cycles.',
    keywords: [
      { keyword: 'reference counting', weight: 1.5, synonyms: ['refcount'] },
      { keyword: 'garbage collection', weight: 1.5, synonyms: ['gc module'] },
      { keyword: 'cyclic reference', weight: 1.2, synonyms: ['cycles'] },
      { keyword: 'generations', weight: 1.2, synonyms: ['gen 0 gen 1 gen 2'] }
    ]
  },
  {
    id: 4,
    role: 'Data Analyst',
    category: 'SQL',
    question_type: 'technical',
    difficulty: 'easy',
    time_limit_seconds: 120,
    text: 'What is the difference between WHERE and HAVING clauses in SQL?',
    model_answer: 'WHERE filters individual rows before grouping occurs, and cannot contain aggregate functions. HAVING filters aggregated groups after the GROUP BY clause has executed and can evaluate aggregate functions like SUM, COUNT, and AVG.',
    keywords: [
      { keyword: 'where clause', weight: 1.5, synonyms: ['row filter'] },
      { keyword: 'having clause', weight: 1.5, synonyms: ['aggregate filter'] },
      { keyword: 'group by', weight: 1.2, synonyms: ['grouping'] },
      { keyword: 'aggregate functions', weight: 1.2, synonyms: ['count avg sum'] }
    ]
  },
  {
    id: 5,
    role: 'Data Analyst',
    category: 'SQL',
    question_type: 'technical',
    difficulty: 'medium',
    time_limit_seconds: 150,
    text: 'Explain SQL Window Functions and compare ROW_NUMBER(), RANK(), and DENSE_RANK().',
    model_answer: 'Window functions perform calculations across a set of table rows related to the current row without collapsing rows. ROW_NUMBER assigns a unique sequential integer. RANK assigns equal rank to duplicate values and skips next ranks. DENSE_RANK assigns equal rank to duplicates without skipping ranks.',
    keywords: [
      { keyword: 'window functions', weight: 1.5, synonyms: ['partition by'] },
      { keyword: 'row_number', weight: 1.2, synonyms: ['sequential'] },
      { keyword: 'rank', weight: 1.2, synonyms: ['skips ranks'] },
      { keyword: 'dense_rank', weight: 1.2, synonyms: ['no gap'] }
    ]
  },
  {
    id: 6,
    role: 'Java Developer',
    category: 'JVM & Memory',
    question_type: 'technical',
    difficulty: 'easy',
    time_limit_seconds: 120,
    text: 'Explain JVM Memory Architecture: Heap vs Stack memory in Java.',
    model_answer: 'Stack memory stores primitive values and references to objects for method execution per thread. Stack memory is LIFO and automatically cleared when a method finishes. Heap memory stores actual object instances shared across all threads, managed by the Garbage Collector.',
    keywords: [
      { keyword: 'heap memory', weight: 1.5, synonyms: ['objects'] },
      { keyword: 'stack memory', weight: 1.5, synonyms: ['primitives', 'lifo'] },
      { keyword: 'thread safety', weight: 1.0, synonyms: ['shared'] },
      { keyword: 'garbage collection', weight: 1.2, synonyms: ['gc'] }
    ]
  },
  {
    id: 7,
    role: 'Web Developer',
    category: 'React Fundamentals',
    question_type: 'technical',
    difficulty: 'easy',
    time_limit_seconds: 120,
    text: 'Explain the Virtual DOM in React and how the reconciliation process works.',
    model_answer: 'The Virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous tree using a diffing algorithm (Reconciliation), and batch updates only changed nodes in the real DOM.',
    keywords: [
      { keyword: 'virtual dom', weight: 1.5, synonyms: ['in-memory'] },
      { keyword: 'reconciliation', weight: 1.5, synonyms: ['diffing algorithm'] },
      { keyword: 'batch update', weight: 1.2, synonyms: ['real dom'] },
      { keyword: 'state change', weight: 1.0, synonyms: ['render'] }
    ]
  },
  {
    id: 8,
    role: 'HR General',
    category: 'Behavioral & STAR',
    question_type: 'hr',
    difficulty: 'medium',
    time_limit_seconds: 180,
    text: 'Describe a situation where you had a tight deadline and conflicting priorities. How did you handle it?',
    model_answer: 'SITUATION: During a critical product release, our team faced two major feature requests with competing deadlines. TASK: I was responsible for delivering the core API integration while addressing critical bugs. ACTION: I prioritized tasks using Eisenhower Matrix, aligned stakeholders on revised timelines, and automated repetitive tests. RESULT: We delivered on time with zero high-severity bugs.',
    keywords: [
      { keyword: 'situation', weight: 1.5, synonyms: ['project'] },
      { keyword: 'task', weight: 1.5, synonyms: ['responsibility'] },
      { keyword: 'action', weight: 1.5, synonyms: ['prioritization'] },
      { keyword: 'result', weight: 1.5, synonyms: ['outcome', 'on time'] }
    ]
  }
];

export const MOCK_STUDENT_ANALYTICS: StudentAnalytics = {
  total_sessions: 6,
  completed_sessions: 5,
  overall_avg_score: 7.8,
  total_practice_time_seconds: 3600,
  current_streak_days: 4,
  score_trends: [
    { session_number: 1, session_id: 101, date: '2026-10-28', target_role: 'Python Developer', score: 6.2 },
    { session_number: 2, session_id: 102, date: '2026-10-30', target_role: 'Python Developer', score: 6.9 },
    { session_number: 3, session_id: 103, date: '2026-11-01', target_role: 'Python Developer', score: 7.5 },
    { session_number: 4, session_id: 104, date: '2026-11-03', target_role: 'Python Developer', score: 8.1 },
    { session_number: 5, session_id: 105, date: '2026-11-05', target_role: 'Python Developer', score: 8.6 }
  ],
  category_mastery: [
    { category: 'OOP', total_questions: 6, avg_score: 8.5 },
    { category: 'Generators & Iterators', total_questions: 4, avg_score: 7.8 },
    { category: 'Memory Management', total_questions: 3, avg_score: 6.4 },
    { category: 'Concurrency', total_questions: 3, avg_score: 6.1 },
    { category: 'Behavioral & STAR', total_questions: 4, avg_score: 8.9 }
  ],
  weakest_categories: ['Concurrency', 'Memory Management']
};

export const MOCK_TRAINER_ANALYTICS: TrainerAnalytics = {
  total_students: 25,
  total_sessions: 128,
  cohort_avg_score: 7.2,
  missed_categories: [
    { category: 'Concurrency', total_attempts: 42, avg_score: 5.8 },
    { category: 'Memory Management', total_attempts: 38, avg_score: 6.1 },
    { category: 'Statistics', total_attempts: 30, avg_score: 6.4 },
    { category: 'SQL Window Functions', total_attempts: 45, avg_score: 6.7 },
    { category: 'OOP', total_attempts: 65, avg_score: 7.8 }
  ],
  most_missed_keywords: [
    { keyword: 'cyclic reference', category: 'Memory Management', miss_count: 24 },
    { keyword: 'c3 linearization', category: 'OOP', miss_count: 21 },
    { keyword: 'gil mutex', category: 'Concurrency', miss_count: 19 },
    { keyword: 'dense_rank', category: 'SQL', miss_count: 16 }
  ],
  hardest_questions: [
    { id: 3, text: 'How does Python handle memory management and garbage collection?', role: 'Python Developer', category: 'Memory Management', avg_score: 5.4, attempt_count: 28 },
    { id: 5, text: 'Explain SQL Window Functions and compare ROW_NUMBER(), RANK(), and DENSE_RANK().', role: 'Data Analyst', category: 'SQL', avg_score: 5.7, attempt_count: 32 },
    { id: 6, text: 'Explain JVM Memory Architecture: Heap vs Stack memory in Java.', role: 'Java Developer', category: 'JVM & Memory', avg_score: 6.0, attempt_count: 25 }
  ],
  leaderboard: [
    { student_id: 13, student_name: 'Student Candidate 13', college: 'KL University', sessions_completed: 6, avg_score: 8.8 },
    { student_id: 10, student_name: 'Student Candidate 10', college: 'IIT Hyderabad', sessions_completed: 6, avg_score: 8.5 },
    { student_id: 24, student_name: 'Student Candidate 24', college: 'JNTU Kakinada', sessions_completed: 5, avg_score: 8.3 },
    { student_id: 2, student_name: 'Student Candidate 1', college: 'NIT Warangal', sessions_completed: 5, avg_score: 7.8 }
  ],
  flagged_sessions_count: 3
};

export const MOCK_FLAGGED_SESSIONS: FlaggedSession[] = [
  {
    session_id: 104,
    student_name: 'Student Candidate 1',
    student_email: 'student1@interviewiq.ai',
    target_role: 'Python Developer',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    integrity_events: [
      { event_type: 'tab_switch', timestamp: new Date(Date.now() - 86000000).toISOString(), details: 'Candidate switched tabs during Question #2' },
      { event_type: 'paste', timestamp: new Date(Date.now() - 85500000).toISOString(), details: 'Pasted large text block into answer field' }
    ],
    total_score: 7.5
  }
];

// Helper to evaluate answer client-side if server is unavailable
export function evaluateAnswerClientSide(
  answerText: string,
  question: Question,
  timeTakenSeconds: number = 45
): FeedbackScore {
  const words = answerText.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const matched: string[] = [];
  const missed: string[] = [];

  question.keywords.forEach((k) => {
    const kw = k.keyword.toLowerCase();
    const synonyms = k.synonyms?.map((s) => s.toLowerCase()) || [];
    const found = words.includes(kw) || synonyms.some((s) => answerText.toLowerCase().includes(s)) || answerText.toLowerCase().includes(kw);
    if (found) {
      matched.push(k.keyword);
    } else {
      missed.push(k.keyword);
    }
  });

  const keywordRatio = question.keywords.length > 0 ? matched.length / question.keywords.length : 0.8;
  const keywordScore = Math.min(10, Math.max(2, Math.round(keywordRatio * 10 * 10) / 10));

  // Completeness based on length
  const completenessScore = wordCount > 30 ? 9.2 : wordCount > 15 ? 7.5 : 4.0;
  // Semantic similarity estimate
  const semanticScore = Math.min(10, Math.max(3, Math.round((keywordScore * 0.6 + completenessScore * 0.4) * 10) / 10));

  // Delivery pace (ideal 110-150 wpm)
  const wpm = timeTakenSeconds > 0 ? Math.round((wordCount / timeTakenSeconds) * 60) : 130;
  const fillers = ['um', 'uh', 'like', 'basically', 'actually'];
  const fillersFound = words.filter((w) => fillers.includes(w));
  const deliveryScore = fillersFound.length > 3 ? 6.5 : 8.8;

  let starScore: number | undefined = undefined;
  if (question.question_type === 'hr') {
    const hasS = answerText.toLowerCase().includes('situation') || words.length > 20;
    const hasT = answerText.toLowerCase().includes('task') || words.length > 30;
    const hasA = answerText.toLowerCase().includes('action') || words.length > 40;
    const hasR = answerText.toLowerCase().includes('result') || words.length > 50;
    const starCount = [hasS, hasT, hasA, hasR].filter(Boolean).length;
    starScore = Math.round((starCount / 4) * 10 * 10) / 10;
  }

  const totalScore = starScore !== undefined
    ? Math.round((keywordScore * 0.25 + semanticScore * 0.25 + completenessScore * 0.2 + deliveryScore * 0.15 + starScore * 0.15) * 10) / 10
    : Math.round((keywordScore * 0.4 + semanticScore * 0.35 + completenessScore * 0.15 + deliveryScore * 0.1) * 10) / 10;

  return {
    id: Date.now(),
    answer_id: Date.now(),
    total_score: totalScore,
    keyword_score: keywordScore,
    semantic_score: semanticScore,
    completeness_score: completenessScore,
    delivery_score: deliveryScore,
    star_score: starScore,
    matched_keywords: matched,
    missed_keywords: missed,
    strengths: [
      matched.length > 0 ? `Covered key concepts: ${matched.slice(0, 3).join(', ')}` : 'Clear and structured articulation',
      'Good technical depth and focus on fundamentals'
    ],
    suggestions: [
      missed.length > 0 ? `Try to mention: ${missed.slice(0, 3).join(', ')}` : 'Include more concrete code or architecture examples',
      'Practice maintaining steady pace without hesitation'
    ],
    model_comparison: question.model_answer,
    delivery_metrics: {
      wpm: wpm || 125,
      filler_count: fillersFound.length,
      filler_words_found: Array.from(new Set(fillersFound)),
      pause_estimate: fillersFound.length > 2 ? 'Occasional hesitation' : 'Smooth pace'
    }
  };
}
