import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { LessonResponse, LessonStatusName } from '@/types/api/lesson';
import LessonStatusBadge from './LessonStatusBadge';
import DailyLessonListModal from './modals/DailyLessonListModal';

interface LessonCalendarProps {
  lessons: LessonResponse[];
  loading?: boolean;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onLessonClick?: (lesson: LessonResponse) => void;
  showWeekends?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  lessons: LessonResponse[];
}

const LessonCalendar: React.FC<LessonCalendarProps> = ({
  lessons,
  loading = false,
  selectedDate,
  onDateSelect,
  onLessonClick,
  showWeekends = true,
  compact = false,
  emptyMessage = "No lessons scheduled",
  emptyDescription = "There are no lessons scheduled for this month.",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyLessonModal, setDailyLessonModal] = useState<{
    open: boolean;
    date: Date | null;
    lessons: LessonResponse[];
  }>({ open: false, date: null, lessons: [] });
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar calculation
  const { calendarDays, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    // Get first day of month and calculate start of calendar
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    // Generate 42 days (6 weeks)
    const calendarDays: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Get lessons for this date
      const dayLessons = lessons.filter(lesson => {
        const lessonDate = new Date(lesson.scheduledDate);
        lessonDate.setHours(0, 0, 0, 0);
        return lessonDate.getTime() === date.getTime();
      });

      calendarDays.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? 
          date.getTime() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime() : 
          false,
        lessons: dayLessons,
      });
    }
    
    return { calendarDays, monthName, year };
  }, [currentDate, lessons, selectedDate]);

  // Filter calendar days for weekends if needed
  const displayDays = showWeekends ? calendarDays : calendarDays.filter((_, index) => {
    const dayOfWeek = index % 7;
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Remove Sunday (0) and Saturday (6)
  });

  const weekDays = showWeekends 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Get status color for calendar day
  const getDayStatusColor = (lessons: LessonResponse[]) => {
    if (lessons.length === 0) return '';
    
    const hasScheduled = lessons.some(l => l.statusName === 'Scheduled');
    const hasConducted = lessons.some(l => l.statusName === 'Conducted');
    const hasCancelled = lessons.some(l => l.statusName === 'Cancelled');
    const hasMakeup = lessons.some(l => l.statusName === 'Make Up');
    const hasNoShow = lessons.some(l => l.statusName === 'No Show');
    
    // Priority order: Scheduled > Makeup > Conducted > Cancelled > No Show
    if (hasScheduled) return 'border-blue-400 bg-blue-400/10';
    if (hasMakeup) return 'border-purple-400 bg-purple-400/10';
    if (hasConducted) return 'border-green-400 bg-green-400/10';
    if (hasCancelled) return 'border-red-400 bg-red-400/10';
    if (hasNoShow) return 'border-gray-400 bg-gray-400/10';
    
    return '';
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    onDateSelect?.(day.date);
    
    if (day.lessons.length === 0) {
      return; // No lessons to show
    }
    
    if (day.lessons.length === 1 && onLessonClick) {
      // Single lesson - open directly
      onLessonClick(day.lessons[0]);
    } else if (day.lessons.length > 1) {
      // Multiple lessons - show modal
      setDailyLessonModal({
        open: true,
        date: day.date,
        lessons: day.lessons
      });
    }
  };

  // Render lesson indicators for a day
  const renderLessonIndicators = (lessons: LessonResponse[]) => {
    if (lessons.length === 0) return null;
    
    if (compact) {
      // In compact mode, show a small dot for each lesson
      return (
        <div className="flex gap-1 mt-1 justify-center">
          {lessons.slice(0, 3).map((lesson, index) => (
            <div
              key={lesson.id}
              className={`w-1.5 h-1.5 rounded-full ${
                lesson.statusName === 'Scheduled' ? 'bg-blue-400' :
                lesson.statusName === 'Conducted' ? 'bg-green-400' :
                lesson.statusName === 'Cancelled' ? 'bg-red-400' :
                lesson.statusName === 'Make Up' ? 'bg-purple-400' :
                'bg-gray-400'
              }`}
            />
          ))}
          {lessons.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          )}
        </div>
      );
    } else {
      // In full mode, show lesson details
      return (
        <div className="mt-1 space-y-1">
          {lessons.slice(0, 2).map((lesson) => (
            <div
              key={lesson.id}
              className="text-xs p-1 rounded bg-white/5 border-l-2 border-blue-400 truncate"
              onClick={(e) => {
                e.stopPropagation();
                onLessonClick?.(lesson);
              }}
            >
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{lesson.startTime}</span>
                <LessonStatusBadge status={lesson.statusName} size="xs" />
              </div>
            </div>
          ))}
          {lessons.length > 2 && (
            <div className="text-xs text-white/60 text-center">
              +{lessons.length - 2} more
            </div>
          )}
        </div>
      );
    }
  };

  // Handle lesson click from modal
  const handleModalLessonClick = (lesson: LessonResponse) => {
    onLessonClick?.(lesson);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white">
            {monthName} {year}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

            {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/10" />
          <span className="text-white/70">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-yellow-400 bg-yellow-400/10" />
          <span className="text-white/70">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-blue-400 bg-blue-400/10" />
          <span className="text-white/70">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-green-400 bg-green-400/10" />
          <span className="text-white/70">Conducted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-red-400 bg-red-400/10" />
          <span className="text-white/70">Cancelled</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <GlassCard className="p-4">
        <div className={`grid gap-2 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-white/60 p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {displayDays.map((day, index) => {
            const statusColor = getDayStatusColor(day.lessons);
            const isWeekend = !showWeekends ? false : (index % 7 === 0 || index % 7 === 6);
            
            return (
              <motion.div
                key={day.date.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  relative min-h-[${compact ? '60px' : '100px'}] p-2 rounded-lg cursor-pointer transition-all duration-200
                  border border-transparent hover:border-white/20 hover:bg-white/5
                  ${day.isSelected ? 'border-yellow-400 bg-yellow-400/10' : ''}
                  ${day.isToday ? 'border-2 border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-500/25' : ''}
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                  ${isWeekend ? 'bg-white/5' : ''}
                  ${statusColor}
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-medium
                    ${day.isToday ? 'text-blue-300 font-bold' : ''}
                    ${day.isSelected ? 'text-yellow-400' : ''}
                    ${!day.isCurrentMonth ? 'text-white/40' : 'text-white'}
                  `}>
                    {day.date.getDate()}
                  </span>
                  
                  {day.lessons.length > 0 && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {day.lessons.length}
                    </Badge>
                  )}
                </div>
                
                {renderLessonIndicators(day.lessons)}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Empty state for no lessons in current month */}
      {lessons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <GlassCard className="p-8">
            <CalendarIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              {emptyMessage}
            </h4>
            <p className="text-white/60 text-sm">
              {emptyDescription}
            </p>
          </GlassCard>
        </motion.div>
      )}
      
      {/* Daily Lesson List Modal */}
      <DailyLessonListModal
        open={dailyLessonModal.open}
        onOpenChange={(open) => 
          setDailyLessonModal(prev => ({ ...prev, open }))
        }
        date={dailyLessonModal.date}
        lessons={dailyLessonModal.lessons}
        onLessonClick={handleModalLessonClick}
      />
    </div>
  );
};

export default LessonCalendar;
