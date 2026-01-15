import React, { useState, useEffect, useMemo } from 'react';
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
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';
import { toast } from 'sonner';

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
  // Lazy loading state for schedule data
  const [schedule, setSchedule] = useState<ScheduleSlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedForClassId, setFetchedForClassId] = useState<string | null>(null);

  const hasFetched = Boolean(classData?.id && fetchedForClassId === classData.id);

  // Reset when switching to a different class
  useEffect(() => {
    if (!classData?.id) return;
    if (fetchedForClassId === null) return;
    if (fetchedForClassId === classData.id) return;

    setSchedule([]);
    setError(null);
    setLoading(true);
    setFetchedForClassId(null);
  }, [classData?.id, fetchedForClassId]);

  // Semester filtering state
  const [semesters, setSemesters] = useState<AcademicSemesterResponse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('all');
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [fetchedSemestersForYearId, setFetchedSemestersForYearId] = useState<string | null>(null);

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlotDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter schedules by selected semester
  const filteredSchedule = useMemo(() => {
    if (selectedSemesterId === 'all') {
      return schedule;
    }
    return schedule.filter((slot) => {
      // Show global schedules (no semester assigned) in all views
      if (slot.isGlobal || !slot.semesterId) {
        return true;
      }
      // Show semester-specific schedules only when that semester is selected
      return slot.semesterId === selectedSemesterId;
    });
  }, [schedule, selectedSemesterId]);

  // Fetch semesters for the class's academic year
  useEffect(() => {
    if (!isActive) return;

    const fetchSemesters = async () => {
      if (!classData?.academicYearId) return;
      if (fetchedSemestersForYearId === classData.academicYearId) return;

      setLoadingSemesters(true);
      try {
        const semestersList = await academicCalendarApiService.getSemestersForYear(
          classData.academicYearId
        );
        // Filter out deleted semesters
        const activeSemesters = semestersList.filter((s) => !s.isDeleted);
        setSemesters(activeSemesters);
        setFetchedSemestersForYearId(classData.academicYearId);
      } catch (err) {
        console.error('Failed to load semesters:', err);
        // Don't show error toast - semesters are optional
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [classData?.academicYearId, fetchedSemestersForYearId, isActive]);

  // Fetch schedule data on mount (lazy loading)
  useEffect(() => {
    if (!isActive) return;

    if (!hasFetched && classData?.id) {
      const fetchSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await classApiService.getClassSchedule(classData.id);
          setSchedule(response.schedule);
          setFetchedForClassId(classData.id);
          // Notify parent of schedule count
          onScheduleCountChange?.(response.schedule.filter(s => !s.isObsolete).length);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load schedule';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchSchedule();
    }
  }, [classData?.id, hasFetched, isActive, onScheduleCountChange]);

  // Refetch schedule when onUpdate is called (after add/edit/delete)
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await classApiService.getClassSchedule(classData.id);
      setSchedule(response.schedule);
      // Notify parent of updated schedule count
      onScheduleCountChange?.(response.schedule.filter(s => !s.isObsolete).length);
      await onUpdate(); // Also refresh parent data (for enrolled count, etc.)
    } catch (err: unknown) {
      toast.error('Failed to refresh schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot: ScheduleSlotDto) => {
    setSelectedSlot(slot);
    setShowEditDialog(true);
  };

  const handleDelete = (slot: ScheduleSlotDto) => {
    setSelectedSlot(slot);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlot?.id) return;

    setIsDeleting(true);
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

      setShowDeleteDialog(false);
      setSelectedSlot(null);
      await handleUpdate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete schedule slot';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !hasFetched) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error Loading Schedule"
        message={error}
        onRetry={() => {
          setFetchedForClassId(null);
          setError(null);
        }}
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
          onAddSchedule={() => setShowAddDialog(true)}
          semesters={semesters}
          selectedSemesterId={selectedSemesterId}
          onSemesterChange={setSelectedSemesterId}
          loadingSemesters={loadingSemesters}
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
        isOpen={showAddDialog}
        onOpenChange={setShowAddDialog}
        classId={classData.id}
        classData={classData}
        initialSemesterId={selectedSemesterId === 'all' ? null : selectedSemesterId}
        onSuccess={handleUpdate}
      />

      <EditScheduleSlotDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classId={classData.id}
        classData={classData}
        slot={selectedSlot}
        onSuccess={handleUpdate}
        onDelete={handleDelete}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
