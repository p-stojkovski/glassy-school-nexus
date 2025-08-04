import {
  StudentStatus,
  AttendanceStatus,
  ObligationStatus,
} from '@/types/enums';

/**
 * Get color classes for student status
 */
export const getStudentStatusColor = (
  status: StudentStatus | string
): string => {
  switch (status) {
    case StudentStatus.Active:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case StudentStatus.Inactive:
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

/**
 * Get color classes for attendance status
 */
export const getAttendanceStatusColor = (
  status: AttendanceStatus | string
): string => {
  switch (status) {
    case AttendanceStatus.Present:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case AttendanceStatus.Absent:
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case AttendanceStatus.Late:
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case AttendanceStatus.Excused:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

/**
 * Get color classes for payment/obligation status
 */
export const getPaymentStatusColor = (
  status: ObligationStatus | string
): string => {
  switch (status) {
    case ObligationStatus.Paid:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case ObligationStatus.Partial:
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case ObligationStatus.Overdue:
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case ObligationStatus.Pending:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

/**
 * Generic status color getter - attempts to determine the appropriate color function
 * based on context or falls back to a default pattern
 */
export const getGenericStatusColor = (status: string): string => {
  // Try to match common status patterns
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'inactive':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'paid':
    case 'present':
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'overdue':
    case 'absent':
    case 'canceled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'partial':
    case 'late':
    case 'maintenance':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'scheduled':
    case 'excused':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};
