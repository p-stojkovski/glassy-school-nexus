import React from 'react';
import { AttendanceSummary, HomeworkSummary } from '@/types/api/class';

interface StudentProgressChipsProps {
  totalLessons: number;
  attendance: AttendanceSummary;
  homework: HomeworkSummary;
}

/**
 * Displays combined progress information as inline text chips.
 * Only shows non-zero negative stats (absences, missing homework).
 * If all good, shows: "2 lessons ✓"
 */
const StudentProgressChips: React.FC<StudentProgressChipsProps> = ({
  totalLessons,
  attendance,
  homework,
}) => {
  if (totalLessons === 0) {
    return <span className="text-white/40 text-sm">—</span>;
  }

  const negativeStats: string[] = [];

  // Add absences if any
  if (attendance.absent > 0) {
    negativeStats.push(`${attendance.absent} absent`);
  }

  // Add late if any
  if (attendance.late > 0) {
    negativeStats.push(`${attendance.late} late`);
  }

  // Add missing homework if any
  if (homework.missing > 0) {
    negativeStats.push(`${homework.missing} hw missing`);
  }

  // Add partial homework if any
  if (homework.partial > 0) {
    negativeStats.push(`${homework.partial} hw partial`);
  }

  // Build the display string
  const lessonText = `${totalLessons} ${totalLessons === 1 ? 'lesson' : 'lessons'}`;

  if (negativeStats.length === 0) {
    // All good - show checkmark
    return (
      <div className="text-sm text-white/80">
        {lessonText} <span className="text-emerald-400">✓</span>
      </div>
    );
  }

  // Show lessons + negative stats
  return (
    <div className="text-sm text-white/80">
      {lessonText} <span className="text-white/50">·</span>{' '}
      <span className="text-amber-400">{negativeStats.join(' · ')}</span>
    </div>
  );
};

export default React.memo(StudentProgressChips);
