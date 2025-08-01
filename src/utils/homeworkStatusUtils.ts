import { AttendanceStatus } from '@/types/enums';

/**
 * Determines if homework completion should be enabled based on attendance status
 * Homework completion is disabled for absent students
 */
export function isHomeworkCompletionEnabled(attendanceStatus: string): boolean {
  return attendanceStatus !== AttendanceStatus.Absent;
}

/**
 * Gets the default homework completion value based on attendance status
 */
export function getDefaultHomeworkCompletion(attendanceStatus: string): boolean | undefined {
  if (attendanceStatus === AttendanceStatus.Absent) {
    return undefined; // N/A for absent students
  }
  return false; // Default to not completed for present/late students
}

/**
 * Formats homework completion status for display
 */
export function formatHomeworkStatus(homeworkCompleted?: boolean, attendanceStatus?: string): string {
  if (attendanceStatus === AttendanceStatus.Absent) {
    return 'N/A';
  }
  if (homeworkCompleted === undefined) {
    return 'Not marked';
  }
  return homeworkCompleted ? 'Completed' : 'Not completed';
}

/**
 * Validates homework completion data
 */
export function validateHomeworkCompletion(
  attendanceStatus: string,
  homeworkCompleted?: boolean
): { isValid: boolean; message?: string } {
  // Absent students should not have homework completion marked
  if (attendanceStatus === AttendanceStatus.Absent && homeworkCompleted !== undefined) {
    return {
      isValid: false,
      message: 'Homework completion should not be marked for absent students'
    };
  }
  
  return { isValid: true };
}
