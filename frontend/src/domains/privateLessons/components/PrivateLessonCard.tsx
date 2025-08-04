import React from 'react';
import { Eye, MoreVertical, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GlassCard from '@/components/common/GlassCard';
import { PrivateLesson } from '../privateLessonsSlice';
import { PrivateLessonStatus } from '@/types/enums';

interface PrivateLessonCardProps {
  lesson: PrivateLesson;
  onEdit: (lesson: PrivateLesson) => void;
  onCancel: (lesson: PrivateLesson) => void;
  onComplete: (lesson: PrivateLesson) => void;
  onViewDetails?: (lesson: PrivateLesson) => void;
}

const getStatusColor = (status: PrivateLessonStatus): string => {
  switch (status) {
    case PrivateLessonStatus.Scheduled:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case PrivateLessonStatus.Completed:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case PrivateLessonStatus.Cancelled:
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const formatTime = (time: string): string => {
  return time;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to calculate payment status
const calculatePaymentStatus = (lesson: PrivateLesson) => {
  if (!lesson.paymentObligation) {
    return { status: 'no_obligation', totalPaid: 0, balance: 0 };
  }

  const totalPaid = (lesson.paymentRecords || []).reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const balance = lesson.paymentObligation.amount - totalPaid;

  return {
    status: lesson.paymentObligation.status,
    totalPaid,
    balance,
    obligationAmount: lesson.paymentObligation.amount,
  };
};

// Helper function to get payment status color
const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'overdue':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'partial':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'no_obligation':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const PrivateLessonCard: React.FC<PrivateLessonCardProps> = ({
  lesson,
  onEdit,
  onCancel,
  onComplete,
  onViewDetails,
}) => {
  const canEdit = lesson.status !== PrivateLessonStatus.Completed;
  const canCancel = lesson.status === PrivateLessonStatus.Scheduled;
  const canComplete = lesson.status === PrivateLessonStatus.Scheduled;

  const paymentStatus = calculatePaymentStatus(lesson);

  return (
    <div>
      <GlassCard className="p-6 h-full">
        {/*No hover effects*/}
        <div className="flex flex-col h-full">
          {/* Header with Subject and Actions */}
          <div className="flex items-start justify-between mb-4">
            {/* Subject - Main Title */}
            <h3 className="text-xl font-semibold text-white">
              {lesson.subject}
            </h3>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-gray-900/95 border-white/20 text-white"
              >
                {onViewDetails && (
                  <DropdownMenuItem
                    onClick={() => onViewDetails(lesson)}
                    className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(lesson)}
                    className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lesson
                  </DropdownMenuItem>
                )}

                {(canComplete || canCancel) && (
                  <DropdownMenuSeparator className="bg-white/20" />
                )}

                {canComplete && (
                  <DropdownMenuItem
                    onClick={() => onComplete(lesson)}
                    className="text-green-400 focus:text-green-300 focus:bg-green-500/10 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Lesson
                  </DropdownMenuItem>
                )}

                {canCancel && (
                  <DropdownMenuItem
                    onClick={() => onCancel(lesson)}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Lesson
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Student */}
            <p className="text-white/70">
              <span className="text-sm font-medium text-white">Student:</span>{' '}
              {lesson.studentName}
            </p>

            {/* Teacher */}
            <p className="text-white/70">
              <span className="text-sm font-medium text-white">Teacher:</span>{' '}
              {lesson.teacherName}
            </p>

            {/* Room */}
            <p className="text-white/70">
              <span className="text-sm font-medium text-white">Room:</span>{' '}
              {lesson.classroomName}
            </p>

            {/* Students count - using a placeholder since we don't have this data */}
            <p className="text-white/70 mb-2">
              <span className="text-sm font-medium text-white">Students:</span>{' '}
              1/1
            </p>

            {/* Schedule */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Schedule:</p>
              <p className="text-sm text-white/70">
                {formatDate(lesson.date)}: {formatTime(lesson.startTime)} -{' '}
                {formatTime(lesson.endTime)}
              </p>
            </div>

            {/* Notes (if any) */}
            {lesson.notes && (
              <div className="pt-2">
                <p className="text-sm font-medium text-white mb-1">Notes:</p>
                <p className="text-sm text-white/70">{lesson.notes}</p>
              </div>
            )}
          </div>

          {/* Footer with timestamp */}
          <div className="text-xs text-white/50 border-t border-white/10 pt-3 mt-4">
            {/* Payment Status */}
            <div className="pt-2">
              <p className="text-sm font-medium text-white mb-1">
                Payment Status:
              </p>
              {paymentStatus.status === 'no_obligation' ? (
                <Badge className={getPaymentStatusColor(paymentStatus.status)}>
                  No Payment Required
                </Badge>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">
                    ${paymentStatus.totalPaid}/${paymentStatus.obligationAmount}
                  </span>
                  {paymentStatus.balance > 0 && (
                    <span className="text-red-400 font-medium text-sm">
                      Balance: ${paymentStatus.balance}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PrivateLessonCard;
