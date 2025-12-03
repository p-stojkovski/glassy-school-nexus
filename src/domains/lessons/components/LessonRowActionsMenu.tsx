import React from 'react';
import { MoreVertical, Play, CheckCircle, Ban, Repeat, Eye, CalendarClock, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LessonResponse, canRescheduleLesson } from '@/types/api/lesson';
import { DEFAULT_CONDUCT_GRACE_MINUTES, canConductLesson, getCannotConductReason, isPastUnstartedLesson } from '../lessonMode';

interface LessonRowActionsMenuProps {
  lesson: LessonResponse;
  onStartTeaching?: (lesson: LessonResponse) => void;
  onMarkConducted?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onRescheduleLesson?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onViewDetails?: (lesson: LessonResponse) => void;
}

const LessonRowActionsMenu: React.FC<LessonRowActionsMenuProps> = ({
  lesson,
  onStartTeaching,
  onMarkConducted,
  onCancelLesson,
  onRescheduleLesson,
  onCreateMakeup,
  onViewDetails,
}) => {
  const statusAllowsConduct = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  const isPastUnstarted = isPastUnstartedLesson(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.endTime
  );
  const canQuickConductLesson = canConductLesson(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.startTime,
    DEFAULT_CONDUCT_GRACE_MINUTES
  );
  const conductDisabledReason = getCannotConductReason(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.startTime,
    DEFAULT_CONDUCT_GRACE_MINUTES
  );
  const canQuickCancelLesson = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  const canReschedule = canRescheduleLesson(lesson.statusName);
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
        {/* For past unstarted lessons: Show "Document Lesson" instead of "Start Teaching" */}
        {isPastUnstarted && onStartTeaching && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onStartTeaching(lesson))}
            className="text-amber-400 focus:text-amber-300 focus:bg-amber-500/10 cursor-pointer"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Document Lesson
          </DropdownMenuItem>
        )}

        {/* Primary Teaching Action - only for non-past lessons */}
        {!isPastUnstarted && statusAllowsConduct && onStartTeaching && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onStartTeaching(lesson))}
            disabled={!canQuickConductLesson}
            title={conductDisabledReason || 'Start teaching'}
            className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Teaching
          </DropdownMenuItem>
        )}

        {/* Mark as Conducted */}
        {statusAllowsConduct && onMarkConducted && (
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

        {/* Reschedule Lesson - disabled for past unstarted lessons */}
        {canReschedule && !isPastUnstarted && onRescheduleLesson && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onRescheduleLesson(lesson))}
            className="text-orange-400 focus:text-orange-300 focus:bg-orange-500/10 cursor-pointer"
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Reschedule Lesson
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
        {(canQuickConductLesson || canQuickCancelLesson || canReschedule || canCreateMakeupLesson || isPastUnstarted) && onViewDetails && (
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
