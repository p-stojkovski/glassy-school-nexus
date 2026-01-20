import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import { ClassBasicInfoResponse } from '@/types/api/class';
import { LessonResponse } from '@/types/api/lesson';
import { useLessonsForClass } from '@/domains/lessons/hooks/useLessons';
import LessonTimeline from '@/domains/lessons/components/LessonTimeline';
import LessonsEnhancedFilters from '@/domains/lessons/components/LessonsEnhancedFilters';
import CreateLessonSidebar from '@/domains/lessons/components/modals/CreateLessonSidebar';
import QuickConductLessonModal from '@/domains/lessons/components/modals/QuickConductLessonModal';
import QuickCancelLessonModal from '@/domains/lessons/components/modals/QuickCancelLessonModal';
import RescheduleLessonModal from '@/domains/lessons/components/modals/RescheduleLessonModal';
import AcademicLessonGenerationModal from '@/domains/lessons/components/modals/AcademicLessonGenerationModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LessonActionButtons from '@/domains/lessons/components/LessonActionButtons';
import { hasActiveSchedules, getScheduleWarningMessage } from '@/domains/classes/_shared/utils/scheduleValidationUtils';

import { useLessonsTabFilters, useLessonsTabActions } from './hooks';
import { LessonsEmptyState, getEmptyMessage, getEmptyDescription } from './components';

interface LessonsTabProps {
  classData: ClassBasicInfoResponse;
  onScheduleTabClick?: () => void;
  /** Callback when lessons are created/updated - used to refresh hero section */
  onLessonsUpdated?: () => void;
}

const LessonsTab: React.FC<LessonsTabProps> = ({
  classData,
  onLessonsUpdated,
}) => {
  const navigate = useNavigate();
  const { lessons, loading, loadLessons } = useLessonsForClass(classData.id);

  // Use extracted hooks for filters and actions
  const filters = useLessonsTabFilters({
    classId: classData.id,
    academicYearId: classData.academicYearId,
  });

  const actions = useLessonsTabActions({
    classId: classData.id,
    loadLessons,
    currentFilters: filters.currentFilters,
    onLessonsUpdated,
  });

  // Compute next lesson from the current lessons list
  const nextLesson = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = lessons
      .filter(l => {
        const lessonDate = new Date(l.scheduledDate);
        lessonDate.setHours(0, 0, 0, 0);
        return l.statusName === 'Scheduled' && lessonDate >= today;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    return upcoming[0] || null;
  }, [lessons]);

  // Load lessons with server-side filtering when filters change
  useEffect(() => {
    loadLessons(filters.currentFilters);
  }, [loadLessons, filters.currentFilters]);

  // Schedule validation
  const scheduleAvailable = hasActiveSchedules(classData);
  const scheduleWarning = getScheduleWarningMessage(classData);

  // Handler for lesson row click - navigates to teaching page
  const handleLessonClick = useCallback((lesson: LessonResponse) => {
    navigate(`/classes/${classData.id}/teach/${lesson.id}`);
  }, [navigate, classData.id]);

  // Loading state
  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Pre-compute empty state messages for LessonTimeline
  const emptyMessage = getEmptyMessage(lessons.length, filters.scopeFilter);
  const emptyDescription = getEmptyDescription(lessons.length, scheduleAvailable, filters.scopeFilter);

  return (
    <div className="space-y-4">
      {/* Schedule Warning Banner */}
      {!scheduleAvailable && scheduleWarning && (
        <div className="flex items-center gap-3 bg-slate-500/10 border border-slate-500/20 rounded-lg px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-300">{scheduleWarning}</span>
        </div>
      )}

      {/* Enhanced Filters and Actions */}
      <div className="flex flex-wrap items-end justify-between gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/10">
        {/* Left: Enhanced Filters */}
        <LessonsEnhancedFilters
          statusFilter={filters.statusFilter}
          onStatusChange={filters.setStatusFilter}
          scopeFilter={filters.scopeFilter}
          onScopeChange={filters.handleScopeChange}
          timeWindow={filters.timeWindow}
          onTimeWindowChange={filters.setTimeWindow}
          compact={true}
          semesters={filters.semesters}
          selectedSemesterId={filters.selectedSemesterId}
          onSemesterChange={filters.setSelectedSemesterId}
          loadingSemesters={filters.loadingSemesters}
        />

        {/* Right: Action Buttons */}
        <LessonActionButtons
          onCreateLesson={() => actions.setIsCreateLessonOpen(true)}
          onGenerateLessons={() => actions.setIsAcademicGenerationOpen(true)}
          generateDisabled={!scheduleAvailable}
          disabledTooltip={scheduleWarning || undefined}
        />
      </div>

      {/* Custom Empty State or Timeline View */}
      <LessonsEmptyState
        lessonsCount={lessons.length}
        scheduleAvailable={scheduleAvailable}
        scopeFilter={filters.scopeFilter}
        statusFilter={filters.statusFilter}
      />
      {(lessons.length > 0 || scheduleAvailable) && (
        <LessonTimeline
          lessons={lessons}
          loading={loading}
          groupByMonth={true}
          sortDirection="desc"
          nextLesson={nextLesson}
          showTeacherName={false}
          showSemesterBadge={false}
          onLessonClick={handleLessonClick}
          emptyMessage={emptyMessage}
          emptyDescription={emptyDescription}
        />
      )}

      {/* Quick Action Modals */}
      <QuickConductLessonModal
        lesson={actions.modals.conduct.lesson}
        open={actions.modals.conduct.open}
        onOpenChange={actions.closeConductModal}
        onConfirm={actions.handleQuickConduct}
        loading={actions.conductingLesson}
      />

      <QuickCancelLessonModal
        lesson={actions.modals.cancel.lesson}
        open={actions.modals.cancel.open}
        onOpenChange={actions.closeCancelModal}
        onConfirm={actions.handleQuickCancel}
        loading={actions.cancellingLesson}
      />

      <RescheduleLessonModal
        lesson={actions.modals.reschedule.lesson}
        open={actions.modals.reschedule.open}
        onOpenChange={actions.closeRescheduleModal}
        onConfirm={actions.handleReschedule}
        loading={actions.reschedulingLesson}
      />

      {/* Academic Lesson Generation Modal */}
      <AcademicLessonGenerationModal
        open={actions.isAcademicGenerationOpen}
        onOpenChange={actions.setIsAcademicGenerationOpen}
        classId={classData.id}
        className={classData.name}
        onSuccess={actions.handleAcademicGenerationSuccess}
      />

      {/* Create Lesson Sidebar */}
      <CreateLessonSidebar
        open={actions.isCreateLessonOpen}
        onOpenChange={actions.setIsCreateLessonOpen}
        onSubmit={actions.handleCreateLesson}
        classId={classData.id}
        className={classData.name}
        loading={actions.creatingLesson}
      />
    </div>
  );
};

export default LessonsTab;
