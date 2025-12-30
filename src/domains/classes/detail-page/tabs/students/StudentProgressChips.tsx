import React from 'react';
import { AttendanceSummary, HomeworkSummary } from '@/types/api/class';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MetricBadge } from '@/components/ui/metric-badge';

interface StudentProgressChipsProps {
  totalLessons: number;
  attendance: AttendanceSummary;
  homework: HomeworkSummary;
}

/**
 * Displays student progress with fixed-width metric badges.
 * Uses the shared MetricBadge component for consistent styling.
 *
 * Primary metric (lessons) shows full label, issues show icon+number with tooltips.
 * No hover color changes for predictable UI.
 */
const StudentProgressChips: React.FC<StudentProgressChipsProps> = ({
  totalLessons,
  attendance,
  homework,
}) => {
  if (totalLessons === 0) {
    return <span className="text-white/50 text-sm">—</span>;
  }

  const lessonLabel = totalLessons === 1 ? 'lesson' : 'lessons';
  const absenceLabel = attendance.absent === 1 ? 'absence' : 'absences';
  const lateLabel = attendance.late === 1 ? 'late' : 'lates';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2">
        {/* Primary metric: Total lessons - always shown with label */}
        <MetricBadge
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          count={totalLessons}
          label={lessonLabel}
          variant="success"
          showLabel={true}
        />

        {/* Issue metrics: Compact icon+number with tooltips */}
        {attendance.absent > 0 && (
          <MetricBadge
            icon={<XCircle className="w-3.5 h-3.5" />}
            count={attendance.absent}
            label={absenceLabel}
            variant="danger"
          />
        )}

        {attendance.late > 0 && (
          <MetricBadge
            icon={<Clock className="w-3.5 h-3.5" />}
            count={attendance.late}
            label={lateLabel}
            variant="warning"
          />
        )}

        {homework.missing > 0 && (
          <MetricBadge
            icon={<AlertCircle className="w-3.5 h-3.5" />}
            count={homework.missing}
            label="missing homework"
            variant="danger"
          />
        )}

        {homework.partial > 0 && (
          <MetricBadge
            icon={<Clock className="w-3.5 h-3.5" />}
            count={homework.partial}
            label="partial homework"
            variant="warning"
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default React.memo(StudentProgressChips);
