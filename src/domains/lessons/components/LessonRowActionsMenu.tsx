import React from 'react';
import { MoreVertical, CheckCircle, Ban, Repeat, Eye, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LessonResponse, canRescheduleLesson } from '@/types/api/lesson';
import { isPastUnstartedLesson } from '../lessonMode';

interface LessonRowActionsMenuProps {
  lesson: LessonResponse;
  onMarkConducted?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onRescheduleLesson?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onViewDetails?: (lesson: LessonResponse) => void;
}

const LessonRowActionsMenu: React.FC<LessonRowActionsMenuProps> = ({
  lesson,
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
  const canQuickCancelLesson = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  const canReschedule = canRescheduleLesson(lesson.statusName);
  const canCreateMakeupLesson = lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;

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
      <DropdownMenuContent align="end" className="bg-gray-900/95 border-white/20 w-56">
        {/* Change schedule - for Scheduled/Make Up lessons, not past unstarted */}
        {canReschedule && !isPastUnstarted && onRescheduleLesson && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onRescheduleLesson(lesson))}
            className="text-orange-400 focus:text-orange-300 focus:bg-orange-500/10 cursor-pointer"
            title="Move this lesson to a different time. No additional lesson is added."
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Change schedule…
          </DropdownMenuItem>
        )}

        {/* Cancel lesson - for Scheduled/Make Up lessons */}
        {canQuickCancelLesson && onCancelLesson && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onCancelLesson(lesson))}
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
          >
            <Ban className="mr-2 h-4 w-4" />
            Cancel lesson…
          </DropdownMenuItem>
        )}

        {/* Quick mark as conducted - only for past unstarted lessons */}
        {isPastUnstarted && statusAllowsConduct && onMarkConducted && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onMarkConducted(lesson))}
            className="text-green-400 focus:text-green-300 focus:bg-green-500/10 cursor-pointer"
            title="Mark this as conducted without entering detailed attendance."
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Quick mark as conducted
          </DropdownMenuItem>
        )}

        {/* Schedule replacement lesson - for cancelled lessons without makeup */}
        {canCreateMakeupLesson && onCreateMakeup && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onCreateMakeup(lesson))}
            className="text-purple-400 focus:text-purple-300 focus:bg-purple-500/10 cursor-pointer"
            title="Add an extra lesson to compensate for this cancelled lesson."
          >
            <Repeat className="mr-2 h-4 w-4" />
            Schedule replacement lesson…
          </DropdownMenuItem>
        )}

        {/* Separator before View details if there are other actions */}
        {(canQuickCancelLesson || (canReschedule && !isPastUnstarted) || (isPastUnstarted && statusAllowsConduct) || canCreateMakeupLesson) && onViewDetails && (
          <DropdownMenuSeparator className="bg-white/10" />
        )}

        {/* View details - always available */}
        {onViewDetails && (
          <DropdownMenuItem
            onClick={(e) => handleMenuClick(e, () => onViewDetails(lesson))}
            className="text-white focus:text-white focus:bg-white/10 cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            View details…
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LessonRowActionsMenu;
