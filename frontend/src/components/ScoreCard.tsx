import React from 'react';
import { FeedbackScore } from '../types';
import { CheckCircle2, XCircle, Sparkles, Lightbulb, MessageSquare, Award, Clock } from 'lucide-react';

interface ScoreCardProps {
  score: FeedbackScore;
  questionText: string;
  questionOrder: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, questionText, questionOrder }) => {
  const getScoreColor = (val: number) => {
    if (val >= 8.0) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (val >= 6.0) return 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
    return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
            Question #{questionOrder}
          </span>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            {questionText}
          </h3>
        </div>
        
        <div className={`px-4 py-2 rounded-xl border flex flex-col items-center shrink-0 ${getScoreColor(score.total_score)}`}>
          <span className="text-2xl font-black">{score.total_score}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Overall Score</span>
        </div>
      </div>

      {/* Component Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="block text-xs font-medium text-slate-500">Keyword Coverage</span>
          <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{score.keyword_score} / 10</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="block text-xs font-medium text-slate-500">Semantic Fit</span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{score.semantic_score} / 10</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="block text-xs font-medium text-slate-500">Completeness</span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{score.completeness_score} / 10</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="block text-xs font-medium text-slate-500">
            {score.star_score !== null && score.star_score !== undefined ? 'STAR Method' : 'Delivery Pace'}
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {score.star_score !== null && score.star_score !== undefined ? `${score.star_score} / 10` : `${score.delivery_score} / 10`}
          </span>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Keywords */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Matched Key Concepts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {score.matched_keywords && score.matched_keywords.length > 0 ? (
              score.matched_keywords.map((kw, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No key concepts matched.</span>
            )}
          </div>
        </div>

        {/* Missed Keywords */}
        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">
            <XCircle className="w-4 h-4" />
            Missed Concepts to Include
          </div>
          <div className="flex flex-wrap gap-1.5">
            {score.missed_keywords && score.missed_keywords.length > 0 ? (
              score.missed_keywords.map((kw, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs font-medium bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All target keywords covered!</span>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Key Strengths
          </span>
          <ul className="space-y-1.5">
            {score.strengths.map((str, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-4 h-4 text-sky-500" />
            Actionable Improvement Suggestions
          </span>
          <ul className="space-y-1.5">
            {score.suggestions.map((sug, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                <span className="text-sky-500 font-bold">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model Answer Comparison */}
      {score.model_comparison && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-4 h-4" />
            Reference Model Answer Benchmark
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{score.model_comparison}"
          </p>
        </div>
      )}

      {/* Delivery Metrics Details (WPM & Fillers) */}
      {score.delivery_metrics && (
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pace: {score.delivery_metrics.wpm} WPM ({score.delivery_metrics.pause_estimate})
          </span>
          <span>•</span>
          <span>Fillers: {score.delivery_metrics.filler_count} count</span>
        </div>
      )}

    </div>
  );
};
