export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'trainer';
  created_at: string;
  profile?: {
    college?: string;
    target_role?: string;
    experience_level?: string;
  };
}

export interface QuestionKeyword {
  keyword: string;
  weight: number;
  synonyms?: string[];
}

export interface Question {
  id: number;
  text: string;
  question_type: 'technical' | 'hr';
  role: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_seconds: number;
  model_answer: string;
  keywords: QuestionKeyword[];
  created_at?: string;
}

export interface SessionQuestion {
  id: number; // session_question_id
  question_id: number;
  question_order: number;
  text?: string;
  question_type?: 'technical' | 'hr';
  role?: string;
  category?: string;
  difficulty?: string;
  time_limit_seconds?: number;
  started_at: string;
  has_submitted?: boolean;
  question?: Question;
  answer?: {
    id: number;
    answer_text: string;
    is_voice: boolean;
    time_taken_seconds: number;
    submitted_late: boolean;
    feedback?: FeedbackScore;
  };
}

export interface InterviewSession {
  id: number;
  student_id: number;
  session_type: string;
  target_role: string;
  mode: string;
  status: string;
  total_score?: number;
  is_flagged: boolean;
  started_at: string;
  ended_at?: string;
  session_questions?: SessionQuestion[];
}

export interface DeliveryMetrics {
  wpm: number;
  filler_count: number;
  filler_words_found: string[];
  pause_estimate: string;
}

export interface FeedbackScore {
  id: number;
  answer_id: number;
  total_score: number;
  keyword_score: number;
  semantic_score: number;
  completeness_score: number;
  delivery_score: number;
  star_score?: number;
  matched_keywords: string[];
  missed_keywords: string[];
  strengths: string[];
  suggestions: string[];
  model_comparison: string;
  delivery_metrics?: DeliveryMetrics;
}

export interface StudentAnalytics {
  total_sessions: number;
  completed_sessions: number;
  overall_avg_score: number;
  total_practice_time_seconds: number;
  current_streak_days: number;
  score_trends: { session_number: number; session_id: number; date: string; target_role: string; score: number }[];
  category_mastery: { category: string; total_questions: number; avg_score: number }[];
  weakest_categories: string[];
}

export interface TrainerAnalytics {
  total_students: number;
  total_sessions: number;
  cohort_avg_score: number;
  missed_categories: { category: string; total_attempts: number; avg_score: number }[];
  most_missed_keywords: { keyword: string; category: string; miss_count: number }[];
  hardest_questions: { id: number; text: string; role: string; category: string; avg_score: number; attempt_count: number }[];
  leaderboard: { student_id: number; student_name: string; college: string; sessions_completed: number; avg_score: number }[];
  flagged_sessions_count: number;
}

export interface FlaggedSession {
  session_id: number;
  student_name: string;
  student_email: string;
  target_role: string;
  started_at: string;
  integrity_events: { event_type: string; timestamp: string; details?: string }[];
  total_score?: number;
}
