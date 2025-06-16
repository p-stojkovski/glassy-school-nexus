export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
}

export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Late = 'late',
  Excused = 'excused',
}

export enum ObligationStatus {
  Pending = 'pending',
  Partial = 'partial',
  Paid = 'paid',
  Overdue = 'overdue',
}

export enum PaymentMethod {
  Cash = 'cash',
  Card = 'card',
  Transfer = 'transfer',
  Other = 'other',
}

export enum ScheduledClassStatus {
  Scheduled = 'scheduled',
  Completed = 'completed',
  Canceled = 'canceled',
  Rescheduled = 'rescheduled',
}

export enum RecurringPattern {
  Weekly = 'weekly',
  Biweekly = 'biweekly',
  Monthly = 'monthly',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export enum StudentStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum ViewMode {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export enum ConflictType {
  Teacher = 'teacher',
  Student = 'student',
  Classroom = 'classroom',
}
