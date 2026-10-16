import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { InterviewSession, FeedbackScore } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import { PlotlyChart } from '../components/PlotlyChart';
import { Award, Download, Sparkles, RefreshCw, ArrowLeft, BarChart2, CheckCircle2 } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [feedbacks, setFeedbacks] = useState<{ feedback: FeedbackScore; questionText: string; questionOrder: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionReport();
  }, [sessionId]);

  const fetchSessionReport = async () => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      setSession(res.data);

      // Collect feedback cards
      const sqs = res.data.session_questions || [];
      const fbList: { feedback: FeedbackScore; questionText: string; questionOrder: number }[] = [];
      
      for (const sq of sqs) {
        if (sq.answer && sq.answer.feedback) {
          fbList.push({
            feedback: sq.answer.feedback,
            questionText: sq.question?.text || sq.text || 'Question',
            questionOrder: sq.question_order
          });
        }
      }
      setFeedbacks(fbList);
    } catch (err) {
      console.error('Error fetching session report:', err);
    } flex: {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    window.print();
  };

  if (loading || !session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sky-600 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Generating AI Feedback Report...</span>
        </div>
      </div>
    );
  }

  const overallScore = session.total_score || 0.0;
  
  const getGrade = (score: number) => {
    if (score >= 9.0) return { grade: 'A+', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950 border-emerald-200' };
    if (score >= 8.0) return { grade: 'A', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950 border-sky-200' };
    if (score >= 7.0) return { grade: 'B+', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950 border-indigo-200' };
    if (score >= 6.0) return { grade: 'B', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950 border-purple-200' };
    return { grade: 'Needs Improvement', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950 border-amber-200' };
  };

  const gradeInfo = getGrade(overallScore);

  // Radar Chart Data for Category Performance
  const categories = Array.from(new Set(session.session_questions?.map(sq => sq.question?.category || sq.category || 'General') || []));
  const categoryScores = categories.map(cat => {
    const catFbs = feedbacks.filter(f => (f.questionText && f.questionText.includes(cat)) || true);
    if (!catFbs.length) return 7.0;
    return catFbs.reduce((acc, f) => acc + f.feedback.total_score, 0) / catFbs.length;
  });

  const radarData: Plotly.Data[] = [
    {
      type: 'scatterpolar',
      r: categoryScores,
      theta: categories.length ? categories : ['Core Tech', 'Problem Solving', 'Communication', 'Completeness'],
      fill: 'toself',
      name: 'Category Performance',
      line: { color: '#0284c7' },
      fillcolor: 'rgba(2, 132, 199, 0.2)'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-sky-600">
          <ArrowLeft className="w-4 h-4" />
          Back to Candidate Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Report PDF
          </button>
          <Link
            to="/dashboard?action=start"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Take Another Interview
          </Link>
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center md:text-left">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-wider">
            Comprehensive Mock Feedback Report
          </span>
          <h1 className="text-3xl font-black">{session.target_role} Interview</h1>
          <p className="text-xs text-slate-300">
            Completed on {new Date(session.started_at).toLocaleDateString()} • {session.session_questions?.length || 5} Questions Evaluated
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase font-bold block">Overall Score</span>
            <span className="text-4xl font-black text-sky-400">{overallScore} / 10</span>
          </div>
          <div className="w-px h-12 bg-slate-800" />
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase font-bold block">Evaluation Grade</span>
            <span className={`inline-block mt-1 px-4 py-1.5 rounded-xl text-lg font-black ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Radar Chart Visual */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          Category Mastery Radar Analysis
        </h3>
        <PlotlyChart
          data={radarData}
          layout={{
            polar: {
              radialaxis: { visible: true, range: [0, 10] }
            },
            showlegend: false
          }}
          style={{ width: '100%', height: '380px' }}
        />
      </div>

      {/* Per-Question Score Cards */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-sky-500" />
          Per-Question Score Cards & Feedback Breakdown
        </h3>

        {feedbacks.length > 0 ? (
          feedbacks.map((item, idx) => (
            <ScoreCard
              key={idx}
              score={item.feedback}
              questionText={item.questionText}
              questionOrder={item.questionOrder}
            />
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-white dark:bg-slate-800 rounded-xl border">
            No detailed question evaluations recorded for this session.
          </div>
        )}
      </div>

    </div>
  );
};
