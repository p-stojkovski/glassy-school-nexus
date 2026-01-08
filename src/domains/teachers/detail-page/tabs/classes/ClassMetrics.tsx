import React from 'react';
import { BarChart3, BookOpen, Users, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricBadgeProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  colorClass?: string;
}

/**
 * Small badge displaying a single metric with icon, value, and label.
 */
const MetricBadge: React.FC<MetricBadgeProps> = ({
  icon,
  value,
  label,
  colorClass = 'text-white/70',
}) => (
  <div className="flex flex-col items-center gap-1">
    <div className={cn('flex items-center gap-1.5', colorClass)}>
      {icon}
      <span className="text-sm font-medium">{value}</span>
    </div>
    <span className="text-xs text-white/50">{label}</span>
  </div>
);

/**
 * Returns the appropriate color class for attendance percentage.
 * Green: >= 85%, Amber: 70-84%, Red: < 70%
 */
export function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return 'text-green-400';
  if (percentage >= 70) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Returns the appropriate color class for capacity utilization.
 * Green: >= 80%, Amber: 50-79%, Red: < 50%
 */
export function getCapacityColor(enrolled: number, capacity: number): string {
  if (capacity === 0) return 'text-white/70';
  const rate = (enrolled / capacity) * 100;
  if (rate >= 80) return 'text-green-400';
  if (rate >= 50) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Returns the appropriate color class for homework completion percentage.
 * Green: >= 80%, Amber: 60-79%, Red: < 60%
 */
export function getHomeworkColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-400';
  if (percentage >= 60) return 'text-amber-400';
  return 'text-red-400';
}

interface ClassMetricsRowProps {
  attendanceRatePercentage: number;
  conductedLessons: number;
  totalLessons: number;
  enrolledCount: number;
  classroomCapacity: number;
  homeworkCompletionPercentage: number;
}

/**
 * Row of class metrics: Attendance, Homework, Lessons progress, Capacity.
 */
const ClassMetricsRow: React.FC<ClassMetricsRowProps> = ({
  attendanceRatePercentage,
  conductedLessons,
  totalLessons,
  enrolledCount,
  classroomCapacity,
  homeworkCompletionPercentage,
}) => {
  return (
    <div className="flex items-center justify-around py-3 px-4 border-t border-white/10">
      <MetricBadge
        icon={<BarChart3 className="w-4 h-4" />}
        value={`${attendanceRatePercentage}%`}
        label="Attendance"
        colorClass={getAttendanceColor(attendanceRatePercentage)}
      />
      <MetricBadge
        icon={<ClipboardCheck className="w-4 h-4" />}
        value={`${homeworkCompletionPercentage}%`}
        label="Homework"
        colorClass={getHomeworkColor(homeworkCompletionPercentage)}
      />
      <MetricBadge
        icon={<BookOpen className="w-4 h-4" />}
        value={`${conductedLessons}/${totalLessons}`}
        label="Lessons"
        colorClass="text-white/70"
      />
      <MetricBadge
        icon={<Users className="w-4 h-4" />}
        value={`${enrolledCount}/${classroomCapacity}`}
        label="Capacity"
        colorClass={getCapacityColor(enrolledCount, classroomCapacity)}
      />
    </div>
  );
};

export default ClassMetricsRow;
