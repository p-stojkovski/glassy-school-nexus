
import React from 'react';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from './store';
import { RootState } from './store';
import LoginForm from './components/auth/LoginForm';
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/classrooms" element={<ClassroomManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/classes/new" element={<ClassForm />} />
        <Route path="/classes/edit/:id" element={<ClassForm />} />
        <Route path="/teachers" element={<Teachers />} />        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/scheduling/new" element={<ScheduleForm />} />
        <Route path="/scheduling/edit/:id" element={<ScheduleForm />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/finance" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
