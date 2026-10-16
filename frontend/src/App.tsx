import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InterviewRoom } from './pages/InterviewRoom';
import { ReportPage } from './pages/ReportPage';
import { TrainerDashboard } from './pages/TrainerDashboard';
import { QuestionBankPage } from './pages/QuestionBankPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'student' | 'trainer' }> = ({
  children,
  allowedRole,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-sky-600">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'trainer' ? '/trainer' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/:sessionId"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <InterviewRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:sessionId"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <ReportPage />
                    </ProtectedRoute>
                  }
                />

                {/* Trainer Routes */}
                <Route
                  path="/trainer"
                  element={
                    <ProtectedRoute allowedRole="trainer">
                      <TrainerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer/questions"
                  element={
                    <ProtectedRoute allowedRole="trainer">
                      <QuestionBankPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
