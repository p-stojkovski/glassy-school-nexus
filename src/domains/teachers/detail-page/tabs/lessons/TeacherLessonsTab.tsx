import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeacherLessons } from './useTeacherLessons';
import { TeacherLessonsFilters } from './TeacherLessonsFilters';
import { TeacherLessonsTable } from './TeacherLessonsTable';

interface TeacherLessonsTabProps {
  teacherId: string;
}

export const TeacherLessonsTab: React.FC<TeacherLessonsTabProps> = ({ teacherId }) => {
  const {
    lessons,
    stats,
    loading,
    error,
    selectedStatus,
    setSelectedStatus,
    selectedClassId,
    setSelectedClassId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    classes,
    refresh,
    totalCount,
    skip,
    take,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
  } = useTeacherLessons({ teacherId });

  // Calculate current page info
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(totalCount / take);
  const startItem = skip + 1;
  const endItem = Math.min(skip + take, totalCount);

  if (loading && !lessons.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading lessons...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherLessonsFilters
            stats={stats}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedClassId={selectedClassId}
            onClassIdChange={setSelectedClassId}
            fromDate={fromDate}
            onFromDateChange={setFromDate}
            toDate={toDate}
            onToDateChange={setToDate}
            classes={classes}
          />
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Lessons
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalCount} total)
              </span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <TeacherLessonsTable lessons={lessons} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalCount} lessons
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={!hasPreviousPage || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!hasNextPage || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
