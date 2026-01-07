import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useTeacherLessons } from './useTeacherLessons';
import { TeacherLessonsFilters } from './TeacherLessonsFilters';
import { TeacherLessonsTable } from './TeacherLessonsTable';
import LessonsStatsBar from './LessonsStatsBar';

interface TeacherLessonsTabProps {
  teacherId: string;
  academicYearId?: string | null;
  yearName?: string;
}

export const TeacherLessonsTab: React.FC<TeacherLessonsTabProps> = ({ teacherId, academicYearId, yearName }) => {
  const {
    lessons,
    stats,
    loading,
    error,
    selectedStatus,
    setSelectedStatus,
    selectedClassId,
    setSelectedClassId,
    scopeFilter,
    setScopeFilter,
    timeWindow,
    setTimeWindow,
    classes,
    refresh,
    totalCount,
    skip,
    take,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
  } = useTeacherLessons({ teacherId, academicYearId });

  // Calculate current page info
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(totalCount / take);
  const startItem = skip + 1;
  const endItem = Math.min(skip + take, totalCount);

  const handleClearFilters = useCallback(() => {
    setSelectedStatus('All');
    setSelectedClassId(null);
    setScopeFilter('all');
    setTimeWindow('all');
  }, [setSelectedStatus, setSelectedClassId, setScopeFilter, setTimeWindow]);

  if (loading && !lessons.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        <span className="ml-2 text-white/60">Loading lessons...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-end justify-between gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/10">
        <TeacherLessonsFilters
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedClassId={selectedClassId}
          onClassIdChange={setSelectedClassId}
          scopeFilter={scopeFilter}
          onScopeChange={setScopeFilter}
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          classes={classes}
          onClearFilters={handleClearFilters}
        />

        {/* Refresh Button */}
        <Button
          onClick={refresh}
          disabled={loading}
          variant="outline"
          size="sm"
          className="h-9 border-white/20 bg-white/5 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Header */}
      {stats && totalCount > 0 && (
        <LessonsStatsBar stats={stats} totalCount={totalCount} />
      )}

      {/* Content Area */}
      {lessons.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 bg-white/[0.02]">
          <div className="flex flex-col items-center text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <BookOpen className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {yearName ? `No Lessons for ${yearName}` : 'No Lessons Found'}
            </h3>
            <p className="text-white/70">
              {yearName
                ? `No lessons found for ${yearName}. Try selecting a different academic year or adjusting your filter settings.`
                : 'No lessons match the selected filters. Try adjusting your filter settings.'}
            </p>
          </div>
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <TeacherLessonsTable lessons={lessons} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <div className="text-sm text-white/60">
                Showing {startItem} to {endItem} of {totalCount} lessons
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={!hasPreviousPage || loading}
                  className="h-8 border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-white/60">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!hasNextPage || loading}
                  className="h-8 border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};
