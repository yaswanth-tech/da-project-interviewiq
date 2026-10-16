import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Question } from '../types';
import { BookOpen, Plus, Search, Sparkles, Download, Trash2, Edit3, Check, X, RefreshCw } from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  
  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState<'technical' | 'hr'>('technical');
  const [role, setRole] = useState('Python Developer');
  const [category, setCategory] = useState('OOP');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState(120);
  const [modelAnswer, setModelAnswer] = useState('');
  const [keywords, setKeywords] = useState<{ keyword: string; weight: number; synonyms: string[] }[]>([]);

  const [extractingKeywords, setExtractingKeywords] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [roleFilter, categoryFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get('/questions', { params });
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!modelAnswer.trim()) return;
    setExtractingKeywords(true);
    try {
      const res = await api.post('/questions/extract-keywords', { model_answer: modelAnswer });
      setKeywords(res.data.keywords);
    } catch (err) {
      console.error('Failed to extract keywords via spaCy:', err);
    } finally {
      setExtractingKeywords(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      text,
      question_type: questionType,
      role,
      category,
      difficulty,
      time_limit_seconds: timeLimit,
      model_answer: modelAnswer,
      keywords
    };

    try {
      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      console.error('Failed to save question:', err);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        console.error('Failed to delete question:', err);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/questions/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'question_bank_export.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setText('');
    setQuestionType('technical');
    setRole('Python Developer');
    setCategory('OOP');
    setDifficulty('medium');
    setTimeLimit(120);
    setModelAnswer('');
    setKeywords([]);
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Question Bank Management
          </h1>
          <p className="text-xs text-slate-500">Manage technical and HR interview questions, model answers, and spaCy weighted keywords.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search questions or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold outline-none"
        >
          <option value="">All Roles</option>
          <option value="Python Developer">Python Developer</option>
          <option value="Data Analyst">Data Analyst</option>
          <option value="Java Developer">Java Developer</option>
          <option value="Web Developer">Web Developer</option>
          <option value="HR General">HR General</option>
        </select>
      </div>

      {/* Questions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-purple-600 font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading Questions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 font-bold">ID</th>
                  <th className="py-2.5 font-bold">Question Text</th>
                  <th className="py-2.5 font-bold">Role & Category</th>
                  <th className="py-2.5 font-bold">Difficulty</th>
                  <th className="py-2.5 font-bold">Time Limit</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 font-mono font-bold text-slate-400">#{q.id}</td>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 max-w-md">{q.text}</td>
                    <td className="py-3">
                      <span className="block font-bold text-purple-600 dark:text-purple-400">{q.role}</span>
                      <span className="text-[10px] text-slate-500">{q.category}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : q.difficulty === 'medium'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{q.time_limit_seconds}s</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Question</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Explain Python generator functions and yield keyword..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  >
                    <option value="Python Developer">Python Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Java Developer">Java Developer</option>
                    <option value="Web Developer">Web Developer</option>
                    <option value="HR General">HR General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Topic Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. OOP, SQL, Behavioral"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  >
                    <option value="technical">Technical</option>
                    <option value="hr">HR Behavioral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Time Limit (Sec)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Model Benchmark Answer</label>
                  <button
                    type="button"
                    onClick={handleGenerateKeywords}
                    disabled={extractingKeywords || !modelAnswer.trim()}
                    className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <Sparkles className="w-3 h-3 text-sky-500" />
                    Auto-Generate spaCy Keywords
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={modelAnswer}
                  onChange={(e) => setModelAnswer(e.target.value)}
                  placeholder="Comprehensive reference benchmark answer..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                />
              </div>

              {/* Keywords display */}
              {keywords.length > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  <span className="font-bold text-slate-600">Extracted Key Terms ({keywords.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {kw.keyword} (weight: {kw.weight})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all"
              >
                Save Question to Bank
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
