import React, { useEffect } from 'react';
import ConflictPanel from '@/domains/lessons/components/ConflictPanel';
import { useScheduleConflictCheck } from '@/domains/classes/hooks/useScheduleConflictCheck';

interface ScheduleConflictPanelProps {
  classId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  customEndDate?: string;
  onConflictsChange?: (hasConflicts: boolean) => void;
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
}) => {
  const { conflicts, checking, error, hasConflicts, dateRangeContext, runCheck, clear } =
    useScheduleConflictCheck();

  // Trigger conflict check when relevant inputs change
  useEffect(() => {
    runCheck({
      classId,
      dayOfWeek,
      startTime,
      endTime,
      generateLessons,
      rangeType,
      customEndDate,
    });
  }, [classId, dayOfWeek, startTime, endTime, generateLessons, rangeType, customEndDate, runCheck]);

  // Notify parent of conflict state changes
  useEffect(() => {
    if (onConflictsChange) {
      onConflictsChange(hasConflicts);
    }
  }, [hasConflicts, onConflictsChange]);

  // Return null if lessons are not being generated
  if (!generateLessons) {
    return null;
  }

  return (
    <div className="space-y-2">
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
    </div>
  );
};

export default ScheduleConflictPanel;
