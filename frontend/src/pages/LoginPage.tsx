import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Brain, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { 
        email: loginEmail.trim(), 
        password: loginPass.trim() 
      });
      login(res.data.access_token, res.data.user);
      
      if (res.data.user.role === 'trainer') {
        navigate('/trainer');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handle1ClickStudent = () => {
    setEmail('student1@interviewiq.ai');
    setPassword('Student@123');
    executeLogin('student1@interviewiq.ai', 'Student@123');
  };

  const handle1ClickTrainer = () => {
    setEmail('trainer@interviewiq.ai');
    setPassword('Trainer@123');
    executeLogin('trainer@interviewiq.ai', 'Trainer@123');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in to InterviewIQ</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose instant 1-click demo access or sign in with your credentials
          </p>
        </div>

        {/* 1-Click Instant Demo Access Box */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Logins (1-Click)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={handle1ClickStudent}
              className="p-2.5 text-left rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all flex flex-col justify-between group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-300">
                <span>Student Login</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">student1@interviewiq.ai</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-1">Pass: Student@123</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handle1ClickTrainer}
              className="p-2.5 text-left rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all flex flex-col justify-between group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>Trainer Login</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">trainer@interviewiq.ai</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-1">Pass: Trainer@123</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="student1@interviewiq.ai"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Student@123"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-sky-600 dark:text-sky-400 hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};
