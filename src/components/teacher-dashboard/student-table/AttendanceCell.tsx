import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  AttendanceStatus,
  AttendanceStatusColors,
  AttendanceStatusLabels,
  SaveStatus,
} from '@/types/api/lesson-students';

interface AttendanceCellProps {
  studentId: string;
  currentStatus: AttendanceStatus | null;
  saveStatus: SaveStatus;
  onStatusChange: (studentId: string, status: AttendanceStatus) => Promise<void>;
  disabled?: boolean;
}

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['present', 'absent', 'late'];

export const AttendanceCell: React.FC<AttendanceCellProps> = ({
  studentId,
  currentStatus,
  saveStatus,
  onStatusChange,
  disabled = false,
}) => {
  const handleStatusClick = async (status: AttendanceStatus) => {
    if (disabled || saveStatus === 'saving') return;
    
    // Toggle behavior: if clicking current status, don't change
    if (currentStatus === status) return;
    
    try {
      await onStatusChange(studentId, status);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusBadgeClass = (status: AttendanceStatus) => {
    const baseClass = 'cursor-pointer transition-all hover:scale-105 border';
    const colorClass = AttendanceStatusColors[status];
    const isSelected = currentStatus === status;
    
    if (isSelected) {
      return `${baseClass} ${colorClass}`;
    }
    
    return `${baseClass} bg-white/10 text-white/60 border-white/20 hover:bg-white/20`;
  };


  return (
    <div className="flex flex-wrap gap-2">
      {ATTENDANCE_OPTIONS.map((status) => (
        <Badge
          key={status}
          onClick={() => handleStatusClick(status)}
          className={getStatusBadgeClass(status)}
          style={{ cursor: disabled || saveStatus === 'saving' ? 'not-allowed' : 'pointer' }}
        >
          {AttendanceStatusLabels[status]}
        </Badge>
      ))}
    </div>
  );
};