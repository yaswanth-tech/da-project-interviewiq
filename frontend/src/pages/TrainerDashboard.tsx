import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrainerAnalytics, FlaggedSession } from '../types';
import { PlotlyChart } from '../components/PlotlyChart';
import { ShieldAlert, Users, Award, Download, BookOpen, BarChart2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrainerDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<TrainerAnalytics | null>(null);
  const [flaggedSessions, setFlaggedSessions] = useState<FlaggedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    try {
      const [analyticsRes, flaggedRes] = await Promise.all([
        api.get('/analytics/trainer'),
        api.get('/analytics/trainer/flagged')
      ]);
      setAnalytics(analyticsRes.data);
      setFlaggedSessions(flaggedRes.data);
    } catch (err) {
      console.error('Failed to fetch trainer analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/analytics/trainer/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cohort_analytics_export.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-purple-600 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Cohort Analytics Portal...</span>
        </div>
      </div>
    );
  }

  // Missed categories bar chart data
  const missedCatData: Plotly.Data[] = [
    {
      x: analytics.missed_categories.map(m => m.category),
      y: analytics.missed_categories.map(m => m.avg_score),
      type: 'bar',
      marker: { color: '#8b5cf6' }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Trainer & Placement Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black">Cohort Performance & Weak-Area Analytics</h1>
          <p className="text-xs text-purple-200">
            Real-time analytics across all candidate interview attempts and integrity review logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/trainer/questions"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Manage Question Bank
          </Link>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 shadow-md flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export Cohort CSV
          </button>
        </div>
      </div>

      {/* Cohort Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Students</span>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{analytics.total_students}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Completed Sessions</span>
            <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">{analytics.total_sessions}</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Cohort Average Score</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{analytics.cohort_avg_score} / 10</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Flagged Sessions</span>
            <p className="text-3xl font-black text-rose-500 mt-1">{analytics.flagged_sessions_count}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Commonly Missed Categories Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            Most Commonly Missed Question Categories (Lowest Avg Score)
          </h3>
          <PlotlyChart
            data={missedCatData}
            layout={{ yaxis: { range: [0, 10], title: { text: 'Category Avg Score' } } }}
          />
        </div>

        {/* Student Leaderboard */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Student Leaderboard (Top Performers)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 font-bold">Rank & Name</th>
                  <th className="py-2.5 font-bold">College</th>
                  <th className="py-2.5 font-bold text-center">Sessions</th>
                  <th className="py-2.5 font-bold text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {analytics.leaderboard.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      {student.student_name}
                    </td>
                    <td className="py-3 text-slate-500">{student.college}</td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-400 font-medium">{student.sessions_completed}</td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{student.avg_score} / 10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Hardest Questions & Missed Keywords Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Hardest Questions Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Hardest Questions (Lowest Average Score)
          </h3>
          <div className="space-y-3">
            {analytics.hardest_questions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">{q.role} • {q.category}</span>
                  <span className="text-xs font-bold text-rose-500">{q.avg_score} / 10</span>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{q.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Most Missed Keywords */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-500" />
            Most Missed Keywords & Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {analytics.most_missed_keywords.map((kw, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{kw.keyword}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  {kw.miss_count} misses ({kw.category})
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Flagged Sessions Queue */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          Flagged Sessions Review Queue (Anti-Cheat Integrity)
        </h3>

        {flaggedSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 font-bold">Session ID</th>
                  <th className="py-2.5 font-bold">Candidate Name</th>
                  <th className="py-2.5 font-bold">Target Role</th>
                  <th className="py-2.5 font-bold">Integrity Logged Events</th>
                  <th className="py-2.5 font-bold text-right">Session Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {flaggedSessions.map((fs, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">#{fs.session_id}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {fs.student_name}
                      <span className="block text-[10px] font-normal text-slate-400">{fs.student_email}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">{fs.target_role}</td>
                    <td className="py-3 space-y-1">
                      {fs.integrity_events.map((evt, i) => (
                        <span key={i} className="inline-block mr-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200">
                          {evt.event_type}: {evt.details || 'Detected event'}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 text-right font-bold text-amber-500">{fs.total_score || 0.0} / 10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No flagged sessions requiring review.</p>
        )}
      </div>

    </div>
  );
};
