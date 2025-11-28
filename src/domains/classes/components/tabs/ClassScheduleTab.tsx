import React, { useState } from 'react';
import ClassScheduleSection from '@/domains/classes/components/sections/ClassScheduleSection';
import ArchivedSchedulesSection from '@/domains/classes/components/schedule/ArchivedSchedulesSection';
import { AddScheduleSlotDialog } from '@/domains/classes/components/schedule/AddScheduleSlotDialog';
import { EditScheduleSlotDialog } from '@/domains/classes/components/schedule/EditScheduleSlotDialog';
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
import { ClassResponse, ScheduleSlotDto } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface ClassScheduleTabProps {
  classData: ClassResponse;
  onUpdate: () => void;
  archivedSchedules?: Array<{ id: string; dayOfWeek: string; startTime: string; endTime: string; pastLessonCount: number }>;
  loadingArchived?: boolean;
  archivedSchedulesExpanded?: boolean;
  onToggleArchivedSchedules?: () => void;
  onRefreshArchivedSchedules?: () => void;
}

const ClassScheduleTab: React.FC<ClassScheduleTabProps> = ({
  classData,
  onUpdate,
  archivedSchedules = [],
  loadingArchived = false,
  archivedSchedulesExpanded = false,
  onToggleArchivedSchedules,
  onRefreshArchivedSchedules,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlotDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      } else {
        toast.success('Schedule deleted successfully');
      }

      setShowDeleteDialog(false);
      setSelectedSlot(null);
      await onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete schedule slot');
    } finally {
      setIsDeleting(false);
    }
  };



  return (
    <>
      <div className="space-y-6">
        <ClassScheduleSection
          classData={classData}
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

      {/* Dialogs */}
      <AddScheduleSlotDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        classId={classData.id}
        onSuccess={onUpdate}
      />

      <EditScheduleSlotDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classId={classData.id}
        slot={selectedSlot}
        onSuccess={onUpdate}
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
