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
  if (totalLessons === 0) {
    return <span className="text-white/50 text-sm">—</span>;
  }

  const lessonWord = totalLessons === 1 ? 'lesson' : 'lessons';

  return (
    <div className="flex items-center flex-wrap text-sm">
      {/* Primary: Present count of total lessons */}
      <span className="text-white/80">{attendance.present}</span>
      <span className="text-white/50">&nbsp;of {totalLessons} {lessonWord}</span>

      {/* Issue: Absences */}
      {attendance.absent > 0 && (
        <>
          <span className="text-white/30 mx-1.5">•</span>
          <span className="text-red-400">{attendance.absent} absent</span>
        </>
      )}

      {/* Issue: Late arrivals */}
      {attendance.late > 0 && (
        <>
          <span className="text-white/30 mx-1.5">•</span>
          <span className="text-amber-400">{attendance.late} late</span>
        </>
      )}

      {/* Issue: Missing homework */}
      {homework.missing > 0 && (
        <>
          <span className="text-white/30 mx-1.5">•</span>
          <span className="text-red-400">{homework.missing} missing hw</span>
        </>
      )}

      {/* Issue: Partial homework */}
      {homework.partial > 0 && (
        <>
          <span className="text-white/30 mx-1.5">•</span>
          <span className="text-amber-400">{homework.partial} partial hw</span>
        </>
      )}
    </div>
  );
};

export default React.memo(StudentProgressChips);
