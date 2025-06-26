import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
          {/* Header with Status and Actions */}
          <div className="flex items-start justify-between mb-4">
            <Badge
              className={`${getStatusColor(lesson.status)} border font-medium`}
            >
              {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
            </Badge>

            <div className="flex space-x-2">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(lesson)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              )}
              {canComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComplete(lesson)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                >
                  Complete
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(lesson)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Edit
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(lesson)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Subject */}
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {lesson.subject}
                </h3>
              </div>
            </div>

            {/* Student */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-white/70">Student</p>
                <p className="text-white font-medium">{lesson.studentName}</p>
              </div>
            </div>

            {/* Teacher */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-white/70">Teacher</p>
                <p className="text-white font-medium">{lesson.teacherName}</p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-white/70">Date</p>
                  <p className="text-white font-medium">
                    {formatDate(lesson.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-white/70">Time</p>
                  <p className="text-white font-medium">
                    {formatTime(lesson.startTime)} -{' '}
                    {formatTime(lesson.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Classroom */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-white/70">Classroom</p>
                <p className="text-white font-medium">{lesson.classroomName}</p>
              </div>
            </div>

            {/* Notes (if any) */}
            {lesson.notes && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-white/70 mb-1">Notes</p>
                <p className="text-white text-sm">{lesson.notes}</p>
              </div>
            )}

            {/* Payment Status */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-white/70">Payment Status</p>
                    {paymentStatus.status === 'no_obligation' ? (
                      <Badge
                        className={getPaymentStatusColor(paymentStatus.status)}
                      >
                        No Payment Required
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">
                          ${paymentStatus.totalPaid}/$
                          {paymentStatus.obligationAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {paymentStatus.balance > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-white/70">Balance Due</p>
                    <p className="text-red-400 font-medium">
                      ${paymentStatus.balance}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PrivateLessonCard;
