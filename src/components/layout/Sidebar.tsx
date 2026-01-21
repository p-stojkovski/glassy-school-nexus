import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronDown,
  UserCheck,
  ClipboardCheck,
  User,
  LucideIcon,
} from 'lucide-react';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import LogoutMenu from '@/domains/auth/components/LogoutMenu';
import GlassCard from '../common/GlassCard';
import { cn } from '../../lib/utils';
import styles from './Sidebar.module.scss';
import { prefetchRoute } from '@/hooks/usePrefetchRoute';

// Types for navigation structure
interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

type NavigationEntry = NavItem | NavGroup;

// Type guard to check if entry is a group
const isNavGroup = (entry: NavigationEntry): entry is NavGroup => {
  return 'items' in entry;
};

// Grouped navigation structure
const navigationConfig: NavigationEntry[] = [
  // Dashboard - standalone at top
  { icon: Home, label: 'Dashboard', path: '/' },
  
  // People group
  {
    id: 'people',
    label: 'People',
    icon: Users,
    items: [
      { icon: Users, label: 'Students', path: '/students' },
      { icon: GraduationCap, label: 'Teachers', path: '/teachers' },
    ],
  },
  
  // Teaching group
  {
    id: 'teaching',
    label: 'Teaching',
    icon: BookOpen,
    items: [
      { icon: BookOpen, label: 'Classes', path: '/classes' },
      { icon: UserCheck, label: 'Private Lessons', path: '/private-lessons' },
    ],
  },
  
  // Progress group
  {
    id: 'progress',
    label: 'Progress',
    icon: ClipboardCheck,
    items: [
      { icon: Calendar, label: 'Attendance', path: '/attendance' },
      { icon: GraduationCap, label: 'Grades', path: '/grades' },
    ],
  },
  
  // Finance - standalone
  { icon: DollarSign, label: 'Finance', path: '/finance' },
  
  // Settings - standalone at bottom
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed } = useAppSelector((state: RootState) => state.ui);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Initialize with groups that contain the current route
    const initialExpanded = new Set<string>();
    navigationConfig.forEach(entry => {
      if (isNavGroup(entry)) {
        const hasActiveItem = entry.items.some(item => location.pathname === item.path);
        if (hasActiveItem) {
          initialExpanded.add(entry.id);
        }
      }
    });
    return initialExpanded;
  });
  
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Check if a path is active (for highlighting)
  const isPathActive = (path: string) => location.pathname === path;
  
  // Check if a group has any active items
  const hasActiveGroupItem = (group: NavGroup) => 
    group.items.some(item => isPathActive(item.path));

  // Render a single navigation item
  const renderNavItem = (item: NavItem, isNested = false) => {
    const isActive = isPathActive(item.path);
    return (
      <motion.button
        key={item.path}
        onClick={() => navigate(item.path)}
        onMouseEnter={() => prefetchRoute(item.path)}
        className={cn(
          styles.menuItem,
          isNested && styles.menuItemNested,
          isActive ? styles.menuActive : styles.menuInactive
        )}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.97 }}
        tabIndex={0}
        role="menuitem"
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        {!sidebarCollapsed && (
          <span className="truncate">{item.label}</span>
        )}
      </motion.button>
    );
  };

  // Render a collapsible navigation group
  const renderNavGroup = (group: NavGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasActive = hasActiveGroupItem(group);
    
    return (
      <div key={group.id} className={styles.navGroup} role="group" aria-label={group.label}>
        <button
          onClick={() => toggleGroup(group.id)}
          className={cn(
            styles.groupHeader,
            hasActive && styles.groupHeaderActive
          )}
          aria-expanded={isExpanded}
          aria-controls={`nav-group-${group.id}`}
          tabIndex={0}
        >
          <div className="flex items-center space-x-3">
            <group.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {!sidebarCollapsed && (
              <span className={styles.groupLabel}>{group.label}</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <ChevronDown 
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
          )}
        </button>
        
        <AnimatePresence initial={false}>
          {(isExpanded || sidebarCollapsed) && (
            <motion.div
              id={`nav-group-${group.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(styles.groupItems, sidebarCollapsed && 'hidden')}
              role="menu"
            >
              {group.items.map(item => renderNavItem(item, true))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show items in tooltip-like popup when collapsed */}
        {sidebarCollapsed && (
          <div className={styles.collapsedGroupItems}>
            {group.items.map(item => renderNavItem(item, true))}
          </div>
        )}
      </div>
    );
  };

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
                <span className="text-white/90 font-semibold text-lg">
                  Think English
                </span>
              </motion.div>
            )}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className={styles.collapseButton}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className={styles.nav} role="navigation" aria-label="Main navigation">
            <div className={cn("overflow-y-auto flex-1 space-y-1 glass-scrollbar")}>
              {navigationConfig.map(entry => 
                isNavGroup(entry) 
                  ? renderNavGroup(entry) 
                  : renderNavItem(entry)
              )}
            </div>
          </nav>

          {/* Compact User Profile */}
          <div className={styles.userSection}>
            <div className={styles.compactUserRow}>
              {/* Avatar */}
              <div className={styles.userAvatar} aria-hidden="true">
                <User className="w-4 h-4" />
              </div>
              
              {/* User info - only when expanded */}
              {!sidebarCollapsed && user && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {`${user.firstName} ${user.lastName}`.trim()}
                  </span>
                  <span className={styles.userRole}>
                    {user.role}
                  </span>
                </div>
              )}
              
              {/* Logout button */}
              <LogoutMenu
                collapsed={sidebarCollapsed}
                size="sm"
                className={styles.logoutButton}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Sidebar;

