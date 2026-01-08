/**
 * Main Lessons Calendar container component
 * Combines navigation, filters, and weekly/monthly views
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { CalendarLesson } from './calendarTypes';
import { useLessonsCalendar } from './useLessonsCalendar';
import LessonsCalendarNavigation from './LessonsCalendarNavigation';
import LessonsCalendarFilters from './LessonsCalendarFilters';
import LessonsCalendarWeekly from './LessonsCalendarWeekly';
import LessonsCalendarMonthly from './LessonsCalendarMonthly';

interface LessonsCalendarProps {
  teacherId: string;
  academicYearId?: string | null;
  onLessonClick?: (lesson: CalendarLesson) => void;
}

/**
 * Teacher lessons calendar with weekly/monthly views
 */
const LessonsCalendar: React.FC<LessonsCalendarProps> = ({
  teacherId,
  academicYearId,
  onLessonClick,
}) => {
  const {
    view,
    setView,
    currentDate,
    dateRange,
    goToToday,
    goToPrevious,
    goToNext,
    loading,
    error,
    selectedClassId,
    setSelectedClassId,
    selectedStatus,
    setSelectedStatus,
    classes,
    filteredLessonsByDate,
    refresh,
  } = useLessonsCalendar({ teacherId, academicYearId });

  // Handle day click in monthly view
  const handleDayClick = (date: Date, lessons: CalendarLesson[]) => {
    // For now, just click the first lesson if available
    if (lessons.length > 0 && onLessonClick) {
      onLessonClick(lessons[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header: Navigation + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Navigation */}
        <LessonsCalendarNavigation
          dateRange={dateRange}
          view={view}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onToday={goToToday}
        />

        {/* Filters */}
        <LessonsCalendarFilters
          view={view}
          onViewChange={setView}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          classes={classes}
        />
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="text-white hover:bg-white/10"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Calendar view */}
      {!loading && !error && (
        <>
          {view === 'weekly' ? (
            <LessonsCalendarWeekly
              dateRange={dateRange}
              lessonsByDate={filteredLessonsByDate}
              onLessonClick={onLessonClick}
            />
          ) : (
            <LessonsCalendarMonthly
              dateRange={dateRange}
              currentDate={currentDate}
              lessonsByDate={filteredLessonsByDate}
              onDayClick={handleDayClick}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LessonsCalendar;
