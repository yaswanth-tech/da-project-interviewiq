import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  Clock, 
  Award, 
  Target, 
  HelpCircle, 
  BookOpen, 
  Users, 
  TrendingUp, 
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Can I answer interview questions by speaking out loud?",
      answer: "Yes, absolutely! You can click the voice button and speak naturally using your computer microphone. Your speech is converted to text in real time so you can review it before submitting. If you prefer typing, you can also type your answers directly."
    },
    {
      question: "How does the platform know what questions to ask me?",
      answer: "When you start an interview, you choose your target career path. As you answer, the system adjusts the question difficulty based on how well you are doing. If you are doing great, it gives you deeper questions. If you find something tricky, it helps you practice core fundamentals first."
    },
    {
      question: "What kind of feedback will I receive after an interview?",
      answer: "You receive an encouraging, detailed scorecard for every answer. It highlights the positive points you explained well, points out key ideas you might have missed, checks whether your answer was complete, and gives helpful tips on your speaking pace."
    },
    {
      question: "Can I practice again on topics I found difficult?",
      answer: "Yes! At the end of every interview report, you can click 'Retake Weak Areas'. This instantly creates a brand new practice session focusing specifically on the topics where you have the greatest opportunity to improve."
    },
    {
      question: "How does this platform help college placement trainers?",
      answer: "Trainers and placement cells can see overall performance summaries across the entire batch of students. They can easily see which subjects students find hardest, helping teachers organize targeted revision workshops before campus recruitment begins."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col space-y-20 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 text-xs font-semibold border border-sky-200 dark:border-sky-800 shadow-sm">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>Your 24/7 AI Placement Mentor & Mock Interview Partner</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Master Your Job Interviews with <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Calm Confidence</span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
          Preparing for campus placements and job interviews can feel stressful when you practice alone. InterviewIQ gives you a friendly, realistic practice room where you can answer real interview questions out loud or by typing, get kind and actionable feedback, and walk into your real interview ready to shine.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 text-base group"
          >
            Start Free Practice Interview
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all text-center text-base"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Reassurance Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to practice anytime
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Voice and typed answers supported
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Detailed, easy-to-read feedback
          </span>
        </div>
      </section>

      {/* 2. The Problem We Solve */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-100 to-sky-50 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Why Mock Interview Practice Matters
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Most students know their technical subjects well, but explaining concepts out loud to an interviewer under time pressure is a completely different skill. InterviewIQ bridges that gap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Overcome Interview Anxiety</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When you practice answering questions repeatedly in a calm, judgment-free environment, fear turns into muscle memory and natural confidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Learn What Interviewers Look For</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Instead of guessing how you did, see clear benchmarks of reference answers so you understand how to structure your thoughts effectively.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Target Your Weak Spots</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Don't waste time repeating what you already know. Get honest advice on specific topics where a quick revision will boost your scores.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works - Step-by-Step Walkthrough */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            How InterviewIQ Works for You
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            From picking your dream role to celebrating your progress, here is what your practice journey looks like.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 tracking-wider uppercase block">Step 1</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Choose Your Role</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Select your goal—such as Python Developer, Data Analyst, Java Engineer, Web Developer, or HR placement interviews.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase block">Step 2</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Answer Questions</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Enter the distraction-free interview room. A gentle countdown clock helps you practice pacing. Speak out loud or type comfortably.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase block">Step 3</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Get Instant Review</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Get an instant scorecard explaining what concepts you nailed, what you forgot, how deep your answer was, and advice on your speaking pace.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase block">Step 4</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Level Up Weak Areas</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Track your scores improving week after week on your personal dashboard, and click 'Retake Weak Areas' to master tough subjects.
            </p>
          </div>
        </div>
      </section>

      {/* 4. What We Look For in Your Answers */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Objective & Transparent Feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            What We Evaluate in Every Answer
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Every answer is assessed across multiple helpful dimensions so you always know where your strengths lie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Core Concept Coverage</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Did you mention the essential ideas, terms, and principles that interviewers expect for that question? We highlight which ones you included and which ones you missed.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Answer Completeness & Depth</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Is your response thoughtful and thorough, or was it too brief? We encourage you to explain the 'why' and 'how', not just a single sentence definition.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Speaking Pace & Delivery</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                When you speak, we check your words-per-minute pace to ensure you sound calm and clear. We also gently flag repetitive filler words like "um", "like", or "basically".
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">HR Storytelling (STAR Method)</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                For behavioral and HR questions, we look for the gold-standard story format: Situation, Task, Action, and Result, helping you share real achievements convincingly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Who Benefits from InterviewIQ */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Students and Placement Teams
          </h2>
          <p className="text-sm text-slate-400">
            A complete ecosystem designed to make campus recruitment preparation simple, transparent, and rewarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-sky-500/20 text-sky-400 font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">For Students & Job Aspirants</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Practice in private anytime without the embarrassment of being judged.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>See sample model answers written by industry mentors to learn better phrasing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Build a daily practice streak and export polished PDF progress reports.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-purple-500/20 text-purple-400 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">For Placement Officers & Trainers</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>View aggregated analytics showing the exact questions and topics where students struggle most.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Manage and expand the question bank with custom company-specific technical rounds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Review student leaderboards and export cohort reports for placement cell records.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="space-y-8 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Everything you need to know about preparing with InterviewIQ.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base hover:text-sky-600 dark:hover:text-sky-400"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-sky-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom Call To Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black">
            Ready to Walk Into Your Next Interview with Confidence?
          </h2>
          <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
            Practice makes progress. Start your first session today, discover your unique strengths, and take the first step toward landing your dream placement offer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white text-indigo-700 hover:bg-sky-50 shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Create Your Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-400/30 transition-all text-sm sm:text-base"
          >
            Sign In to Existing Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pb-8 space-y-1">
        <p>InterviewIQ — AI Mock Interview & Feedback Platform</p>
        <p className="text-slate-500">Codegnan Hackathon 2026 • Team Data Hunters</p>
      </footer>

    </div>
  );
};
