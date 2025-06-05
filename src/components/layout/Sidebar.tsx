
import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Building,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  DollarSign,
  Settings,
  ChevronLeft,
  LogOut,
  CalendarDays,
} from 'lucide-react';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import GlassCard from '../common/GlassCard';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Building, label: 'Classroom', path: '/classrooms' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: BookOpen, label: 'Classes', path: '/classes' },
  { icon: GraduationCap, label: 'Teachers', path: '/teachers' },
  { icon: CalendarDays, label: 'Scheduling', path: '/scheduling' },
  { icon: Calendar, label: 'Attendance', path: '/attendance' },
  { icon: DollarSign, label: 'Finance', path: '/finance' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <motion.div
      className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
    >
      <GlassCard className="h-full rounded-none rounded-r-2xl p-4">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/0a12f78e-1752-49f8-8f2d-a8b7c70871ab.png" 
                    alt="Think English" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white font-semibold text-lg">Think English</span>
              </motion.div>
            )}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-yellow-400/20 text-yellow-300 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-white/10 pt-4">
            {!sidebarCollapsed && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3 p-3 rounded-xl mb-2"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-white/60 text-sm capitalize">{user.role}</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Sidebar;
