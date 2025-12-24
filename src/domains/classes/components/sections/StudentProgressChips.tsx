import React from 'react';
import { AttendanceSummary, HomeworkSummary } from '@/types/api/class';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StudentProgressChipsProps {
  totalLessons: number;
  attendance: AttendanceSummary;
  homework: HomeworkSummary;
}

interface MetricBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  variant: 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

/**
 * Fixed-width metric badge with icon and count
 * No hover effects, uses tooltip for full context
 */
const MetricBadge: React.FC<MetricBadgeProps> = ({
  icon,
  count,
  label,
  variant,
  showLabel = false
}) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400/90 border-emerald-400/20',
    warning: 'bg-amber-500/15 text-amber-300/90 border-amber-400/25',
    danger: 'bg-red-500/20 text-red-300/90 border-red-400/40',
  };

  const content = (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        rounded-md border text-sm font-medium
        ${variantStyles[variant]}
        ${showLabel ? 'min-w-[90px]' : 'min-w-[48px]'}
        h-[32px] justify-center
        pointer-events-auto
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-semibold tabular-nums">{count}</span>
      {showLabel && <span className="text-xs whitespace-nowrap">{label}</span>}
    </div>
  );

  // Only wrap in tooltip if label is not shown
  if (showLabel) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-slate-900 border-white/20 text-white text-xs"
      >
        {count} {label}
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Displays student progress with fixed-width metric badges
 * Primary metric (lessons) shows full label, issues show icon+number with tooltips
 * No hover color changes for predictable UI
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
