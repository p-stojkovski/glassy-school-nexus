
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NotificationToast from './NotificationToast';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500">
      <div className="flex h-screen">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {isDashboard && <TopBar />}
          <main className={`flex-1 overflow-auto ${isDashboard ? 'p-6' : 'p-6 pt-6'}`}>
            {children}
          </main>
        </div>
      </div>
      <NotificationToast />
    </div>
  );
};

export default AppLayout;
