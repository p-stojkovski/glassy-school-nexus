/**
 * Navigation controls for the lessons calendar
 * Provides prev/next/today buttons and date range display
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CalendarDateRange, CalendarView } from './calendarTypes';
import { formatDateRangeDisplay } from './utils';

interface LessonsCalendarNavigationProps {
  dateRange: CalendarDateRange;
  view: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const LessonsCalendarNavigation: React.FC<LessonsCalendarNavigationProps> = ({
  dateRange,
  view,
  onPrevious,
  onNext,
  onToday,
}) => {
  const dateLabel = formatDateRangeDisplay(dateRange, view);

  return (
    <div className="flex items-center gap-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        className="h-8 w-8 bg-white/5 border-white/10 hover:bg-white/10"
        aria-label={view === 'weekly' ? 'Previous week' : 'Previous month'}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Today button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        className="h-8 px-3 bg-white/5 border-white/10 hover:bg-white/10 text-sm"
      >
        Today
      </Button>

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        className="h-8 w-8 bg-white/5 border-white/10 hover:bg-white/10"
        aria-label={view === 'weekly' ? 'Next week' : 'Next month'}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Date range label */}
      <span className="text-white font-medium text-sm ml-2">
        {dateLabel}
      </span>
    </div>
  );
};

export default LessonsCalendarNavigation;
