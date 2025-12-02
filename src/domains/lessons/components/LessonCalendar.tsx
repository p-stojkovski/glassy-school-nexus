/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Use LessonTimeline instead for a more optimized lesson display.
 * LessonCalendar is kept temporarily for backward compatibility.
 * Last used: ClassLessonsTab (replaced 2025-12-01)
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LessonResponse, LessonStatusName } from '@/types/api/lesson';
import DailyLessonsSheet from './sheets/DailyLessonsSheet';
import { useAcademicCalendar } from '../hooks/useAcademicCalendar';

interface LessonCalendarProps {
  lessons: LessonResponse[];
  loading?: boolean;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onLessonClick?: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onLessonsUpdated?: () => void;
  showWeekends?: boolean;
  compact?: boolean;
  /** Callback that provides the goToToday function to parent */
  onGoToTodayRef?: (goToToday: () => void) => void;
  /** Whether to show the built-in Today button in the calendar header */
  showTodayButton?: boolean;
  /** Callback when month changes, provides whether viewing current month */
  onMonthChange?: (isCurrentMonth: boolean) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  lessons: LessonResponse[];
  nonTeachingDay?: {
    type: 'teaching_break' | 'public_holiday' | 'vacation';
    name: string;
    // New: underlying break type to distinguish 'holiday' vs other breaks
    breakType?: 'holiday' | 'vacation' | 'exam_period' | string;
  };
}

