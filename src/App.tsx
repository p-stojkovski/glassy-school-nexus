import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { RootState } from './store';
import { DataProvider } from '@/app/providers/DataProvider';
import { getCurrentUserAsync } from '@/domains/auth/authSlice';
import LoginForm from '@/domains/auth/components/LoginForm';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ClassroomManagement from './pages/ClassroomManagement';
import StudentManagement from './pages/StudentManagement';
import ClassManagement from './pages/ClassManagement';
import ClassForm from './pages/ClassForm';
import Teachers from './pages/Teachers';
import AttendanceManagement from './pages/AttendanceManagement';
import GradesManagement from './pages/GradesManagement';
import FinancialManagement from './pages/FinancialManagement';
import PrivateLessons from './pages/PrivateLessons';
import PrivateLessonDetailPage from './domains/privateLessons/components/PrivateLessonDetailPage';
import StudentProfilePage from './domains/students/components/profile/StudentProfilePage';
import StudentFormPage from './pages/StudentFormPage';
import NotFound from './pages/NotFound';

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
    // Check if we have tokens stored and validate them
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken && !isAuthenticated) {
      // Try to get current user to validate the token
      dispatch(getCurrentUserAsync());
    }
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
      <Routes>
        <Route path="/" element={<Dashboard />} />{' '}
        <Route path="/classrooms" element={<ClassroomManagement />} />{' '}
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/students/new" element={<StudentFormPage />} />
        <Route path="/students/edit/:studentId" element={<StudentFormPage />} />
        <Route path="/students/:studentId" element={<StudentProfilePage />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/classes/new" element={<ClassForm />} />
        <Route path="/classes/edit/:id" element={<ClassForm />} />
        <Route path="/teachers" element={<Teachers />} />{' '}
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/grades" element={<GradesManagement />} />
        <Route path="/finance" element={<FinancialManagement />} />
        <Route path="/private-lessons" element={<PrivateLessons />} />
        <Route
          path="/private-lessons/:lessonId"
          element={<PrivateLessonDetailPage />}
        />
        <Route path="/settings" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </DataProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Provider>
);

export default App;
