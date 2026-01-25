import React, { Suspense, useEffect } from 'react';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { Provider } from 'react-redux';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { unstable_HistoryRouter as HistoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { RootState } from './store';
import { DataProvider } from '@/app/providers/DataProvider';
import { getCurrentUserAsync, logout } from '@/domains/auth/authSlice';
import apiService from '@/services/api';
import RouteLoadingFallback from './components/common/RouteLoadingFallback';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import { appHistory } from '@/router/history';

// Keep static - small/critical components
import LoginForm from '@/domains/auth/components/LoginForm';
import AppLayout from './components/layout/AppLayout';
import NotFound from './pages/NotFound';

// Lazy-loaded page components
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const StudentManagement = lazyWithRetry(() => import('./pages/StudentManagement'));
const StudentPage = lazyWithRetry(() => import('./pages/StudentPage'));
const ClassesPage = lazyWithRetry(() => import('@/domains/classes/list-page').then(m => ({ default: m.ClassesPage })));
const ClassPage = lazyWithRetry(() => import('./pages/ClassPage'));
const ClassFormPage = lazyWithRetry(() => import('@/domains/classes/form-page').then(m => ({ default: m.ClassFormPage })));
const TeachingModePage = lazyWithRetry(() => import('@/domains/classes/detail-page/teaching').then(m => ({ default: m.TeachingModePage })));
const Teachers = lazyWithRetry(() => import('./pages/Teachers'));
const TeacherPage = lazyWithRetry(() => import('./pages/TeacherPage'));
const TeacherDashboard = lazyWithRetry(() => import('./pages/TeacherDashboard'));
const SalaryCalculationDetailPage = lazyWithRetry(() => import('@/domains/teachers/salary-calculation-detail-page').then(m => ({ default: m.SalaryCalculationDetailPage })));
const AttendanceManagement = lazyWithRetry(() => import('./pages/AttendanceManagement'));
const GradesManagement = lazyWithRetry(() => import('./pages/GradesManagement'));
const FinancialManagement = lazyWithRetry(() => import('./pages/FinancialManagement'));
const PrivateLessons = lazyWithRetry(() => import('./pages/PrivateLessons'));
const PrivateLessonDetailPage = lazyWithRetry(() => import('./domains/privateLessons/components/PrivateLessonDetailPage'));
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage'));
const AcademicYearDetailPage = lazyWithRetry(() =>
  import('@/domains/settings/academic-calendar/year-detail-page').then(m => ({
    default: m.AcademicYearDetailPage
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state: RootState) => {
    return state.auth;
  });

  // Check for existing authentication on app startup
  useEffect(() => {
    // Use centralized token check that supports sessionStorage and localStorage
    if (apiService.hasValidToken() && !isAuthenticated) {
      // Try to get current user to validate the token
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, isAuthenticated]);

  // Listen for auth state changes from API (e.g., token refresh failures)
  useEffect(() => {
    const unsubscribe = apiService.onAuthStateChange((authenticated: boolean) => {
      if (!authenticated && isAuthenticated) {
        // Auth failed, log user out
        dispatch(logout());
      }
    });
    return unsubscribe;
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <RouteErrorBoundary>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classrooms" element={<Navigate to="/settings" replace />} />
          <Route path="/students" element={<StudentManagement />} />
          {/* New unified student page handles both create and view/edit */}
          <Route path="/students/new" element={<StudentPage />} />
          {/* Legacy edit route - redirects to unified page with edit sheet */}
          <Route path="/students/edit/:studentId" element={<StudentPage />} />
          <Route path="/students/:studentId" element={<StudentPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          {/* New unified class page handles both create and view/edit */}
          <Route path="/classes/new" element={<ClassPage />} />
          {/* Legacy edit route - keep ClassFormPage for now for backward compatibility */}
          <Route path="/classes/edit/:classId" element={<ClassFormPage />} />
          <Route path="/classes/:id" element={<ClassPage />} />
          <Route path="/classes/:classId/teach/:lessonId" element={<TeachingModePage />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:teacherId/salary-calculations/:calculationId" element={<SalaryCalculationDetailPage />} />
          <Route path="/teachers/:teacherId" element={<TeacherPage />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/grades" element={<GradesManagement />} />
          <Route path="/finance" element={<FinancialManagement />} />
          <Route path="/private-lessons" element={<PrivateLessons />} />
          <Route
            path="/private-lessons/:lessonId"
            element={<PrivateLessonDetailPage />}
          />
          <Route
            path="/settings/academic-calendar/years/:yearId"
            element={<AcademicYearDetailPage />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </AppLayout>
  );
};

const App = () => (
  <Provider store={store}>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DataProvider>
            <Toaster />
            <HistoryRouter history={appHistory}>
              <AppContent />
            </HistoryRouter>
          </DataProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Provider>
);

export default App;

