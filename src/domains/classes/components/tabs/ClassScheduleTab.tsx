import React, { useState, useEffect } from 'react';
import ClassScheduleSection from '@/domains/classes/components/sections/ClassScheduleSection';
import ArchivedSchedulesSection from '@/domains/classes/components/schedule/ArchivedSchedulesSection';
import { AddScheduleSlotSidebar } from '@/domains/classes/components/schedule/AddScheduleSlotSidebar';
import { EditScheduleSlotDialog } from '@/domains/classes/components/schedule/EditScheduleSlotDialog';
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
import { toast } from 'sonner';

interface ClassScheduleTabProps {
  classData: ClassBasicInfoResponse;
  onUpdate: () => void;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
  onScheduleCountChange?: (count: number) => void;
  archivedSchedules?: Array<{ id: string; dayOfWeek: string; startTime: string; endTime: string; pastLessonCount: number }>;
  loadingArchived?: boolean;
  archivedSchedulesExpanded?: boolean;
  onToggleArchivedSchedules?: () => void;
  onRefreshArchivedSchedules?: () => void;
}

const ClassScheduleTab: React.FC<ClassScheduleTabProps> = ({
  classData,
  onUpdate,
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
  const [hasFetched, setHasFetched] = useState(false);

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlotDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch schedule data on mount (lazy loading)
  useEffect(() => {
    if (!hasFetched && classData?.id) {
      const fetchSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await classApiService.getClassSchedule(classData.id);
          setSchedule(response.schedule);
          setHasFetched(true);
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
  }, [classData?.id, hasFetched, onScheduleCountChange]);

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
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete schedule slot');
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
          setHasFetched(false);
          setError(null);
        }}
        showRetry
      />
    );
  }

  // Create a classData-like object with schedule for ClassScheduleSection
  const classDataWithSchedule = {
    ...classData,
    schedule,
  };

  return (
    <>
      <div className="space-y-6">
        <ClassScheduleSection
          classData={classDataWithSchedule}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSchedule={() => setShowAddDialog(true)}
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
        onSuccess={handleUpdate}
      />

      <EditScheduleSlotDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classId={classData.id}
        slot={selectedSlot}
        onSuccess={handleUpdate}
        onDelete={handleDelete}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Slot?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSlot && (
                <div className="space-y-3">
                  <p>
                    This will remove the <strong>{selectedSlot.dayOfWeek}</strong>{' '}
                    <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong> schedule.
                  </p>
                  
                  {/* Warning about future lessons that will be deleted */}
                  {selectedSlot.futureLessonCount && selectedSlot.futureLessonCount > 0 && (
                    <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                      <p className="font-medium text-red-700 dark:text-red-400">
                        ⚠️ This will permanently delete {selectedSlot.futureLessonCount} future lesson(s)!
                      </p>
                    </div>
                  )}
                  
                  {/* Information about past lessons and archival */}
                  {selectedSlot.pastLessonCount && selectedSlot.pastLessonCount > 0 ? (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                      <p className="font-medium text-amber-700 dark:text-amber-400">
                        📁 This schedule has {selectedSlot.pastLessonCount} past lesson(s) and will be archived to preserve history.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This schedule has no past lessons and will be permanently deleted.
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : (selectedSlot?.pastLessonCount && selectedSlot.pastLessonCount > 0 ? 'Archive' : 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassScheduleTab;