const LessonCalendar: React.FC<LessonCalendarProps> = ({
  lessons,
  loading = false,
  selectedDate,
  onDateSelect,
  onLessonClick,
  onConductLesson,
  onCancelLesson,
  onLessonsUpdated,
  showWeekends = true,
  compact = false,
  onGoToTodayRef,
  showTodayButton = true,
  onMonthChange,
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

  const goToToday = React.useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Expose goToToday to parent component
  React.useEffect(() => {
    onGoToTodayRef?.(goToToday);
  }, [goToToday, onGoToTodayRef]);

  // Check if current view includes today
  const isViewingCurrentMonth = React.useMemo(() => {
    const today = new Date();
    return currentDate.getFullYear() === today.getFullYear() && 
           currentDate.getMonth() === today.getMonth();
  }, [currentDate]);

  // Notify parent when month changes
  React.useEffect(() => {
    onMonthChange?.(isViewingCurrentMonth);
  }, [isViewingCurrentMonth, onMonthChange]);

  // Get academic calendar data for the current month view
  // Extend the range to include a few days before and after to catch breaks that span months
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Extend range by 7 days before and after to catch cross-month breaks
  const extendedStart = new Date(monthStart);
  extendedStart.setDate(extendedStart.getDate() - 7);
  const extendedEnd = new Date(monthEnd);
  extendedEnd.setDate(extendedEnd.getDate() + 7);
  
  const { nonTeachingDays } = useAcademicCalendar(extendedStart, extendedEnd);
  
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

      // Check if this date is a non-teaching day
      const dateString = date.toISOString().split('T')[0];
      const nonTeachingDay = nonTeachingDays.find(ntd => ntd.date === dateString);

      calendarDays.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? 
          date.getTime() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime() : 
          false,
        lessons: dayLessons,
        nonTeachingDay: nonTeachingDay ? {
          type: nonTeachingDay.type,
          name: nonTeachingDay.name
        } : undefined,
      });
    }
    
    return { calendarDays, monthName, year };
  }, [currentDate, lessons, selectedDate, nonTeachingDays]);

  // Filter calendar days for weekends if needed
  const displayDays = showWeekends ? calendarDays : calendarDays.filter((_, index) => {
    const dayOfWeek = index % 7;
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Remove Sunday (0) and Saturday (6)
  });

  const weekDays = showWeekends 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Get status color for calendar day
  const getDayStatusColor = (lessons: LessonResponse[], nonTeachingDay?: CalendarDay['nonTeachingDay']) => {
    // Non-teaching days have priority in background styling
    if (nonTeachingDay) {
      // Prefer breakType when present; fall back to legacy 'type'
      const isHoliday = nonTeachingDay.breakType === 'holiday' || nonTeachingDay.type === 'public_holiday';
      if (isHoliday) {
        return 'bg-red-500/30 border-2 border-red-500/50 shadow-lg shadow-red-500/20';
      }
      if (nonTeachingDay.type === 'teaching_break') {
        return 'bg-orange-500/30 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20';
      }
    }
    
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
    
    // If it's a non-teaching day, show info about it
    if (day.nonTeachingDay) {
      const dayType = day.nonTeachingDay.type === 'public_holiday' ? 'Public Holiday' : 'Teaching Break';
      alert(`${dayType}: ${day.nonTeachingDay.name}\n\nNo lessons can be scheduled on this day.`);
      return;
    }
    
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

  // Get status color for lesson dot
  const getLessonDotColor = (status: LessonStatusName) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-400';
      case 'Conducted': return 'bg-green-400';
      case 'Cancelled': return 'bg-red-400';
      case 'Make Up': return 'bg-purple-400';
      case 'No Show': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Render lesson indicators for a day - Simplified: colored dot + time only
  const renderLessonIndicators = (lessons: LessonResponse[]) => {
    if (lessons.length === 0) return null;
    
    if (compact) {
      // In compact mode, show a small dot for each lesson
      return (
        <div className="flex gap-1 mt-1 justify-center">
          {lessons.slice(0, 3).map((lesson) => (
            <div
              key={lesson.id}
              className={`w-1.5 h-1.5 rounded-full ${getLessonDotColor(lesson.statusName)}`}
            />
          ))}
          {lessons.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          )}
        </div>
      );
    } else {
      // Simplified: colored dot + time only, no status text or icons
      return (
        <div className="mt-1 space-y-0.5">
          {lessons.slice(0, 3).map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-white/10 rounded px-1 py-0.5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onLessonClick?.(lesson);
              }}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getLessonDotColor(lesson.statusName)}`} />
              <span className="text-white/80 truncate">{lesson.startTime?.slice(0, 5)}</span>
            </div>
          ))}
          {lessons.length > 3 && (
            <div className="text-[10px] text-white/50 text-center pl-1">
              +{lessons.length - 3} more
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
      {/* Compact Calendar Header - Single row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">
            {monthName} {year}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousMonth}
              className="text-white/60 hover:text-white hover:bg-white/10 h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              className="text-white/60 hover:text-white hover:bg-white/10 h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {showTodayButton && (
            <Button
              variant={isViewingCurrentMonth ? "ghost" : "default"}
              size="sm"
              onClick={goToToday}
              className={`h-7 px-2 text-xs ${isViewingCurrentMonth 
                ? "text-white/60 hover:text-white hover:bg-white/10" 
                : "bg-blue-600 hover:bg-blue-700 text-white font-medium"
              }`}
            >
              Today
            </Button>
          )}
        </div>
        
        {/* Legend as compact tooltip */}
        {lessons.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white/70 h-7 px-2 gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span className="text-xs">Legend</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 border-white/10 p-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-white/80">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white/80">Conducted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-white/80">Cancelled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-white/80">Make Up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-white/80">Break</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Calendar Grid - Flatter styling */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
        <div className={`grid gap-1.5 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-white/50 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {displayDays.map((day, index) => {
            const statusColor = getDayStatusColor(day.lessons, day.nonTeachingDay);
            const isWeekend = !showWeekends ? false : (index % 7 === 0 || index % 7 === 6);
            
            return (
              <motion.div
                key={day.date.toISOString()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.005, duration: 0.15 }}
                className={`
                  relative min-h-[${compact ? '60px' : '80px'}] p-1.5 rounded-lg cursor-pointer transition-all duration-150
                  border border-transparent hover:border-white/20 hover:bg-white/5
                  ${day.isSelected ? 'border-yellow-400/50 bg-yellow-400/10' : ''}
                  ${day.isToday ? 'border border-blue-400/50 bg-blue-500/20' : ''}
                  ${!day.isCurrentMonth ? 'opacity-30' : ''}
                  ${isWeekend ? 'bg-white/[0.02]' : ''}
                  ${statusColor}
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <span className={`
                      text-xs font-medium
                      ${day.isToday ? 'text-blue-300 font-semibold' : ''}
                      ${day.isSelected ? 'text-yellow-400' : ''}
                      ${!day.isCurrentMonth ? 'text-white/40' : 'text-white/80'}
                    `}>
                      {day.date.getDate()}
                    </span>
                    {day.isToday && (
                      <span className="text-[9px] font-medium text-blue-300 bg-blue-500/20 px-1 py-0.5 rounded">
                        TODAY
                      </span>
                    )}
                  </div>
                  
                  {day.lessons.length > 0 && (
                    <span className="text-[10px] text-white/40 font-medium">
                      {day.lessons.length}
                    </span>
                  )}
                </div>
                
                {/* Non-teaching day indicator */}
                {day.nonTeachingDay && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    { (day.nonTeachingDay.breakType === 'holiday' || day.nonTeachingDay.type === 'public_holiday') ? (
                      <div className="text-red-400 font-bold text-xs opacity-80">
                        {day.nonTeachingDay.name}
                      </div>
                    ) : (
                      <div className="text-orange-400 font-bold text-xs opacity-80">
                        {day.nonTeachingDay.name}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Small dot indicator in corner */}
                {day.nonTeachingDay && (
                  <div className="absolute top-1 right-1">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        (day.nonTeachingDay.breakType === 'holiday' || day.nonTeachingDay.type === 'public_holiday') ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      title={`${(day.nonTeachingDay.breakType === 'holiday' || day.nonTeachingDay.type === 'public_holiday') ? 'Public Holiday' : 'Teaching Break'}: ${day.nonTeachingDay.name}`}
                    />
                  </div>
                )}
                
                {renderLessonIndicators(day.lessons)}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Daily Lessons Sheet */}
      <DailyLessonsSheet
        open={dailyLessonModal.open}
        onOpenChange={(open) => 
          setDailyLessonModal(prev => ({ ...prev, open }))
        }
        date={dailyLessonModal.date}
        lessons={dailyLessonModal.lessons}
        onLessonClick={handleModalLessonClick}
        onConductLesson={onConductLesson}
        onCancelLesson={onCancelLesson}
        onLessonsUpdated={onLessonsUpdated}
      />
    </div>
  );
};

export default LessonCalendar;

