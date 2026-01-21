import React from 'react';
import { AttendanceSummary, HomeworkSummary } from '@/types/api/class';

interface StudentProgressChipsProps {
  totalLessons: number;
  attendance: AttendanceSummary;
  homework: HomeworkSummary;
}

/**
 * Displays student progress as readable text with subtle color coding.
 *
 * Format: "{present} of {total} lessons [• {n} absent] [• {n} late] [• {n} missing hw]"
 *
 * Benefits over icon-based badges:
 * - Self-explanatory without icon memorization
 * - Mobile-friendly (no hover interactions needed)
 * - Accessible with clear text labels
 * - Colors provide quick visual scanning
 */
const StudentProgressChips: React.FC<StudentProgressChipsProps> = ({
  totalLessons,
  attendance,
  homework,
}) => {
  // No issues to display
  const hasIssues =
    attendance.absent > 0 ||
    attendance.late > 0 ||
    homework.missing > 0 ||
    homework.partial > 0;

  if (totalLessons === 0 || !hasIssues) {
    return null;
  }

  const issues: React.ReactNode[] = [];

  // Absences
  if (attendance.absent > 0) {
    issues.push(
      <span key="absent" className="text-red-400/60">
        {attendance.absent} absent
      </span>
    );
  }

  // Late arrivals
  if (attendance.late > 0) {
    issues.push(
      <span key="late" className="text-amber-400/60">
        {attendance.late} late
      </span>
    );
  }

  // Missing homework
  if (homework.missing > 0) {
    issues.push(
      <span key="missing" className="text-red-400/60">
        {homework.missing} missing hw
      </span>
    );
  }

  // Partial homework
  if (homework.partial > 0) {
    issues.push(
      <span key="partial" className="text-amber-400/60">
        {homework.partial} partial hw
      </span>
    );
  }

  return (
    <div className="flex items-center flex-wrap text-xs">
      {issues.map((issue, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-white/30 mx-1.5">•</span>}
          {issue}
        </React.Fragment>
      ))}
    </div>
  );
};

export default React.memo(StudentProgressChips);
