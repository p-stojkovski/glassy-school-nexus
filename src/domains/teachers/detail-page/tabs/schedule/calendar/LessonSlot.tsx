/**
 * Lesson slot component for displaying individual lessons in the calendar
 * Used in weekly view for positioned lesson blocks
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarLesson, StatusColorConfig } from './calendarTypes';
import { STATUS_COLORS } from './calendarTypes';
import { formatTime } from './utils';

interface LessonSlotProps {
  lesson: CalendarLesson;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Get status color configuration
 */
function getStatusColors(status: CalendarLesson['statusName']): StatusColorConfig {
  return STATUS_COLORS[status] || STATUS_COLORS['Scheduled'];
}

/**
 * Lesson slot for weekly calendar view
 * Displays class name, time range, and status indicator
 */
const LessonSlot = memo<LessonSlotProps>(({ lesson, style, onClick }) => {
  const colors = getStatusColors(lesson.statusName);

  return (
    <div
      className={cn(
        'absolute left-1.5 right-1.5 rounded-lg px-2 py-1.5 overflow-hidden',
        'border shadow-md',
        colors.bg,
        colors.border,
        onClick && 'cursor-pointer hover:ring-2 hover:ring-white/30 transition-all'
      )}
      style={style}
      title={`${lesson.className}\n${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}\nStatus: ${lesson.statusName}`}
      onClick={onClick}
    >
      {/* Class name */}
      <div className="text-sm text-white font-semibold truncate leading-tight">
        {lesson.className}
      </div>

      {/* Time range */}
      <div className="text-[11px] text-white/80 truncate mt-0.5">
        {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1 mt-1">
        <span
          className={cn(
            'inline-block w-2 h-2 rounded-full',
            colors.dot
          )}
        />
        <span className="text-[10px] text-white/70 font-medium truncate">
          {lesson.statusName}
        </span>
      </div>
    </div>
  );
});

LessonSlot.displayName = 'LessonSlot';

export default LessonSlot;
