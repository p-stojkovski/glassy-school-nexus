import React, { memo } from 'react';
import { User, CheckCircle2, AlertCircle, MinusCircle, BarChart3, BookOpen, ChevronRight, ChevronDown, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Amount } from '@/components/ui/amount';
import { formatCurrency } from '@/utils/formatters';
import { StudentPaymentStatus } from '@/types/api/teacher';
import { cn } from '@/lib/utils';

interface StudentPaymentRowProps {
  student: StudentPaymentStatus;
  isExpanded?: boolean;
  onToggle?: () => void;
}

/**
 * Individual student row showing payment, attendance, and homework status.
 * Displays student name with enrollment status indicator and quick metrics.
 * Expandable to show payment breakdown details.
 * Clicking anywhere on the row toggles expand/collapse.
 */
const StudentPaymentRow = memo<StudentPaymentRowProps>(({ student, isExpanded = false, onToggle }) => {
  const isInactive = student.enrollmentStatus !== 'active';

  const handleRowClick = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const getPaymentStatusConfig = (status: StudentPaymentStatus['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle2,
          label: 'Paid',
          className: 'text-green-400 bg-green-500/10',
        };
      case 'partial':
        return {
          icon: MinusCircle,
          label: 'Partial',
          className: 'text-amber-400 bg-amber-500/10',
        };
      case 'due':
        return {
          icon: AlertCircle,
          label: 'Due',
          className: 'text-red-400 bg-red-500/10',
        };
    }
  };

  const getPercentageColor = (percentage: number | null): string => {
    if (percentage === null) return 'text-white/40';
    if (percentage >= 85) return 'text-green-400';
    if (percentage >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getEnrollmentBadge = () => {
    if (student.enrollmentStatus === 'inactive') {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-500/20 text-gray-400 border-gray-500/30">
          Inactive
        </Badge>
      );
    }
    if (student.enrollmentStatus === 'transferred') {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-400 border-blue-500/30">
          Transferred
        </Badge>
      );
    }
    return null;
  };

  const paymentConfig = getPaymentStatusConfig(student.paymentStatus);
  const PaymentIcon = paymentConfig.icon;

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div className="border-b border-white/5 last:border-b-0">
      {/* Main Row - Click anywhere to expand/collapse */}
      <div
        onClick={handleRowClick}
        className={cn(
          'flex items-center justify-between py-2.5 px-3 hover:bg-white/5 cursor-pointer transition-colors',
          isInactive && 'opacity-60'
        )}
      >
        {/* Student Name & Enrollment Status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Chevron Indicator */}
          {onToggle && (
            <ChevronIcon
              className={cn(
                'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
                isInactive ? 'text-white/30' : 'text-white/50'
              )}
            />
          )}
          <User className={cn('w-4 h-4 flex-shrink-0', isInactive ? 'text-white/30' : 'text-white/40')} />
          <span className={cn('text-sm truncate', isInactive ? 'text-white/50' : 'text-white/90')}>
            {student.studentName}
          </span>
          {getEnrollmentBadge()}
        </div>

        {/* Metrics Row */}
        <div className="flex items-center gap-3">
          {/* Payment Status */}
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
              paymentConfig.className
            )}
            title={`Payment: ${paymentConfig.label}${student.dueAmount ? ` (${formatCurrency(student.dueAmount)})` : ''}`}
          >
            <PaymentIcon className="w-3 h-3" />
            <span>{student.dueAmount ? <Amount value={student.dueAmount} size="sm" /> : paymentConfig.label}</span>
          </div>

          {/* Attendance */}
          <div
            className="flex items-center gap-1 text-xs"
            title={`Attendance: ${student.attendancePercentage !== null ? `${student.attendancePercentage}%` : 'N/A'} (${student.totalLessons} lessons)`}
          >
            <BarChart3 className={cn('w-3 h-3', getPercentageColor(student.attendancePercentage))} />
            <span className={cn('w-8 text-right', getPercentageColor(student.attendancePercentage))}>
              {student.attendancePercentage !== null ? `${student.attendancePercentage}%` : 'N/A'}
            </span>
          </div>

          {/* Homework */}
          <div
            className="flex items-center gap-1 text-xs"
            title={`Homework: ${student.homeworkPercentage !== null ? `${student.homeworkPercentage}%` : 'N/A'} (${student.totalLessons} lessons)`}
          >
            <BookOpen className={cn('w-3 h-3', getPercentageColor(student.homeworkPercentage))} />
            <span className={cn('w-8 text-right', getPercentageColor(student.homeworkPercentage))}>
              {student.homeworkPercentage !== null ? `${student.homeworkPercentage}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Payment Details */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-3 py-3 bg-white/[0.02] border-t border-white/5">
          <div className="pl-8 space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <DollarSign className="w-3.5 h-3.5 text-white/40" />
              <span className="font-medium text-white/80">Payment Details:</span>
            </div>

            {/* Payment status specific details */}
            {student.paymentStatus === 'paid' && (
              <div className="pl-5 space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400/80" />
                  <span className="text-green-400/90">All payments up to date</span>
                </div>
                <div className="text-white/50">
                  Status: Fully paid for current period
                </div>
              </div>
            )}

            {student.paymentStatus === 'due' && student.dueAmount && (
              <div className="pl-5 space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-400/80" />
                  <span className="text-red-400/90">Outstanding Amount: <Amount value={student.dueAmount} size="sm" className="text-red-400/90" /></span>
                </div>
                <div className="text-white/50">
                  Payment required for continued enrollment
                </div>
              </div>
            )}

            {student.paymentStatus === 'partial' && student.dueAmount && (
              <div className="pl-5 space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <MinusCircle className="w-3 h-3 text-amber-400/80" />
                  <span className="text-amber-400/90">Remaining Balance: <Amount value={student.dueAmount} size="sm" className="text-amber-400/90" /></span>
                </div>
                <div className="text-white/50">
                  Partial payment received, balance due
                </div>
              </div>
            )}

            {/* Lessons count */}
            {student.totalLessons > 0 && (
              <div className="pl-5 text-xs text-white/50 pt-1 border-t border-white/5">
                Total Lessons: {student.totalLessons}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

StudentPaymentRow.displayName = 'StudentPaymentRow';

export default StudentPaymentRow;
