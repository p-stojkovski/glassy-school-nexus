import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import Sidebar from './Sidebar';
import { ToastProvider } from '@/components/common/ToastProvider';
import { cn } from '../../lib/utils';

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
            <main
              className={cn(
                'flex-1 overflow-auto glass-scrollbar',
                isDashboard ? 'p-6' : 'p-6 pt-6'
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AppLayout;

