import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Brain, Sun, Moon, LogOut, User as UserIcon, ShieldCheck, BarChart3, BookOpen, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isInterviewRoom = location.pathname.startsWith('/interview/');

  if (isInterviewRoom) {
    return null; // Render distraction-free bar inside InterviewRoom page itself
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
          <Brain className="w-8 h-8 text-sky-500" />
          <span>Interview<span className="font-extrabold text-indigo-500">IQ</span></span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            Team Data Hunters
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {user && user.role === 'student' && (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/dashboard?action=start" className="flex items-center gap-1.5 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline">
                <Play className="w-4 h-4" />
                Start Mock Interview
              </Link>
            </>
          )}

          {user && user.role === 'trainer' && (
            <>
              <Link to="/trainer" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Cohort Analytics
              </Link>
              <Link to="/trainer/questions" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                <BookOpen className="w-4 h-4" />
                Question Bank
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.full_name}</span>
                <span className="text-xs text-sky-600 dark:text-sky-400 font-medium capitalize flex items-center justify-end gap-1">
                  {user.role === 'trainer' && <ShieldCheck className="w-3 h-3 inline" />}
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
