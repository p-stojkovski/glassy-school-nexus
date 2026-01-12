import React from 'react';
import { StudentLessonDetail, StudentPaymentObligationInfo } from '@/types/api/class';
import { Clock, CheckCircle2, XCircle, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface StudentLessonDetailsRowProps {
  lessons: StudentLessonDetail[];
  loading: boolean;
  paymentObligation?: StudentPaymentObligationInfo | null;
}

interface StatusBadgeConfig {
  icon: React.ElementType;
  color: string;
  label: string;
}

/**
 * Fixed-width status badge component
 * No hover effects, consistent sizing for perfect column alignment
 */
const StatusBadge: React.FC<{ config: StatusBadgeConfig; minWidth: string }> = ({ config, minWidth }) => {
  const Icon = config.icon;
  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        rounded-md border text-xs font-medium
        ${config.color}
        ${minWidth}
        h-[32px] justify-center
      `}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="whitespace-nowrap">{config.label}</span>
    </div>
  );
};

const StudentLessonDetailsRow: React.FC<StudentLessonDetailsRowProps> = ({ lessons, loading, paymentObligation }) => {
  const getAttendanceBadge = (status?: string | null) => {
    if (!status) {
      return <span className="text-white/60 text-xs">—</span>;
    }

    const configs: Record<string, StatusBadgeConfig> = {
      present: {
        icon: CheckCircle2,
        color: 'bg-emerald-500/10 text-emerald-400/90 border-emerald-400/20',
        label: 'Present'
      },
      absent: {
        icon: XCircle,
        color: 'bg-red-500/20 text-red-300/90 border-red-400/40',
        label: 'Absent'
      },
      late: {
        icon: Clock,
        color: 'bg-amber-500/15 text-amber-300/90 border-amber-400/25',
        label: 'Late'
      },
      excused: {
        icon: FileText,
        color: 'bg-blue-500/15 text-blue-300/90 border-blue-400/25',
        label: 'Excused'
      },
    };

    const config = configs[status.toLowerCase()];
    if (!config) return <span className="text-white/70 text-xs">Unknown</span>;

    return <StatusBadge config={config} minWidth="min-w-[90px]" />;
  };

  const getHomeworkBadge = (status?: string | null) => {
    if (!status) {
      return <span className="text-white/60 text-xs">—</span>;
    }

    const configs: Record<string, StatusBadgeConfig> = {
      complete: {
        icon: CheckCircle2,
        color: 'bg-emerald-500/10 text-emerald-400/90 border-emerald-400/20',
        label: 'Complete'
      },
      partial: {
        icon: AlertTriangle,
        color: 'bg-amber-500/15 text-amber-300/90 border-amber-400/25',
        label: 'Partial'
      },
      missing: {
        icon: XCircle,
        color: 'bg-red-500/20 text-red-300/90 border-red-400/40',
        label: 'Missing'
      },
    };

    const config = configs[status.toLowerCase()];
    if (!config) return <span className="text-white/70 text-xs">Unknown</span>;

    return <StatusBadge config={config} minWidth="min-w-[95px]" />;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60" />
          Loading lesson details...
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="p-6">
        {/* Payment Obligations Section (shown even if no lessons) */}
        {paymentObligation?.hasPendingObligations && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-400/30">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-200 mb-1">Payment Due</div>
                <div className="text-xs text-amber-300/80">
                  {paymentObligation.pendingCount === 1 ? (
                    <>{formatCurrency(paymentObligation.totalPendingAmount)} outstanding</>
                  ) : (
                    <>{paymentObligation.pendingCount} pending obligations ({formatCurrency(paymentObligation.totalPendingAmount)} total)</>
                  )}
                </div>
                <div className="text-xs text-amber-300/60 mt-1">
                  Note: Month-by-month payment details coming soon
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="text-center text-white/70 text-sm">
          No conducted lessons yet for this student.
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' MKD';
  };

  return (
    <div className="px-6 py-4 transition-all duration-200">
      {/* Payment Obligations Section - shown above lessons */}
      {paymentObligation?.hasPendingObligations && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-400/30">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-200 mb-1">Payment Due</div>
              <div className="text-xs text-amber-300/80">
                {paymentObligation.pendingCount === 1 ? (
                  <>{formatCurrency(paymentObligation.totalPendingAmount)} outstanding</>
                ) : (
                  <>{paymentObligation.pendingCount} pending obligations ({formatCurrency(paymentObligation.totalPendingAmount)} total)</>
                )}
              </div>
              <div className="text-xs text-amber-300/60 mt-1">
                Note: Month-by-month payment details coming soon
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Details Section */}
      <div className="text-xs font-medium text-white/50 mb-3">Lesson History</div>

      {/* Column Headers */}
      <div className="flex items-center gap-6 pb-2 mb-1 border-b border-white/10">
        <div className="flex-shrink-0 w-36 text-xs font-medium text-white/70">Date & Time</div>
        <div className="flex-shrink-0 w-[90px] text-xs font-medium text-white/70">Attendance</div>
        <div className="flex-shrink-0 w-[95px] text-xs font-medium text-white/70">Homework</div>
        <div className="flex-1 text-xs font-medium text-white/70">Comments</div>
      </div>

      {/* Lesson Rows */}
      <div className="space-y-0 max-h-96 overflow-y-auto pr-2">
        {lessons.map((lesson, index) => {
          const lessonDate = parseISO(lesson.lessonDate);
          const formattedDate = format(lessonDate, 'MMM dd, yyyy');

          return (
            <div
              key={lesson.lessonId}
              className={`py-4 flex items-center gap-6 text-xs transition-all duration-200 ${index < lessons.length - 1 ? 'border-b border-white/8' : ''}`}
            >
              {/* Date & Time */}
              <div className="flex-shrink-0 w-36">
                <div className="text-white/90 font-medium">{formattedDate}</div>
                <div className="text-white/60 text-[11px]">{lesson.lessonTime}</div>
              </div>

              {/* Attendance - matches badge width */}
              <div className="flex-shrink-0 w-[90px]">
                {getAttendanceBadge(lesson.attendanceStatus)}
              </div>

              {/* Homework - matches badge width */}
              <div className="flex-shrink-0 w-[95px]">
                {getHomeworkBadge(lesson.homeworkStatus)}
              </div>

              {/* Comments */}
              <div className="flex-1 min-w-0">
                {lesson.comments ? (
                  <div className="text-white/80 truncate">
                    {lesson.comments}
                  </div>
                ) : (
                  <span className="text-white/60">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(StudentLessonDetailsRow);
