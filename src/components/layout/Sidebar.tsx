import React from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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
  GraduationCap as Grades,
  UserCheck,
} from 'lucide-react';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import LogoutMenu from '@/domains/auth/components/LogoutMenu';
import GlassCard from '../common/GlassCard';
import { cn } from '../../lib/utils';
import styles from './Sidebar.module.scss';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: BookOpen, label: 'Classes', path: '/classes' },
  { icon: GraduationCap, label: 'Teachers', path: '/teachers' },
  { icon: UserCheck, label: 'Private Lessons', path: '/private-lessons' },
  { icon: Calendar, label: 'Attendance', path: '/attendance' },
  { icon: Grades, label: 'Grades', path: '/grades' },
  { icon: DollarSign, label: 'Finance', path: '/finance' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed } = useAppSelector((state: RootState) => state.ui);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      className={cn(
        styles.sidebar,
        sidebarCollapsed ? styles.collapsedWidth : styles.expandedWidth
      )}
      initial={false}
    >
      <GlassCard className={styles.glassContainer}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={styles.header}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.logo}
              >
                <div className={styles.logoImage}>
                  <img
                    src="/lovable-uploads/0a12f78e-1752-49f8-8f2d-a8b7c70871ab.png"
                    alt="Think English"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white font-semibold text-lg">
                  Think English
                </span>
              </motion.div>
            )}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className={styles.collapseButton}
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            <div className={cn("overflow-y-auto flex-1 space-y-2 glass-scrollbar")}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      styles.menuItem,
                      isActive ? styles.menuActive : styles.menuInactive
                    )}
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
            </div>
          </nav>

          {/* User Profile */}
          <div className={styles.userSection}>
            {!sidebarCollapsed && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.profile}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {`${user.firstName} ${user.lastName}`.trim()}
                  </p>
                  <p className="text-white/60 text-sm capitalize">
                    {user.role}
                  </p>
                </div>
              </motion.div>
            )}
            <div className="w-full">
              <LogoutMenu
                collapsed={sidebarCollapsed}
                size="default"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Sidebar;
