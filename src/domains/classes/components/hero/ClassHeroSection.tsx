import React from 'react';
import { 
  Play, 
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClassBasicInfoResponse, ClassResponse } from '@/types/api/class';
import { LessonResponse } from '@/types/api/lesson';
import { UseClassLessonContextResult } from '@/domains/classes/hooks/useClassLessonContext';
import { formatTimeRangeWithoutSeconds } from '@/utils/timeFormatUtils';
import { cn } from '@/lib/utils';
import { DEFAULT_CONDUCT_GRACE_MINUTES, canConductLesson, getCannotConductReason } from '@/domains/lessons/lessonMode';

interface ClassHeroSectionProps {
  classData: ClassBasicInfoResponse | ClassResponse;
  lessonContext: UseClassLessonContextResult;
  onStartTeaching?: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
}

/**
 * Compact lesson action bar for ClassPage
 * Shows lesson status, progress, and primary CTA
 */
const ClassHeroSection: React.FC<ClassHeroSectionProps> = ({
  classData,
  lessonContext,
  onStartTeaching,
  onConductLesson,
  onCancelLesson,
}) => {
  const { currentLesson, nextLesson, lessonState } = lessonContext;

  // Calculate progress percentage
  const { lessonSummary } = classData;
  const totalLessons = lessonSummary?.totalLessons || 0;
  const conductedLessons = lessonSummary?.conductedLessons || 0;
  const completionPercentage = totalLessons > 0 
    ? Math.round((conductedLessons / totalLessons) * 100) 
    : 0;

  // Determine which lesson actions are available
  const lesson = currentLesson || nextLesson;
  const canShowLessonActions = lesson && (lessonState === 'active' || lessonState === 'upcoming_today' || lessonState === 'upcoming_future');
  const canConduct = lesson && (lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up');
  const canCancel = lesson && (lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up');
  const conductAllowed = lesson
    ? canConductLesson(lesson.statusName, lesson.scheduledDate, lesson.startTime, DEFAULT_CONDUCT_GRACE_MINUTES)
    : false;
  const conductBlockedReason = lesson
    ? getCannotConductReason(lesson.statusName, lesson.scheduledDate, lesson.startTime, DEFAULT_CONDUCT_GRACE_MINUTES)
    : null;

  // Format lesson time
  const formatLessonTime = () => {
    if (!lesson) return null;
    return formatTimeRangeWithoutSeconds(lesson.startTime, lesson.endTime);
  };

  // Get status indicator config
  const getStatusConfig = () => {
    switch (lessonState) {
      case 'active':
        return {
          dot: 'bg-green-500 animate-pulse',
          text: 'In Progress',
          textColor: 'text-green-400'
        };
      case 'upcoming_today':
        return {
          dot: 'bg-blue-500',
          text: 'Today',
          textColor: 'text-blue-400'
        };
      case 'upcoming_future':
        return {
          dot: 'bg-indigo-500',
          text: 'Scheduled',
          textColor: 'text-indigo-400'
        };
      case 'completed':
        return {
          dot: 'bg-purple-500',
          text: 'Complete',
          textColor: 'text-purple-400'
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Left: Progress & Status */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Progress Circle/Badge */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/10"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${completionPercentage * 1.256} 125.6`}
                    strokeLinecap="round"
                    className="text-green-500 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{completionPercentage}%</span>
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="text-sm text-white/60">
                  {conductedLessons} / {totalLessons} lessons
                </div>
                {totalLessons === 0 && (
                  <div className="text-xs text-white/40">No lessons scheduled</div>
                )}
              </div>
            </div>

            {/* Divider */}
            {lesson && <div className="hidden sm:block h-8 w-px bg-white/10" />}

            {/* Current/Next Lesson Info */}
            {lesson && (
              <div className="flex items-center gap-3 min-w-0">
                {statusConfig && (
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', statusConfig.dot)} />
                    <span className={cn('text-xs font-medium uppercase tracking-wide', statusConfig.textColor)}>
                      {statusConfig.text}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium">{formatLessonTime()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Lesson Actions Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Lesson Actions Kebab Menu */}
            {canShowLessonActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-52 bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-1.5"
                >
                  {/* Start Teaching - for scheduled lessons */}
                  {lesson && onStartTeaching && (
                    <DropdownMenuItem
                      onClick={() => conductAllowed && onStartTeaching(lesson)}
                      disabled={!conductAllowed}
                      title={conductBlockedReason || 'Open teaching mode'}
                      className="gap-2.5 cursor-pointer text-blue-400 hover:text-blue-300 focus:text-blue-300 focus:bg-blue-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">Start Teaching</span>
                    </DropdownMenuItem>
                  )}

                  {/* Mark as Conducted */}
                  {canConduct && onConductLesson && (
                    <DropdownMenuItem
                      onClick={() => conductAllowed && onConductLesson(lesson!)}
                      disabled={!conductAllowed}
                      title={conductBlockedReason || 'Mark as conducted'}
                      className="gap-2.5 cursor-pointer text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 focus:bg-emerald-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Mark as Conducted</span>
                    </DropdownMenuItem>
                  )}

                  {/* Separator before destructive action */}
                  {canCancel && onCancelLesson && (canConduct || onStartTeaching) && (
                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                  )}

                  {/* Cancel Lesson */}
                  {canCancel && onCancelLesson && (
                    <DropdownMenuItem
                      onClick={() => onCancelLesson(lesson!)}
                      className="gap-2.5 cursor-pointer text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">Cancel Lesson</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHeroSection;

