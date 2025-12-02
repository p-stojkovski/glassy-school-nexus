import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  HomeworkStatus,
  HomeworkStatusColors,
  HomeworkStatusLabels,
  SaveStatus,
} from '@/types/api/lesson-students';

interface HomeworkCellProps {
  studentId: string;
  currentStatus: HomeworkStatus | null;
  saveStatus: SaveStatus;
  onStatusChange: (studentId: string, status: HomeworkStatus) => Promise<void>;
  disabled?: boolean;
}

const HOMEWORK_OPTIONS: HomeworkStatus[] = ['complete', 'missing', 'partial'];

export const HomeworkCell: React.FC<HomeworkCellProps> = ({
  studentId,
  currentStatus,
  saveStatus,
  onStatusChange,
  disabled = false,
}) => {
  const handleStatusClick = async (status: HomeworkStatus) => {
    if (disabled || saveStatus === 'saving') return;
    
    // Toggle behavior: if clicking current status, don't change
    if (currentStatus === status) return;
    
    try {
      await onStatusChange(studentId, status);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusBadgeClass = (status: HomeworkStatus) => {
    const baseClass = 'cursor-pointer transition-all border text-xs px-2 py-1';
    const colorClass = HomeworkStatusColors[status];
    const isSelected = currentStatus === status;
    
    if (isSelected) {
      return `${baseClass} ${colorClass} font-medium`;
    }
    
    return `${baseClass} bg-transparent text-white/60 border-transparent hover:bg-white/10`;
  };


  return (
    <div className="inline-flex gap-1 bg-white/5 rounded-md p-1 border border-white/10">
      {HOMEWORK_OPTIONS.map((status) => (
        <Badge
          key={status}
          onClick={() => handleStatusClick(status)}
          className={getStatusBadgeClass(status)}
          style={{ cursor: disabled || saveStatus === 'saving' ? 'not-allowed' : 'pointer' }}
        >
          {HomeworkStatusLabels[status]}
        </Badge>
      ))}
    </div>
  );
};