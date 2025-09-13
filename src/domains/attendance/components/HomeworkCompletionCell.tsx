import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AttendanceStatus } from '@/types/enums';
import { isHomeworkCompletionEnabled } from '@/utils/homeworkStatusUtils';

interface HomeworkCompletionCellProps {
  studentId: string;
  studentName: string;
  attendanceStatus: string;
  homeworkCompleted?: boolean;
  onHomeworkChange: (studentId: string, completed: boolean) => void;
  disabled?: boolean;
}

const HomeworkCompletionCell: React.FC<HomeworkCompletionCellProps> = ({
  studentId,
  studentName,
  attendanceStatus,
  homeworkCompleted,
  onHomeworkChange,
  disabled = false,
}) => {
  const isEnabled = isHomeworkCompletionEnabled(attendanceStatus) && !disabled;
  const isAbsent = attendanceStatus === AttendanceStatus.Absent;

  const handleChange = (checked: boolean) => {
    if (isEnabled) {
      onHomeworkChange(studentId, checked);
    }
  };

  if (isAbsent) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Checkbox disabled checked={false} />
        <Label className="text-white/60 text-sm">N/A</Label>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`homework-${studentId}`}
        checked={homeworkCompleted || false}
        onCheckedChange={handleChange}
        disabled={!isEnabled}
        className="border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
      />
      <Label
        htmlFor={`homework-${studentId}`}
        className={`text-sm cursor-pointer ${
          isEnabled ? 'text-white' : 'text-white/60'
        }`}
      >
        {homeworkCompleted ? 'Completed' : 'Not completed'}
      </Label>
    </div>
  );
};

export default HomeworkCompletionCell;

