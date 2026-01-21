import React, { useEffect, useMemo } from 'react';
import ClassScheduleSection from './ClassScheduleSection';
import ArchivedSchedulesSection from './ArchivedSchedulesSection';
import { AddScheduleSlotSidebar } from './dialogs';
import { EditScheduleSlotDialog } from './dialogs/EditScheduleSlotDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ClassBasicInfoResponse, ScheduleSlotDto } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import { toast } from 'sonner';
import { useScheduleTabState } from './hooks';

interface ScheduleTabProps {
  classData: ClassBasicInfoResponse;
  onUpdate: () => void;
  isActive: boolean;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
  onScheduleCountChange?: (count: number) => void;
  archivedSchedules?: Array<{ id: string; dayOfWeek: string; startTime: string; endTime: string; pastLessonCount: number }>;
  loadingArchived?: boolean;
  archivedSchedulesExpanded?: boolean;
  onToggleArchivedSchedules?: () => void;
  onRefreshArchivedSchedules?: () => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  classData,
  onUpdate,
  isActive,
  onUnsavedChangesChange,
  onScheduleCountChange,
  archivedSchedules = [],
  loadingArchived = false,
  archivedSchedulesExpanded = false,
  onToggleArchivedSchedules,
  onRefreshArchivedSchedules,
}) => {
  const {
    state,
    actions,
    hasFetchedSchedule,
    hasFetchedSemesters,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedSlot,
    isDeleting,
  } = useScheduleTabState();

  const hasFetched = hasFetchedSchedule(classData?.id);
  const hasFetchedSems = hasFetchedSemesters(classData?.academicYearId);

  // Reset when switching to a different class
  useEffect(() => {
    if (!classData?.id) return;
    if (state.fetch.fetchedClassId === null) return;
    if (state.fetch.fetchedClassId === classData.id) return;

    actions.resetForClassChange();
  }, [classData?.id, state.fetch.fetchedClassId, actions]);

  // Filter schedules by selected semester
  const filteredSchedule = useMemo(() => {
    if (state.filter.selectedSemesterId === 'all') {
      return state.data.schedule;
    }
    return state.data.schedule.filter((slot) => {
      // Show global schedules (no semester assigned) in all views
      if (slot.isGlobal || !slot.semesterId) {
        return true;
      }
      // Show semester-specific schedules only when that semester is selected
      return slot.semesterId === state.filter.selectedSemesterId;
    });
  }, [state.data.schedule, state.filter.selectedSemesterId]);

  // Fetch semesters for the class's academic year
  useEffect(() => {
    if (!isActive) return;

    const fetchSemesters = async () => {
      if (!classData?.academicYearId) return;
      if (hasFetchedSems) return;

      actions.fetchSemestersStart();
      try {
        const semestersList = await academicCalendarApiService.getSemestersForYear(
          classData.academicYearId
        );
        // Filter out deleted semesters
        const activeSemesters = semestersList.filter((s) => !s.isDeleted);
        actions.fetchSemestersSuccess(activeSemesters, classData.academicYearId);
      } catch (err) {
        console.error('Failed to load semesters:', err);
        // Don't show error toast - semesters are optional
      }
    };

    fetchSemesters();
  }, [classData?.academicYearId, hasFetchedSems, isActive, actions]);

  // Fetch schedule data on mount (lazy loading)
  useEffect(() => {
    if (!isActive) return;

    if (!hasFetched && classData?.id) {
      const fetchSchedule = async () => {
        actions.fetchScheduleStart();
        try {
          const response = await classApiService.getClassSchedule(classData.id);
          actions.fetchScheduleSuccess(response.schedule, classData.id);
          // Notify parent of schedule count
          onScheduleCountChange?.(response.schedule.filter(s => !s.isObsolete).length);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load schedule';
          actions.fetchScheduleError(errorMessage);
        }
      };
      fetchSchedule();
    }
  }, [classData?.id, hasFetched, isActive, onScheduleCountChange, actions]);

  // Refetch schedule when onUpdate is called (after add/edit/delete)
  const handleUpdate = async () => {
    actions.fetchScheduleStart();
    try {
      const response = await classApiService.getClassSchedule(classData.id);
      actions.fetchScheduleSuccess(response.schedule, classData.id);
      // Notify parent of updated schedule count
      onScheduleCountChange?.(response.schedule.filter(s => !s.isObsolete).length);
      await onUpdate(); // Also refresh parent data (for enrolled count, etc.)
    } catch (err: unknown) {
      toast.error('Failed to refresh schedule');
    }
  };

  const handleEdit = (slot: ScheduleSlotDto) => {
    actions.openEditDialog(slot);
  };

  const handleDelete = (slot: ScheduleSlotDto) => {
    actions.openDeleteDialog(slot);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlot?.id) return;

    actions.deleteStart();
    try {
      const response = await classApiService.deleteScheduleSlot(classData.id, selectedSlot.id);

      if (response.wasArchived) {
        toast.success(
          `Schedule archived. ${response.pastLessonCount} past lesson(s) preserved.`,
          { duration: 6000 }
        );
        // Refresh archived schedules if expanded
        onRefreshArchivedSchedules?.();
      } else {
        toast.success('Schedule deleted successfully');
      }

      actions.deleteComplete();
      await handleUpdate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete schedule slot';
      toast.error(message);
      actions.closeDialog();
    }
  };

  const handleRetry = () => {
    actions.resetForClassChange();
  };

  if (state.data.loading && !hasFetched) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (state.data.error) {
    return (
      <ErrorMessage
        title="Error Loading Schedule"
        message={state.data.error}
        onRetry={handleRetry}
        showRetry
      />
    );
  }

  // Create a classData-like object with filtered schedule for ClassScheduleSection
  const classDataWithSchedule = {
    ...classData,
    schedule: filteredSchedule,
  };

  return (
    <>
      <div className="space-y-6">
        <ClassScheduleSection
          classData={classDataWithSchedule}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSchedule={actions.openAddDialog}
          semesters={state.data.semesters}
          selectedSemesterId={state.filter.selectedSemesterId}
          onSemesterChange={actions.setSemesterFilter}
          loadingSemesters={state.data.loadingSemesters}
        />

        {/* Archived schedules section */}
        {onToggleArchivedSchedules && (
          <ArchivedSchedulesSection
            archivedSchedules={archivedSchedules}
            isExpanded={archivedSchedulesExpanded}
            onToggleExpand={onToggleArchivedSchedules}
            isLoading={loadingArchived}
          />
        )}
      </div>

      {/* Sidebars */}
      <AddScheduleSlotSidebar
        isOpen={isAddDialogOpen}
        onOpenChange={(open) => !open && actions.closeDialog()}
        classId={classData.id}
        classData={classData}
        initialSemesterId={state.filter.selectedSemesterId === 'all' ? null : state.filter.selectedSemesterId}
        onSuccess={handleUpdate}
      />

      <EditScheduleSlotDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => !open && actions.closeDialog()}
        classId={classData.id}
        classData={classData}
        slot={selectedSlot}
        onSuccess={handleUpdate}
        onDelete={handleDelete}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && actions.closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Schedule Slot</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {selectedSlot && (
                <div className="space-y-4">
                  <p className="text-white/70">
                    You are removing the <span className="font-medium text-white">{selectedSlot.dayOfWeek}</span>{' '}
                    <span className="font-medium text-white">{selectedSlot.startTime} - {selectedSlot.endTime}</span> schedule.
                  </p>

                  {/* Future lessons - calm, factual messaging */}
                  {selectedSlot.futureLessonCount && selectedSlot.futureLessonCount > 0 && (
                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                      <p className="text-sm text-white/80">
                        <span className="font-medium text-amber-300">Future lessons:</span>{' '}
                        {selectedSlot.futureLessonCount} scheduled lesson{selectedSlot.futureLessonCount !== 1 ? 's' : ''} will be removed.
                      </p>
                    </div>
                  )}

                  {/* Past lessons - preserved in archive */}
                  {selectedSlot.pastLessonCount && selectedSlot.pastLessonCount > 0 ? (
                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                      <p className="text-sm text-white/80">
                        <span className="font-medium text-emerald-300">Past lessons:</span>{' '}
                        {selectedSlot.pastLessonCount} lesson{selectedSlot.pastLessonCount !== 1 ? 's' : ''} will be preserved in archived schedules.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">
                      This schedule has no past lessons and will be permanently removed.
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {isDeleting ? 'Removing...' : (selectedSlot?.pastLessonCount && selectedSlot.pastLessonCount > 0 ? 'Archive & Remove' : 'Remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ScheduleTab;
