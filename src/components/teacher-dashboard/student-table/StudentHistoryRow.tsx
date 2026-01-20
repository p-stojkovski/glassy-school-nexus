import React from 'react';
import { StudentLessonDetail } from '@/types/api/class';
import { Clock, CheckCircle2, XCircle, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface StudentHistoryRowProps {
  history: StudentLessonDetail[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Number of columns in parent table for proper colspan */
  colSpan: number;
}

interface StatusBadgeConfig {
  icon: React.ElementType;
  color: string;
  label: string;
}

/**
 * Fixed-width status badge component for attendance and homework statuses.
 * Consistent sizing ensures proper column alignment.
 */
const StatusBadge: React.FC<{ config: StatusBadgeConfig; minWidth: string }> = ({
  config,
  minWidth,
}) => {
  const Icon = config.icon;
  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        rounded-md border text-xs font-medium
        ${config.color}
        ${minWidth}
        h-[26px] justify-center
      `}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="whitespace-nowrap">{config.label}</span>
    </div>
  );
};

/**
 * Renders attendance status as a styled badge.
 * Returns muted dash for null/undefined status.
 */
const getAttendanceBadge = (status?: string | null) => {
  if (!status) {
    return <span className="text-white/50 text-xs">—</span>;
  }

  const configs: Record<string, StatusBadgeConfig> = {
    present: {
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      label: 'Present',
    },
    absent: {
      icon: XCircle,
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      label: 'Absent',
    },
    late: {
      icon: Clock,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      label: 'Late',
    },
    excused: {
      icon: FileText,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      label: 'Excused',
    },
  };

  const config = configs[status.toLowerCase()];
  if (!config) return <span className="text-white/50 text-xs">—</span>;

  return <StatusBadge config={config} minWidth="min-w-[80px]" />;
};

/**
 * Renders homework status as a styled badge.
 * Returns muted dash for null/undefined status.
 */
const getHomeworkBadge = (status?: string | null) => {
  if (!status) {
    return <span className="text-white/50 text-xs">—</span>;
  }

  const configs: Record<string, StatusBadgeConfig> = {
    complete: {
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      label: 'Complete',
    },
    partial: {
      icon: AlertTriangle,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      label: 'Partial',
    },
    missing: {
      icon: XCircle,
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      label: 'Missing',
    },
  };

  const config = configs[status.toLowerCase()];
  if (!config) return <span className="text-white/50 text-xs">—</span>;

  return <StatusBadge config={config} minWidth="min-w-[85px]" />;
};

/**
 * StudentHistoryRow - Renders the expanded detail row showing a student's last 5 lessons.
 *
 * This component handles four states:
 * 1. Loading: Shows skeleton placeholder rows
 * 2. Error: Shows error message with retry button
 * 3. Empty: Shows "No previous lessons" message
 * 4. Data: Shows compact table with Date, Attendance, Homework columns
 */
const StudentHistoryRow: React.FC<StudentHistoryRowProps> = ({
  history,
  isLoading,
  error,
  onRetry,
  colSpan,
}) => {
  // Loading State
  if (isLoading) {
    return (
      <tr className="bg-white/5 border-t border-white/10">
        <td colSpan={colSpan} className="px-0 py-0">
          <div className="pl-10 pr-4 py-4 space-y-2">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white/50" />
              Loading history...
            </div>
            {/* Skeleton rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-6">
                <Skeleton className="h-5 w-16 bg-white/10" />
                <Skeleton className="h-5 w-20 bg-white/10" />
                <Skeleton className="h-5 w-20 bg-white/10" />
              </div>
            ))}
          </div>
        </td>
      </tr>
    );
  }

  // Error State
  if (error) {
    return (
      <tr className="bg-red-500/10 border-t border-red-500/20">
        <td colSpan={colSpan} className="px-0 py-0">
          <div className="pl-10 pr-4 py-4 flex items-center gap-3">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-red-300 hover:text-red-200 hover:bg-red-500/20 h-7 px-2 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  // Empty State
  if (history.length === 0) {
    return (
      <tr className="bg-white/5 border-t border-white/10">
        <td colSpan={colSpan} className="px-0 py-0">
          <div className="pl-10 pr-4 py-4 text-center">
            <span className="text-white/50 text-sm">No previous lessons in this class</span>
          </div>
        </td>
      </tr>
    );
  }

  // Data State - Compact table with lesson history
  return (
    <tr className="bg-white/5 border-t border-white/10">
      <td colSpan={colSpan} className="px-0 py-0">
        <div className="pl-10 pr-4 py-3">
          {/* Column Headers */}
          <div className="flex items-center gap-6 pb-2 mb-1 border-b border-white/10">
            <div className="w-16 text-xs font-medium text-white/60">Date</div>
            <div className="w-[80px] text-xs font-medium text-white/60">Attendance</div>
            <div className="w-[85px] text-xs font-medium text-white/60">Homework</div>
          </div>

          {/* Lesson Rows */}
          <div className="space-y-0">
            {history.map((lesson, index) => {
              const lessonDate = parseISO(lesson.lessonDate);
              const formattedDate = format(lessonDate, 'MMM d');

              return (
                <div
                  key={lesson.lessonId}
                  className={`py-1.5 flex items-center gap-6 text-sm ${
                    index < history.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  {/* Date */}
                  <div className="w-16 text-white/80">{formattedDate}</div>

                  {/* Attendance */}
                  <div className="w-[80px]">{getAttendanceBadge(lesson.attendanceStatus)}</div>

                  {/* Homework */}
                  <div className="w-[85px]">{getHomeworkBadge(lesson.homeworkStatus)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(StudentHistoryRow);
