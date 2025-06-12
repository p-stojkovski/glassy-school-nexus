export interface ScheduleFormData {
  id?: string;
  classId: string;
  teacherId: string;
  studentIds: string[];
  classroomId: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  notes?: string;
}
