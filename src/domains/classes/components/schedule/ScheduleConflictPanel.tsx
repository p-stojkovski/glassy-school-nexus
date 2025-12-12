import React, { useEffect } from 'react';
import { AlertCircle, Calendar, Info } from 'lucide-react';
import ConflictPanel from '@/domains/lessons/components/ConflictPanel';
import { useScheduleConflictCheck } from '@/domains/classes/hooks/useScheduleConflictCheck';
import { ExistingScheduleOverlapInfo } from '@/types/api/scheduleValidation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ScheduleConflictPanelProps {
  classId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  customEndDate?: string;
  onConflictsChange?: (hasConflicts: boolean) => void;
  onExistingOverlapChange?: (overlapInfo: ExistingScheduleOverlapInfo | null) => void;
  /** Show overlap info even when generateLessons is false */
  alwaysCheckOverlaps?: boolean;
}

/**
 * ScheduleConflictPanel
 * Displays conflict information for schedule slot creation using the existing ConflictPanel component.
 * Automatically checks for conflicts when inputs change.
 */
export const ScheduleConflictPanel: React.FC<ScheduleConflictPanelProps> = ({
  classId,
  dayOfWeek,
  startTime,
  endTime,
  generateLessons,
  rangeType,
  customEndDate,
  onConflictsChange,
  onExistingOverlapChange,
  alwaysCheckOverlaps = false,
}) => {
  const { conflicts, checking, error, hasConflicts, dateRangeContext, existingOverlap, runCheck, clear } =
    useScheduleConflictCheck();

  // Trigger conflict check when relevant inputs change
  // When alwaysCheckOverlaps is true, run check even without generateLessons
  useEffect(() => {
    if (generateLessons || alwaysCheckOverlaps) {
      runCheck({
        classId,
        dayOfWeek,
        startTime,
        endTime,
        generateLessons: generateLessons || alwaysCheckOverlaps,
        rangeType,
        customEndDate,
      });
    } else {
      clear();
    }
  }, [classId, dayOfWeek, startTime, endTime, generateLessons, rangeType, customEndDate, alwaysCheckOverlaps, runCheck, clear]);

  // Notify parent of conflict state changes
  useEffect(() => {
    if (onConflictsChange) {
      onConflictsChange(hasConflicts);
    }
  }, [hasConflicts, onConflictsChange]);

  // Notify parent of existing overlap changes
  useEffect(() => {
    if (onExistingOverlapChange) {
      onExistingOverlapChange(existingOverlap);
    }
  }, [existingOverlap, onExistingOverlapChange]);

  const showOverlapInfo = existingOverlap?.hasOverlap && !checking;
  // Any overlap (exact or partial) should block creation - teacher/classroom are occupied
  const hasExactOverlap = existingOverlap?.overlaps.some(o => o.overlapType === 'exact') ?? false;
  const hasAnyOverlap = existingOverlap?.hasOverlap ?? false;

  const showConflicts = generateLessons && (hasConflicts || checking || error);

  // Return null if nothing to show
  if (!showOverlapInfo && !showConflicts) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Existing Schedule Overlap - All overlaps block creation (teacher/classroom busy) */}
      {showOverlapInfo && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-sm font-medium text-red-300">
            {hasExactOverlap ? 'Schedule Already Exists' : 'Time Conflict Detected'}
          </AlertTitle>
          <AlertDescription className="text-white/70 text-sm">
            {hasExactOverlap ? (
              <p className="text-red-300/90 mb-2">
                This exact schedule already exists. Please choose a different time.
              </p>
            ) : (
              <p className="text-red-300/90 mb-2">
                This time overlaps with an existing schedule. The teacher and classroom are already occupied.
              </p>
            )}
            {existingOverlap.overlaps.map((overlap) => (
              <div key={overlap.scheduleSlotId} className="mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-red-400" />
                  <span className="font-medium text-white/90">
                    {overlap.dayOfWeek} {overlap.startTime} - {overlap.endTime}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                    {overlap.overlapType === 'exact' ? 'Duplicate' : 'Overlaps'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/60 ml-5">
                  {overlap.futureLessonCount > 0 ? (
                    <span>{overlap.futureLessonCount} future lesson{overlap.futureLessonCount !== 1 ? 's' : ''} scheduled</span>
                  ) : (
                    <span className="text-red-300/80">No future lessons</span>
                  )}
                  {overlap.pastLessonCount > 0 && (
                    <span className="ml-2">• {overlap.pastLessonCount} past lesson{overlap.pastLessonCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Lesson Generation Conflicts */}
      {showConflicts && (
        <>
          <ConflictPanel
            conflicts={conflicts}
            suggestions={[]}
            checking={checking}
            error={error}
            onSuggestionClick={() => {}}
            showProceedButton={false}
          />
          {dateRangeContext && !checking && (
            <p className="text-xs text-white/50 text-center">
              {dateRangeContext}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduleConflictPanel;
