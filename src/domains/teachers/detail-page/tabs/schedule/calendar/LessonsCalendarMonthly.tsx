/**
 * Monthly calendar view for teacher lessons
 * Shows a traditional calendar grid with stacked status bars per day
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DAY_ABBREVIATIONS, DAYS_OF_WEEK, DayOfWeek } from '@/constants/schedule';
import type { CalendarDateRange, CalendarLesson, LessonsByDate } from './calendarTypes';
import { generateMonthGridData } from './utils';
import LessonDayCell from './LessonDayCell';

interface LessonsCalendarMonthlyProps {
  dateRange: CalendarDateRange;
  currentDate: Date;
  lessonsByDate: LessonsByDate;
  onDayClick?: (date: Date, lessons: CalendarLesson[]) => void;
}

/**
 * Monthly lessons calendar grid
 */
const LessonsCalendarMonthly: React.FC<LessonsCalendarMonthlyProps> = ({
  dateRange,
  currentDate,
  lessonsByDate,
  onDayClick,
}) => {
  const today = useMemo(() => new Date(), []);

  // Generate grid data for all visible days
  const gridData = useMemo(() => {
    return generateMonthGridData(dateRange, currentDate, lessonsByDate, today);
  }, [dateRange, currentDate, lessonsByDate, today]);

  // Split grid data into weeks (7 days each)
  const weeks = useMemo(() => {
    const result: typeof gridData[] = [];
    for (let i = 0; i < gridData.length; i += 7) {
      result.push(gridData.slice(i, i + 7));
    }
    return result;
  }, [gridData]);

  // Calculate total lessons in the month
  const totalLessons = useMemo(() => {
    return gridData.reduce((sum, day) => sum + day.statusCounts.total, 0);
  }, [gridData]);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Day of week headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.04] bg-white/[0.04]">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold text-white/60 border-r border-white/[0.04] last:border-r-0"
          >
            <span className="hidden sm:inline">{DAY_ABBREVIATIONS[day as DayOfWeek]}</span>
            <span className="sm:hidden">{(day as string).charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((dayData) => (
              <LessonDayCell
                key={dayData.dateKey}
                dayData={dayData}
                onClick={
                  dayData.lessons.length > 0 && onDayClick
                    ? () => onDayClick(dayData.date, dayData.lessons)
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Empty state or summary footer */}
      {totalLessons === 0 ? (
        <div className="px-4 py-6 text-center text-white/50 text-sm border-t border-white/[0.04]">
          No lessons scheduled for this month
        </div>
      ) : (
        <div className="px-4 py-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-white/50">
          <span>{totalLessons} lesson{totalLessons !== 1 ? 's' : ''} this month</span>
          <div className="flex items-center gap-3">
            <LegendItem label="Conducted" colorClass="bg-emerald-400" />
            <LegendItem label="Scheduled" colorClass="bg-slate-400" />
            <LegendItem label="Cancelled" colorClass="bg-rose-400" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Legend item for status colors
 */
const LegendItem: React.FC<{ label: string; colorClass: string }> = ({ label, colorClass }) => (
  <div className="flex items-center gap-1">
    <span className={cn('w-2 h-2 rounded-full', colorClass)} />
    <span className="hidden sm:inline">{label}</span>
  </div>
);

export default LessonsCalendarMonthly;
