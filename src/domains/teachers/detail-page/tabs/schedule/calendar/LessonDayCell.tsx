/**
 * Day cell component for monthly calendar view
 * Displays date number and mini stacked status bars
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { MonthDayData } from './calendarTypes';
import { STATUS_COLORS } from './calendarTypes';

interface LessonDayCellProps {
  dayData: MonthDayData;
  onClick?: () => void;
}

/**
 * Mini stacked bar showing lesson status distribution
 */
const StatusStackedBar: React.FC<{ counts: MonthDayData['statusCounts'] }> = ({ counts }) => {
  if (counts.total === 0) return null;

  // Build segments in order: Conducted, Scheduled, Make Up, Cancelled, No Show
  const segments: { status: keyof typeof STATUS_COLORS; count: number }[] = [
    { status: 'Conducted', count: counts.conducted },
    { status: 'Scheduled', count: counts.scheduled },
    { status: 'Make Up', count: counts.makeUp },
    { status: 'Cancelled', count: counts.cancelled },
    { status: 'No Show', count: counts.noShow },
  ].filter((s) => s.count > 0);

  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-white/5">
      {segments.map(({ status, count }) => {
        const width = (count / counts.total) * 100;
        return (
          <div
            key={status}
            className={cn(
              STATUS_COLORS[status].dot,
              'h-full transition-all'
            )}
            style={{ width: `${width}%` }}
            title={`${status}: ${count}`}
          />
        );
      })}
    </div>
  );
};

/**
 * Tooltip content showing lesson breakdown
 */
const DayTooltip: React.FC<{ counts: MonthDayData['statusCounts'] }> = ({ counts }) => {
  if (counts.total === 0) return null;

  const items = [
    { label: 'Conducted', count: counts.conducted, color: STATUS_COLORS['Conducted'].dot },
    { label: 'Scheduled', count: counts.scheduled, color: STATUS_COLORS['Scheduled'].dot },
    { label: 'Make Up', count: counts.makeUp, color: STATUS_COLORS['Make Up'].dot },
    { label: 'Cancelled', count: counts.cancelled, color: STATUS_COLORS['Cancelled'].dot },
    { label: 'No Show', count: counts.noShow, color: STATUS_COLORS['No Show'].dot },
  ].filter((item) => item.count > 0);

  return (
    <div className="text-xs space-y-1">
      <div className="font-medium text-white">{counts.total} lesson{counts.total !== 1 ? 's' : ''}</div>
      {items.map(({ label, count, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', color)} />
          <span className="text-white/70">{label}: {count}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Day cell for monthly calendar
 * Shows date number and stacked status bar
 */
const LessonDayCell = memo<LessonDayCellProps>(({ dayData, onClick }) => {
  const { dayNumber, isCurrentMonth, isToday, statusCounts } = dayData;
  const hasLessons = statusCounts.total > 0;

  return (
    <div
      className={cn(
        'min-h-[72px] p-1.5 border-b border-r border-white/[0.04]',
        'flex flex-col',
        !isCurrentMonth && 'bg-white/[0.01]',
        hasLessons && onClick && 'cursor-pointer hover:bg-white/5 transition-colors',
        'group relative'
      )}
      onClick={hasLessons && onClick ? onClick : undefined}
      title={hasLessons ? `${statusCounts.total} lesson${statusCounts.total !== 1 ? 's' : ''}` : undefined}
    >
      {/* Date number */}
      <div className="flex justify-between items-start mb-1">
        <span
          className={cn(
            'text-sm font-medium',
            isToday && 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center',
            !isToday && isCurrentMonth && 'text-white',
            !isToday && !isCurrentMonth && 'text-white/30'
          )}
        >
          {dayNumber}
        </span>

        {/* Lesson count badge */}
        {hasLessons && (
          <span className="text-[10px] font-medium text-white/60 bg-white/10 rounded-full px-1.5 py-0.5">
            {statusCounts.total}
          </span>
        )}
      </div>

      {/* Stacked status bar */}
      <div className="flex-1 flex flex-col justify-end">
        <StatusStackedBar counts={statusCounts} />
      </div>

      {/* Hover tooltip */}
      {hasLessons && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20',
            'bg-gray-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
            'transition-all duration-150',
            'pointer-events-none'
          )}
        >
          <DayTooltip counts={statusCounts} />
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900/95" />
          </div>
        </div>
      )}
    </div>
  );
});

LessonDayCell.displayName = 'LessonDayCell';

export default LessonDayCell;
