import React from 'react';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatSchedule } from '@/utils/scheduleFormatter';
import { getClassForStudent } from '@/utils/studentClassUtils';

interface ClassScheduleCellProps {
  studentId: string;
  classes: any[];
  students?: any[];
  loading?: boolean;
}

const ClassScheduleCell: React.FC<ClassScheduleCellProps> = ({
  studentId,
  classes,
  students,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-3 w-16 bg-white/10" />
      </div>
    );
  }

  const studentClass = getClassForStudent(studentId, classes, students);

  if (!studentClass) {
    return (
      <div className="flex items-center gap-2 text-white/50">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Not Enrolled</span>
      </div>
    );
  }

  const scheduleText = formatSchedule(studentClass.schedule);

  return (
    <div className="text-sm">
      <div className="text-white/80 font-medium flex items-center gap-2">
        <Clock className="w-4 h-4 text-white/60" />
        <span>{scheduleText}</span>
      </div>
      {studentClass.schedule && studentClass.schedule.length > 0 && (
        <div className="text-white/60 text-xs mt-1">
          {studentClass.schedule.length} session{studentClass.schedule.length !== 1 ? 's' : ''}/week
        </div>
      )}
    </div>
  );
};

export default ClassScheduleCell;