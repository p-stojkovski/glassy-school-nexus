import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { LessonStatusName } from '@/types/api/teacherLesson';

interface LessonStatusBadgeProps {
  status: LessonStatusName;
  className?: string;
}

export const LessonStatusBadge: React.FC<LessonStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: LessonStatusName) => {
    switch (status) {
      case 'Conducted':
        return {
          label: 'Conducted',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600 text-white',
        };
      case 'Cancelled':
        return {
          label: 'Cancelled',
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white',
        };
      case 'Make Up':
        return {
          label: 'Make Up',
          variant: 'default' as const,
          className: 'bg-amber-500 hover:bg-amber-600 text-white',
        };
      case 'Scheduled':
        return {
          label: 'Scheduled',
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
        };
      case 'No Show':
        return {
          label: 'No Show',
          variant: 'secondary' as const,
          className: 'bg-gray-500 hover:bg-gray-600 text-white',
        };
      default:
        return {
          label: status,
          variant: 'outline' as const,
          className: '',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
};
