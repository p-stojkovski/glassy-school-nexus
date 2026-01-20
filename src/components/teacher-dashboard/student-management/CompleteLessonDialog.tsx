/**
 * CompleteLessonDialog - Confirmation dialog for completing/conducting a lesson
 *
 * Displays a summary of:
 * - Attendance counts (Present/Absent/Late)
 * - Lesson notes status (with content or warning if none)
 * - Homework status (with content or warning if none)
 *
 * Uses the standard ConfirmDialog component with success intent.
 */
import { useMemo } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/dialogs';
import { AttendanceStatus } from '@/types/api/lesson-students';

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  unmarked: number;
}

interface CompleteLessonDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Callback to change dialog visibility */
  onOpenChange: (open: boolean) => void;
  /** Callback when user confirms completion */
  onConfirm: () => void | Promise<void>;
  /** Loading state for async completion */
  isLoading?: boolean;
  /** Array of attendance statuses for all students */
  attendanceStatuses: (AttendanceStatus | null)[];
  /** Lesson notes content (empty string or null means no notes) */
  lessonNotes: string | null;
  /** Homework description for next lesson (empty string or null means no homework) */
  homeworkDescription: string | null;
}

/**
 * Calculate attendance summary from array of statuses
 */
function calculateAttendanceSummary(statuses: (AttendanceStatus | null)[]): AttendanceSummary {
  return statuses.reduce(
    (acc, status) => {
      if (status === 'present') acc.present++;
      else if (status === 'absent') acc.absent++;
      else if (status === 'late') acc.late++;
      else acc.unmarked++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, unmarked: 0 }
  );
}

/**
 * Truncate text for display with ellipsis
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function CompleteLessonDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  attendanceStatuses,
  lessonNotes,
  homeworkDescription,
}: CompleteLessonDialogProps) {
  // Calculate attendance summary
  const attendance = useMemo(
    () => calculateAttendanceSummary(attendanceStatuses),
    [attendanceStatuses]
  );

  // Check if notes and homework exist
  const hasNotes = lessonNotes && lessonNotes.trim().length > 0;
  const hasHomework = homeworkDescription && homeworkDescription.trim().length > 0;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="success"
      size="md"
      icon={CheckCircle}
      title="Complete Lesson"
      description="Mark this lesson as completed?"
      confirmText="Complete"
      onConfirm={onConfirm}
      isLoading={isLoading}
      infoContent={
        <div className="bg-white/5 border border-white/10 rounded-lg divide-y divide-white/10">
          {/* Attendance Summary */}
          <div className="p-3">
            <p className="text-xs text-white/50 mb-1">Attendance</p>
            <div className="flex justify-between text-sm">
              <span className="text-green-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                {attendance.present} Present
              </span>
              <span className="text-red-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400/50 border border-red-400" />
                {attendance.absent} Absent
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400/50" />
                {attendance.late} Late
              </span>
            </div>
            {attendance.unmarked > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {attendance.unmarked} student{attendance.unmarked > 1 ? 's' : ''} unmarked
                </span>
              </div>
            )}
          </div>

          {/* Lesson Notes */}
          <div className="p-3">
            <p className="text-xs text-white/50 mb-1">Lesson Notes</p>
            {hasNotes ? (
              <p className="text-sm text-white/80 flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span className="italic">"{truncateText(lessonNotes!)}"</span>
              </p>
            ) : (
              <p className="text-sm text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                No lesson notes added
              </p>
            )}
          </div>

          {/* Homework for Next Lesson */}
          <div className="p-3">
            <p className="text-xs text-white/50 mb-1">Homework for Next Lesson</p>
            {hasHomework ? (
              <p className="text-sm text-white/80 flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span className="italic">"{truncateText(homeworkDescription!)}"</span>
              </p>
            ) : (
              <p className="text-sm text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                No homework assigned
              </p>
            )}
          </div>
        </div>
      }
    />
  );
}

export default CompleteLessonDialog;
