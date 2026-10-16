import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { SessionQuestion, FeedbackScore } from '../types';
import { CircularTimer } from '../components/CircularTimer';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { Brain, ShieldAlert, Send, FastForward, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';

export const InterviewRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState<SessionQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isVoice, setIsVoice] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120);
  const [totalTime, setTotalTime] = useState(120);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackScore | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);

  // Time tracking ref
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Fetch next question
  const fetchNextQuestion = async () => {
    setLoading(true);
    setAnswerText('');
    setRecentFeedback(null);
    setIsVoice(false);
    try {
      const res = await api.get(`/sessions/${sessionId}/next-question`);
      setCurrentQuestion(res.data);
      setRemainingTime(res.data.time_limit_seconds);
      setTotalTime(res.data.time_limit_seconds);
      startTimeRef.current = Date.now();
    } catch (err: any) {
      if (err.response && err.response.data?.detail?.includes('Maximum session question limit reached')) {
        // Complete session
        await api.post(`/sessions/${sessionId}/complete`);
        navigate(`/report/${sessionId}`);
      } else {
        console.error('Error fetching question:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
  }, [sessionId]);

  // Anti-cheat listener for tab switches
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && sessionId) {
        setTabSwitchCount(prev => prev + 1);
        try {
          await api.post('/sessions/integrity', {
            session_id: parseInt(sessionId, 10),
            event_type: 'tab_switch',
            details: 'Tab switch or window blur detected during question.'
          });
        } catch (e) {
          console.error('Failed to log integrity event:', e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId]);

  // Countdown timer interval
  useEffect(() => {
    if (!currentQuestion) return;

    timerIntervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [currentQuestion]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    setPasteCount(prev => prev + 1);
    if (sessionId) {
      try {
        await api.post('/sessions/integrity', {
          session_id: parseInt(sessionId, 10),
          event_type: 'paste',
          details: 'Clipboard paste event detected in answer field.'
        });
      } catch (err) {
        console.error('Failed to log paste integrity event:', err);
      }
    }
  };

  const handleAutoSubmit = () => {
    if (!submitting) {
      submitAnswerInternal(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswerInternal(false);
  };

  const submitAnswerInternal = async (autoExpired: boolean = false) => {
    if (!currentQuestion || submitting) return;
    setSubmitting(true);
    clearInterval(timerIntervalRef.current);

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const finalAnswer = autoExpired && !answerText.trim() ? "Skipped due to timer expiration." : answerText;

    try {
      const res = await api.post('/sessions/submit-answer', {
        session_question_id: currentQuestion.id,
        answer_text: finalAnswer,
        is_voice: isVoice,
        time_taken_seconds: timeTaken
      });
      setRecentFeedback(res.data);
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAndReport = async () => {
    if (sessionId) {
      await api.post(`/sessions/${sessionId}/complete`);
      navigate(`/report/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-sky-400 animate-pulse" />
          <span className="font-bold text-lg">Initializing Interview Environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Top Distraction-Free Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">{currentQuestion?.role} Mock Interview</h2>
            <span className="text-xs text-sky-400 font-semibold uppercase">{currentQuestion?.category} • {currentQuestion?.difficulty}</span>
          </div>
        </div>

        {/* Anti-Cheat Integrity Warning Banner */}
        {(tabSwitchCount > 0 || pasteCount > 0) && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Integrity Alert: {tabSwitchCount} Tab Switch(es) Logged</span>
          </div>
        )}

        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          End Session
        </button>
      </header>

      {/* Main Interview Body */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-between space-y-6">
        
        {/* Question Header & Circular Timer */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800 uppercase">
                Question {currentQuestion?.question_order} of 5
              </span>
              <span className="text-xs text-slate-400 capitalize">{currentQuestion?.question_type} Question</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
              {currentQuestion?.text}
            </h1>
          </div>

          <div className="shrink-0">
            <CircularTimer
              totalSeconds={totalTime}
              remainingSeconds={remainingTime}
              onExpire={handleAutoSubmit}
            />
          </div>
        </div>

        {/* Answer Input or Feedback View */}
        {!recentFeedback ? (
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
            
            <VoiceRecorder
              currentText={answerText}
              onTranscriptChange={(txt) => {
                setAnswerText(txt);
                setIsVoice(true);
              }}
            />

            <div className="relative flex-1">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onPaste={handlePaste}
                rows={8}
                placeholder="Type or speak your answer clearly... Include key concepts, definitions, and code logic where applicable."
                className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => submitAnswerInternal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                <FastForward className="w-4 h-4" />
                Skip Question (Score 0)
              </button>

              <button
                type="submit"
                disabled={submitting || !answerText.trim()}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md transition-all flex items-center gap-2 disabled:opacity-40"
              >
                {submitting ? 'Evaluating with AI...' : 'Submit Answer'}
                <Send className="w-4 h-4" />
              </button>
            </div>

          </form>
        ) : (
          /* Instant Question Feedback Review Modal / Card */
          <div className="p-6 rounded-2xl bg-slate-900 border border-sky-500/40 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Question #{currentQuestion?.question_order} Answer Evaluated</h3>
              </div>
              <span className="text-2xl font-black text-sky-400">{recentFeedback.total_score} / 10</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Keywords</span>
                <span className="text-base font-bold text-sky-400">{recentFeedback.keyword_score}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Semantic Fit</span>
                <span className="text-base font-bold text-indigo-400">{recentFeedback.semantic_score}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Completeness</span>
                <span className="text-base font-bold text-purple-400">{recentFeedback.completeness_score}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Delivery</span>
                <span className="text-base font-bold text-emerald-400">{recentFeedback.delivery_score}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Strengths:</span>
              <ul className="text-xs text-emerald-300 space-y-1">
                {recentFeedback.strengths.map((str, i) => (
                  <li key={i}>• {str}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={fetchNextQuestion}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Next Question
            </button>
          </div>
        )}

      </main>

      {/* Confirmation Exit Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">End Interview Session?</h3>
            <p className="text-xs text-slate-400">
              Ending early will calculate report metrics from answered questions so far.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Resume
              </button>
              <button
                onClick={handleFinishAndReport}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
