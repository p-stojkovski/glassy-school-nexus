import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ToastProvider } from '@/components/common/ToastProvider';
import { Toaster } from '@/components/ui/sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useAppSelector((state: RootState) => state.ui);
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-800 to-green-700">
        <div className="flex h-screen">
          <Sidebar />
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
          >
            {isDashboard && <TopBar />}
            <main
              className={`flex-1 overflow-auto ${isDashboard ? 'p-6' : 'p-6 pt-6'}`}
            >
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </div>
    </ToastProvider>
  );
};

export default AppLayout;
