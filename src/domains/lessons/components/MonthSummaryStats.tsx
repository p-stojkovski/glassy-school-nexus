import React, { useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LessonResponse } from '@/types/api/lesson';

interface MonthSummaryStatsProps {
  lessons: LessonResponse[];
  currentMonth: Date;
  className?: string;
}

/**
 * Displays month-level statistics for lessons in a compact header format.
 * Shows scheduled, conducted, cancelled counts and completion percentage.
 */
const MonthSummaryStats: React.FC<MonthSummaryStatsProps> = ({
  lessons,
  currentMonth,
  className = '',
}) => {
  const stats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Filter lessons for the current month
    const monthLessons = lessons.filter(lesson => {
      const lessonDate = new Date(lesson.scheduledDate);
      return lessonDate.getFullYear() === year && lessonDate.getMonth() === month;
    });

    const scheduled = monthLessons.filter(l => l.statusName === 'Scheduled').length;
    const conducted = monthLessons.filter(l => l.statusName === 'Conducted').length;
    const cancelled = monthLessons.filter(l => l.statusName === 'Cancelled').length;
    const makeup = monthLessons.filter(l => l.statusName === 'Make Up').length;
    const noShow = monthLessons.filter(l => l.statusName === 'No Show').length;
    const total = monthLessons.length;
    
    // Completion rate = (conducted + makeup) / (total - cancelled) * 100
    // Only count lessons that were meant to happen
    const attemptedLessons = total - cancelled;
    const completedLessons = conducted + makeup;
    const completionRate = attemptedLessons > 0 
      ? Math.round((completedLessons / attemptedLessons) * 100)
      : 0;
    
    // Past lessons that should be conducted but aren't
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastScheduled = monthLessons.filter(l => {
      const lessonDate = new Date(l.scheduledDate);
      lessonDate.setHours(0, 0, 0, 0);
      return l.statusName === 'Scheduled' && lessonDate < today;
    }).length;

    return {
      total,
      scheduled,
      conducted,
      cancelled,
      makeup,
      noShow,
      completionRate,
      pastScheduled,
    };
  }, [lessons, currentMonth]);

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Total lessons */}
      <div className="flex items-center gap-1.5 text-white/80">
        <Calendar className="w-4 h-4 text-white/60" />
        <span className="font-semibold">{stats.total}</span>
        <span className="text-white/60 text-sm">lessons</span>
      </div>

      <div className="h-4 w-px bg-white/20" />

      {/* Status breakdown */}
      <div className="flex items-center gap-2">
        {stats.scheduled > 0 && (
          <Badge 
            variant="outline" 
            className="bg-blue-500/10 text-blue-300 border-blue-400/30 text-xs px-2 py-0.5"
          >
            <Clock className="w-3 h-3 mr-1" />
            {stats.scheduled} scheduled
          </Badge>
        )}
        
        {stats.conducted > 0 && (
          <Badge 
            variant="outline" 
            className="bg-green-500/10 text-green-300 border-green-400/30 text-xs px-2 py-0.5"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            {stats.conducted} done
          </Badge>
        )}
        
        {stats.cancelled > 0 && (
          <Badge 
            variant="outline" 
            className="bg-red-500/10 text-red-300 border-red-400/30 text-xs px-2 py-0.5"
          >
            <XCircle className="w-3 h-3 mr-1" />
            {stats.cancelled} cancelled
          </Badge>
        )}
      </div>

      <div className="h-4 w-px bg-white/20" />

      {/* Completion rate */}
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          stats.completionRate >= 80 
            ? 'bg-green-500/20 text-green-300' 
            : stats.completionRate >= 50 
              ? 'bg-yellow-500/20 text-yellow-300'
              : 'bg-red-500/20 text-red-300'
        }`}>
          <Percent className="w-3 h-3" />
          {stats.completionRate}% complete
        </div>
      </div>

      {/* Warning for past unattended lessons */}
      {stats.pastScheduled > 0 && (
        <>
          <div className="h-4 w-px bg-white/20" />
          <Badge 
            variant="outline" 
            className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-xs px-2 py-0.5 animate-pulse"
          >
            ⚠️ {stats.pastScheduled} need attention
          </Badge>
        </>
      )}
    </div>
  );
};

export default React.memo(MonthSummaryStats);
