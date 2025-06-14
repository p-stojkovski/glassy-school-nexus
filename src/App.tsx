
import React from 'react';
import { Provider } from 'react-redux';
import { useAppSelector } from '@/store/hooks';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from './store';
import { RootState } from './store';
import LoginForm from '@/domains/auth/components/LoginForm';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ClassroomManagement from './pages/ClassroomManagement';
import StudentManagement from './pages/StudentManagement';
import ClassManagement from './pages/ClassManagement';
import ClassForm from './pages/ClassForm';
import Teachers from './pages/Teachers';
import Scheduling from './pages/Scheduling';
import ScheduleForm from './pages/ScheduleForm';
import AttendanceManagement from './pages/AttendanceManagement';
import GradesManagement from './pages/GradesManagement';
import FinancialManagement from './pages/FinancialManagement';
import StudentProfile from './pages/StudentProfile';
import NotFound from "./pages/NotFound";

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
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/classrooms" element={<ClassroomManagement />} />        <Route path="/students" element={<StudentManagement />} />
        <Route path="/students/:studentId" element={<StudentProfile />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/classes/new" element={<ClassForm />} />
        <Route path="/classes/edit/:id" element={<ClassForm />} />
        <Route path="/teachers" element={<Teachers />} />        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/scheduling/new" element={<ScheduleForm />} />        <Route path="/scheduling/edit/:id" element={<ScheduleForm />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/grades" element={<GradesManagement />} />
        <Route path="/finance" element={<FinancialManagement />} />
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
          <Toaster />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Provider>
);

export default App;
