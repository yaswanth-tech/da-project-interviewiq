import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StudentAnalytics } from '../types';
import { PlotlyChart } from '../components/PlotlyChart';
import { Play, Flame, Clock, Award, Target, RefreshCw, ChevronRight, Sparkles, BarChart2 } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New session modal / controls state
  const [showStartModal, setShowStartModal] = useState(false);
  const [targetRole, setTargetRole] = useState(user?.profile?.target_role || 'Python Developer');
  const [sessionType, setSessionType] = useState('Full Mock');
  const [mode, setMode] = useState('adaptive');
  const [questionCount, setQuestionCount] = useState(5);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    if (searchParams.get('action') === 'start') {
      setShowStartModal(true);
    }
  }, [searchParams]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/student');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch student analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (overrideWeakCategories?: string[]) => {
    setStartingSession(true);
    try {
      const payload = {
        target_role: targetRole,
        session_type: overrideWeakCategories ? 'Weak Area Retake' : sessionType,
        mode,
        question_count: questionCount,
        weak_categories: overrideWeakCategories || undefined
      };
      const res = await api.post('/sessions', payload);
      navigate(`/interview/${res.data.id}`);
    } catch (err) {
      console.error('Failed to start interview session:', err);
    } finally {
      setStartingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sky-600 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Analytics Dashboard...</span>
        </div>
      </div>
    );
  }

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // Trend Line Chart Data
  const trendData = analytics?.score_trends || [];
  const lineChartData: Plotly.Data[] = [
    {
      x: trendData.map(t => `Attempt #${t.session_number}`),
      y: trendData.map(t => t.score),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Score Trend',
      line: { color: '#0284c7', width: 3, shape: 'spline' },
      marker: { size: 8, color: '#4f46e5' }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 text-white shadow-lg">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Welcome Back Candidate</span>
          <h1 className="text-2xl sm:text-3xl font-black">{user?.full_name}</h1>
          <p className="text-xs text-sky-100 flex items-center gap-2">
            <span>Target Role: <strong className="text-amber-300">{user?.profile?.target_role || 'Python Developer'}</strong></span>
            <span>•</span>
            <span>College: <strong>{user?.profile?.college || 'University'}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {analytics?.weakest_categories && analytics.weakest_categories.length > 0 && (
            <button
              onClick={() => handleStartSession(analytics.weakest_categories)}
              disabled={startingSession}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Retake Weak Areas ({analytics.weakest_categories[0]})
            </button>
          )}

          <button
            onClick={() => setShowStartModal(true)}
            disabled={startingSession}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-sky-700 hover:bg-sky-50 shadow-md transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-sky-700" />
            Start Mock Interview
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Overall Avg Score</span>
            <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">{analytics?.overall_avg_score} / 10</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Completed Sessions</span>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{analytics?.completed_sessions}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Practice Time</span>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{formatTime(analytics?.total_practice_time_seconds || 0)}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Practice Streak</span>
            <p className="text-3xl font-black text-amber-500 mt-1">{analytics?.current_streak_days} Days</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Plotly Score Trend Line Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-500" />
              Score Improvement Trend
            </h3>
            <span className="text-xs text-slate-400 font-medium">Historical Sessions</span>
          </div>
          <PlotlyChart
            data={lineChartData}
            layout={{ yaxis: { range: [0, 10], title: { text: 'Score (out of 10)' } } }}
          />
        </div>

        {/* Category Mastery Heatmap Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Category Mastery Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 font-bold">Category</th>
                  <th className="py-2.5 font-bold text-center">Questions Answered</th>
                  <th className="py-2.5 font-bold text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {analytics?.category_mastery && analytics.category_mastery.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{cat.category}</td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-400">{cat.total_questions}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        cat.avg_score >= 8.0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : cat.avg_score >= 6.0
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {cat.avg_score} / 10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Start Session Setup Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Configure Mock Interview</h2>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Target Placement Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none"
                >
                  <option value="Python Developer">Python Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="HR General">HR General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Adaptive Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('adaptive')}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                      mode === 'adaptive'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Adaptive Difficulty
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">Dynamically adjusts per answer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('fixed')}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                      mode === 'fixed'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Fixed Difficulty
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">Standard progressive questions</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Number of Questions</label>
                <div className="flex gap-3">
                  {[3, 5, 8].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        questionCount === num
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartSession()}
              disabled={startingSession}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {startingSession ? 'Initializing Session...' : 'Enter Interview Room'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
