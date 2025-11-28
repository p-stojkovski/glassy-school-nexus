import React from 'react';
import { AlertCircle, Archive, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScheduleSlotDto } from '@/types/api/class';

/**
 * Props for ScheduleDeleteDialog component
 * Determines whether to show archival warning or simple deletion confirmation
 */
interface ScheduleDeleteDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
  /** Callback when deletion is confirmed */
  onConfirm: () => void | Promise<void>;
  /** Schedule slot to be deleted */
  schedule: ScheduleSlotDto | null;
  /** Whether confirmation is in progress (button disabled) */
  isLoading?: boolean;
  /** Whether the dialog is shown in edit mode (deferred action) or view mode (immediate action) */
  isEditMode?: boolean;
}

/**
 * Component that displays a conditional delete dialog
 * - If schedule has past lessons: Shows archival warning
 * - If schedule has no past lessons: Shows simple delete confirmation
 *
 * Clean code principles applied:
 * - Single responsibility: Only handles deletion confirmation UI
 * - DRY: Conditional rendering based on state
 * - Composition: Uses shadcn AlertDialog
 * - Clear naming: Method names indicate intent
 */
const ScheduleDeleteDialog: React.FC<ScheduleDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  schedule,
  isLoading = false,
  isEditMode = false,
}) => {
  if (!schedule) return null;

  // Check if schedule has past lessons
  const hasPastLessons = schedule.pastLessonCount && schedule.pastLessonCount > 0;
  const pastLessonCount = schedule.pastLessonCount || 0;
  
  // Check if schedule has future lessons
  const hasFutureLessons = schedule.futureLessonCount && schedule.futureLessonCount > 0;
  const futureLessonCount = schedule.futureLessonCount || 0;

  // Format schedule display string
  const scheduleDisplay = `${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {hasPastLessons ? (
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <AlertDialogTitle>{isEditMode ? 'Remove Schedule?' : 'Archive Schedule?'}</AlertDialogTitle>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle>{isEditMode ? 'Remove Schedule?' : 'Delete Schedule?'}</AlertDialogTitle>
            </div>
          )}
        </AlertDialogHeader>

        {/* Using div instead of AlertDialogDescription to avoid HTML nesting violations */}
        <div className="space-y-4">
          {/* Warning about future lessons that will be deleted */}
          {hasFutureLessons && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="font-medium text-red-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                This will permanently delete {futureLessonCount} future lesson{futureLessonCount !== 1 ? 's' : ''}!
              </p>
            </div>
          )}
          
          {hasPastLessons ? (
            // Archival warning for schedules with past lessons
            <>
              <div className="space-y-2">
                <p>
                  This schedule has <strong>{pastLessonCount}</strong> past lesson
                  {pastLessonCount !== 1 ? 's' : ''} associated with it.
                </p>
                <p className="text-sm text-white/60">
                  {isEditMode 
                    ? 'When you save changes, this schedule will be archived to preserve your lesson history.'
                    : 'Instead of deleting it, the schedule will be archived to preserve your lesson history.'}
                </p>
              </div>

              {/* Visual explanation box */}
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 space-y-2">
                <p className="font-medium text-yellow-600 flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  What will happen{isEditMode ? ' on save' : ''}:
                </p>
                <ul className="text-sm text-yellow-700/80 space-y-1 ml-6 list-disc">
                  <li>Schedule marked as read-only</li>
                  {hasFutureLessons && <li className="text-red-600">{futureLessonCount} future lesson{futureLessonCount !== 1 ? 's' : ''} will be deleted</li>}
                  <li>Past lessons remain unchanged</li>
                  <li>Visible in "Archived Schedules" section</li>
                </ul>
              </div>
            </>
          ) : (
            // Simple confirmation for schedules without past lessons
            <>
              <p>
                {isEditMode ? 'Remove' : 'Delete'} the schedule <strong>{scheduleDisplay}</strong>? 
                {isEditMode 
                  ? ' This change will be applied when you save.' 
                  : ' This action cannot be undone.'}
              </p>
              {!hasFutureLessons && (
                <p className="text-sm text-white/60 mt-2">
                  No lessons are associated with this schedule, so it will be permanently removed.
                </p>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              hasPastLessons
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-red-600 hover:bg-red-700'
            }
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                {hasPastLessons ? 'Archiving...' : 'Deleting...'}
              </>
            ) : hasPastLessons ? (
              <>
                <Archive className="w-4 h-4 mr-2" />
                {isEditMode ? 'Remove' : 'Archive'}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {isEditMode ? 'Remove' : 'Delete'}
              </>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScheduleDeleteDialog;
