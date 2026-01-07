import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { StudentPaymentStatus } from '@/types/api/teacher';
import { cn } from '@/lib/utils';

interface StudentPaymentRowProps {
  student: StudentPaymentStatus;
}

/**
 * Individual student row showing payment status within an expanded class card.
 * Displays student name, payment status badge, and due amount if applicable.
 */
const StudentPaymentRow: React.FC<StudentPaymentRowProps> = ({ student }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/students/${student.studentId}`);
  };

  const formatCurrency = (amount: number | null): string => {
    if (amount === null || amount === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusConfig = (status: StudentPaymentStatus['paymentStatus']) => {
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

  const statusConfig = getStatusConfig(student.paymentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between py-2 px-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <User className="w-4 h-4 text-white/40 flex-shrink-0" />
        <span className="text-sm text-white/90 truncate">{student.studentName}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Payment Status Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
            statusConfig.className
          )}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusConfig.label}</span>
        </div>

        {/* Due Amount */}
        <div className="w-20 text-right">
          <span
            className={cn(
              'text-sm font-medium',
              student.dueAmount && student.dueAmount > 0 ? 'text-red-400' : 'text-white/40'
            )}
          >
            {formatCurrency(student.dueAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentRow;
