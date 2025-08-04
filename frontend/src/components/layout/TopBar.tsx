import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Plus } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import GlassCard from '../common/GlassCard';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const TopBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications } = useAppSelector((state: RootState) => state.ui);
  const location = useLocation();
  const unreadCount = notifications.length;

  const isDashboard = location.pathname === '/';

  return (
    <div className="p-6 pb-0">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {isDashboard && (
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search students, classes, teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TopBar;
