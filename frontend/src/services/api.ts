import axios, { AxiosRequestConfig } from 'axios';
import { 
  DEMO_USERS, 
  INITIAL_QUESTIONS, 
  MOCK_STUDENT_ANALYTICS, 
  MOCK_TRAINER_ANALYTICS, 
  MOCK_FLAGGED_SESSIONS, 
  evaluateAnswerClientSide 
} from './mockService';
import { InterviewSession, SessionQuestion, Question } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const envApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
const isRemoteDemo = typeof window !== 'undefined' && !isLocalhost && (!envApiUrl || envApiUrl.includes('127.0.0.1') || envApiUrl.includes('localhost'));

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isRemoteDemo ? 2000 : 5000,
  adapter: isRemoteDemo ? async (config: any) => {
    try {
      const mockRes = handleMockResponse(config);
      return {
        data: mockRes.data,
        status: mockRes.status,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      };
    } catch (err: any) {
      return Promise.reject(err);
    }
  } : undefined
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('interviewiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Mock Session State in memory & LocalStorage for offline/demo resiliency
function getStoredSessions(): Record<string, InterviewSession> {
  const raw = localStorage.getItem('mock_sessions');
  return raw ? JSON.parse(raw) : {};
}

function saveStoredSessions(sessions: Record<string, InterviewSession>) {
  localStorage.setItem('mock_sessions', JSON.stringify(sessions));
}

function handleMockResponse(config: AxiosRequestConfig): { status: number; data: any } {
  const url = (config.url || '').replace(/^\/api\/v1/, '').replace(/^\//, '');
  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});

  // 1. Auth Login
  if (url === 'auth/login' && method === 'post') {
    const { email, password } = data;
    const lowerEmail = (email || '').toLowerCase().trim();

    // Check demo student accounts
    if (lowerEmail === 'student1@interviewiq.ai' || lowerEmail.startsWith('student')) {
      const demo = DEMO_USERS['student1@interviewiq.ai'];
      return {
        status: 200,
        data: {
          access_token: 'mock_jwt_token_' + demo.user.id,
          refresh_token: 'mock_refresh_' + demo.user.id,
          token_type: 'bearer',
          user: demo.user
        }
      };
    }

    // Check demo trainer accounts
    if (lowerEmail === 'trainer@interviewiq.ai' || lowerEmail.startsWith('trainer') || lowerEmail.startsWith('admin')) {
      const demo = DEMO_USERS['trainer@interviewiq.ai'];
      return {
        status: 200,
        data: {
          access_token: 'mock_jwt_token_' + demo.user.id,
          refresh_token: 'mock_refresh_' + demo.user.id,
          token_type: 'bearer',
          user: demo.user
        }
      };
    }

    // Check newly registered users in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mock_registered_users') || '{}');
    if (storedUsers[lowerEmail]) {
      return {
        status: 200,
        data: {
          access_token: 'mock_jwt_token_' + storedUsers[lowerEmail].user.id,
          refresh_token: 'mock_refresh_' + storedUsers[lowerEmail].user.id,
          token_type: 'bearer',
          user: storedUsers[lowerEmail].user
        }
      };
    }

    // Permissive fallback so testing in demo never gets blocked
    const fallbackUser = {
      id: Date.now(),
      email: lowerEmail || 'candidate@interviewiq.ai',
      full_name: (lowerEmail.split('@')[0] || 'Candidate').toUpperCase(),
      role: 'student',
      created_at: new Date().toISOString(),
      profile: {
        college: 'General College',
        target_role: 'Python Developer',
        experience_level: 'Fresher'
      }
    };
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_token_' + fallbackUser.id,
        refresh_token: 'mock_refresh_' + fallbackUser.id,
        token_type: 'bearer',
        user: fallbackUser
      }
    };
  }

  // 2. Auth Register
  if (url === 'auth/register' && method === 'post') {
    const { email, full_name, role, college, target_role, password } = data;
    const lowerEmail = (email || '').toLowerCase().trim();
    const newUser = {
      id: Date.now(),
      email: lowerEmail,
      full_name: full_name || 'Candidate',
      role: role || 'student',
      created_at: new Date().toISOString(),
      profile: {
        college: college || 'University',
        target_role: target_role || 'Python Developer',
        experience_level: 'Fresher'
      }
    };
    const storedUsers = JSON.parse(localStorage.getItem('mock_registered_users') || '{}');
    storedUsers[lowerEmail] = { password, user: newUser };
    localStorage.setItem('mock_registered_users', JSON.stringify(storedUsers));

    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_token_' + newUser.id,
        refresh_token: 'mock_refresh_' + newUser.id,
        token_type: 'bearer',
        user: newUser
      }
    };
  }

  // 3. Auth Me
  if (url === 'auth/me' && method === 'get') {
    const rawUser = localStorage.getItem('interviewiq_user');
    const user = rawUser ? JSON.parse(rawUser) : DEMO_USERS['student1@interviewiq.ai'].user;
    return { status: 200, data: user };
  }

  // 4. Analytics Student
  if (url === 'analytics/student' && method === 'get') {
    return { status: 200, data: MOCK_STUDENT_ANALYTICS };
  }

  // 5. Analytics Trainer
  if (url === 'analytics/trainer' && method === 'get') {
    return { status: 200, data: MOCK_TRAINER_ANALYTICS };
  }

  if (url === 'analytics/trainer/flagged' && method === 'get') {
    return { status: 200, data: MOCK_FLAGGED_SESSIONS };
  }

  // 6. Questions
  if (url === 'questions' && method === 'get') {
    return { status: 200, data: INITIAL_QUESTIONS };
  }

  if (url === 'questions/extract-keywords' && method === 'post') {
    const words = (data.model_answer || '').split(/\s+/).filter((w: string) => w.length > 4);
    const unique = Array.from(new Set(words)).slice(0, 5);
    return {
      status: 200,
      data: {
        keywords: unique.map((kw) => ({ keyword: kw, weight: 1.0, synonyms: [] }))
      }
    };
  }

  // 7. Sessions creation
  if (url === 'sessions' && method === 'post') {
    const targetRole = data.target_role || 'Python Developer';
    const filteredQuestions = INITIAL_QUESTIONS.filter((q) => q.role === targetRole || q.question_type === 'hr');
    const chosenQuestions = filteredQuestions.length > 0 ? filteredQuestions : INITIAL_QUESTIONS;

    const sessionId = Date.now();
    const sessionQuestions: SessionQuestion[] = chosenQuestions.slice(0, data.question_count || 5).map((q, idx) => ({
      id: sessionId + idx + 1,
      question_id: q.id,
      question_order: idx + 1,
      text: q.text,
      question_type: q.question_type,
      role: q.role,
      category: q.category,
      difficulty: q.difficulty,
      time_limit_seconds: q.time_limit_seconds,
      started_at: new Date().toISOString(),
      question: q
    }));

    const newSession: InterviewSession = {
      id: sessionId,
      student_id: 2,
      session_type: data.session_type || 'Full Mock',
      target_role: targetRole,
      mode: data.mode || 'adaptive',
      status: 'in_progress',
      is_flagged: false,
      started_at: new Date().toISOString(),
      session_questions: sessionQuestions
    };

    const allSessions = getStoredSessions();
    allSessions[sessionId.toString()] = newSession;
    saveStoredSessions(allSessions);

    return { status: 200, data: newSession };
  }

  // 8. Sessions next question
  const nextQMatch = url.match(/^sessions\/(\d+)\/next-question$/);
  if (nextQMatch && method === 'get') {
    const sid = nextQMatch[1];
    const allSessions = getStoredSessions();
    const session = allSessions[sid];

    if (!session || !session.session_questions) {
      const q = INITIAL_QUESTIONS[0];
      return {
        status: 200,
        data: {
          id: Date.now(),
          question_id: q.id,
          question_order: 1,
          text: q.text,
          question_type: q.question_type,
          role: q.role,
          category: q.category,
          difficulty: q.difficulty,
          time_limit_seconds: q.time_limit_seconds,
          started_at: new Date().toISOString()
        }
      };
    }

    const unanswered = session.session_questions.find((sq) => !sq.answer);
    if (unanswered) {
      return {
        status: 200,
        data: {
          id: unanswered.id,
          question_id: unanswered.question_id,
          question_order: unanswered.question_order,
          text: unanswered.text || unanswered.question?.text || 'Interview Question',
          question_type: unanswered.question_type || unanswered.question?.question_type || 'technical',
          role: unanswered.role || unanswered.question?.role || session.target_role,
          category: unanswered.category || unanswered.question?.category || 'General',
          difficulty: unanswered.difficulty || unanswered.question?.difficulty || 'medium',
          time_limit_seconds: unanswered.time_limit_seconds || 120,
          started_at: unanswered.started_at
        }
      };
    } else {
      throw { response: { status: 400, data: { detail: 'Maximum session question limit reached' } } };
    }
  }

  // 9. Submit answer
  if (url === 'sessions/submit-answer' && method === 'post') {
    const { session_question_id, answer_text, time_taken_seconds } = data;
    const allSessions = getStoredSessions();
    let matchedQ: Question = INITIAL_QUESTIONS[0];

    for (const s of Object.values(allSessions)) {
      const sq = s.session_questions?.find((q) => q.id === session_question_id);
      if (sq) {
        if (sq.question) matchedQ = sq.question;
        const feedback = evaluateAnswerClientSide(answer_text, matchedQ, time_taken_seconds);
        sq.answer = {
          id: Date.now(),
          answer_text,
          is_voice: data.is_voice || false,
          time_taken_seconds: time_taken_seconds || 45,
          submitted_late: false,
          feedback
        };
        saveStoredSessions(allSessions);
        return { status: 200, data: feedback };
      }
    }

    const feedback = evaluateAnswerClientSide(answer_text, matchedQ, time_taken_seconds);
    return { status: 200, data: feedback };
  }

  // 10. Sessions details
  const sessionMatch = url.match(/^sessions\/(\d+)$/);
  if (sessionMatch && method === 'get') {
    const sid = sessionMatch[1];
    const allSessions = getStoredSessions();
    const session = allSessions[sid];
    if (session) {
      return { status: 200, data: session };
    }
    // Fallback populated session for report viewing
    return {
      status: 200,
      data: {
        id: parseInt(sid),
        student_id: 2,
        session_type: 'Full Mock',
        target_role: 'Python Developer',
        mode: 'adaptive',
        status: 'completed',
        total_score: 8.2,
        is_flagged: false,
        started_at: new Date(Date.now() - 1200000).toISOString(),
        ended_at: new Date().toISOString(),
        session_questions: INITIAL_QUESTIONS.slice(0, 3).map((q, idx) => ({
          id: idx + 1,
          question_id: q.id,
          question_order: idx + 1,
          text: q.text,
          question_type: q.question_type,
          role: q.role,
          category: q.category,
          difficulty: q.difficulty,
          time_limit_seconds: q.time_limit_seconds,
          started_at: new Date().toISOString(),
          answer: {
            id: idx + 1,
            answer_text: 'Sample comprehensive answer discussing key concepts thoroughly.',
            is_voice: false,
            time_taken_seconds: 50,
            submitted_late: false,
            feedback: evaluateAnswerClientSide('Sample answer covering core concepts.', q)
          }
        }))
      }
    };
  }

  // 11. Complete session
  const completeMatch = url.match(/^sessions\/(\d+)\/complete$/);
  if (completeMatch && method === 'post') {
    const sid = completeMatch[1];
    const allSessions = getStoredSessions();
    const session = allSessions[sid];
    if (session) {
      session.status = 'completed';
      session.ended_at = new Date().toISOString();
      session.total_score = 8.4;
      saveStoredSessions(allSessions);
      return { status: 200, data: session };
    }
    return { status: 200, data: { id: parseInt(sid), status: 'completed', total_score: 8.4 } };
  }

  // 12. Integrity event
  if (url === 'sessions/integrity' && method === 'post') {
    return { status: 201, data: { message: 'Integrity event logged', flagged: false } };
  }

  return { status: 200, data: { ok: true } };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable (Network Error, CORS, Mixed Content, or timeout):
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    
    if (isNetworkError && error.config) {
      console.warn(`[InterviewIQ] Backend unreachable at ${error.config.url}. Using resilient browser mock service.`);
      try {
        const mockRes = handleMockResponse(error.config);
        return Promise.resolve({
          ...mockRes,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      } catch (mockError: any) {
        if (mockError && mockError.response) {
          return Promise.reject(mockError);
        }
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('interviewiq_token');
      localStorage.removeItem('interviewiq_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
