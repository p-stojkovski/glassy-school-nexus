import React from 'react';
import { MoreVertical, Play, CheckCircle, Ban, Repeat, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LessonResponse } from '@/types/api/lesson';

interface LessonRowActionsMenuProps {
  lesson: LessonResponse;
  onStartTeaching?: (lesson: LessonResponse) => void;
  onMarkConducted?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onViewDetails?: (lesson: LessonResponse) => void;
}

const LessonRowActionsMenu: React.FC<LessonRowActionsMenuProps> = ({
  lesson,
  onStartTeaching,
  onMarkConducted,
  onCancelLesson,
  onCreateMakeup,
  onViewDetails,
}) => {
  const canQuickConductLesson = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  const canQuickCancelLesson = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  const canCreateMakeupLesson = lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;
  
  // Determine if there are any actions available (at minimum, view details is always available)
  const hasAnyActions = canQuickConductLesson || canQuickCancelLesson || canCreateMakeupLesson || onViewDetails;

  const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900/95 border-white/20 w-48">
        {/* Primary Teaching Action */}
        {canQuickConductLesson && onStartTeaching && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onStartTeaching(lesson))}
            className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Teaching
          </DropdownMenuItem>
        )}

        {/* Mark as Conducted */}
        {canQuickConductLesson && onMarkConducted && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onMarkConducted(lesson))}
            className="text-green-400 focus:text-green-300 focus:bg-green-500/10 cursor-pointer"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Conducted
          </DropdownMenuItem>
        )}

        {/* Cancel Lesson */}
        {canQuickCancelLesson && onCancelLesson && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onCancelLesson(lesson))}
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
          >
            <Ban className="mr-2 h-4 w-4" />
            Cancel Lesson
          </DropdownMenuItem>
        )}

        {/* Create Makeup */}
        {canCreateMakeupLesson && onCreateMakeup && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onCreateMakeup(lesson))}
            className="text-purple-400 focus:text-purple-300 focus:bg-purple-500/10 cursor-pointer"
          >
            <Repeat className="mr-2 h-4 w-4" />
            Create Makeup Lesson
          </DropdownMenuItem>
        )}

        {/* Separator if there are actions above */}
        {(canQuickConductLesson || canCreateMakeupLesson) && onViewDetails && (
          <DropdownMenuSeparator className="bg-white/10" />
        )}

        {/* View Details */}
        {onViewDetails && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onViewDetails(lesson))}
            className="text-white focus:text-white focus:bg-white/10 cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LessonRowActionsMenu;
