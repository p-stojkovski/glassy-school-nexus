import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetOverlay,
  SheetPortal,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  MoreVertical,
  X,
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import GlassCard from '@/components/common/GlassCard';
import { cn } from '@/lib/utils';
import { DEFAULT_CONDUCT_GRACE_MINUTES, canConductLesson as canConductLessonNow, getCannotConductReason } from '../../lessonMode';

interface DailyLessonsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  lessons: LessonResponse[];
  onLessonClick: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onLessonsUpdated?: () => void;
}

const DailyLessonsSheet: React.FC<DailyLessonsSheetProps> = ({
  open,
  onOpenChange,
  date,
  lessons,
  onLessonClick,
  onConductLesson,
  onCancelLesson,
  onLessonsUpdated,
}) => {
  if (!date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const parts = time.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
  };

  const handleLessonClick = (lesson: LessonResponse) => {
    onOpenChange(false);
    onLessonClick(lesson);
  };

  const handleConductLesson = async (e: React.MouseEvent, lesson: LessonResponse) => {
    e.stopPropagation();
    if (onConductLesson) {
      await onConductLesson(lesson);
      if (onLessonsUpdated) {
        onLessonsUpdated();
      }
    }
  };

  const handleCancelLesson = async (e: React.MouseEvent, lesson: LessonResponse) => {
    e.stopPropagation();
    if (onCancelLesson) {
      await onCancelLesson(lesson);
      if (onLessonsUpdated) {
        onLessonsUpdated();
      }
    }
  };

  const canConductLesson = (lesson: LessonResponse) => {
    return canConductLessonNow(
      lesson.statusName,
      lesson.scheduledDate,
      lesson.startTime,
      DEFAULT_CONDUCT_GRACE_MINUTES
    );
  };

  const canCancelLesson = (lesson: LessonResponse) => {
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  };

  // Check if today
  const isToday = date.toDateString() === new Date().toDateString();

  // Sort lessons by start time
  const sortedLessons = [...lessons].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  // Detect common metadata across all lessons
  const getCommonTeacher = () => {
    if (lessons.length === 0) return null;
    const firstTeacher = lessons[0].teacherName;
    return lessons.every(l => l.teacherName === firstTeacher) ? firstTeacher : null;
  };

  const getCommonSubject = () => {
    if (lessons.length === 0) return null;
    const firstSubject = lessons[0].subjectName;
    return lessons.every(l => l.subjectName === firstSubject) ? firstSubject : null;
  };

  const commonTeacher = getCommonTeacher();
  const commonSubject = getCommonSubject();
  const hasVariedMetadata = !commonTeacher || !commonSubject;

  // Get next upcoming lesson if viewing today
  const getNextLesson = () => {
    if (!isToday) return null;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return sortedLessons.find(l => l.startTime >= currentTime);
  };

  const nextLessonId = getNextLesson()?.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay className="bg-black/20" />
        <SheetContent
          side="right"
          hideCloseButton
          className="w-full sm:w-[500px] sm:max-w-[500px] lg:w-[550px] lg:max-w-[550px] bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl p-0"
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <SheetHeader className="px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <SheetTitle className="text-base font-semibold text-white truncate">
                      Lessons for {formatDate(date)}
                    </SheetTitle>
                    {isToday && (
                      <span className="text-xs font-medium uppercase tracking-wide text-blue-300 bg-blue-500/30 px-1.5 py-0.5 rounded flex-shrink-0">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/60 truncate">
                    {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                    {commonTeacher && ` · ${commonTeacher}`}
                    {commonSubject && ` · ${commonSubject}`}
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </SheetHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-2">
                {sortedLessons.length === 0 ? (
                  <GlassCard className="p-6">
                    <div className="text-center">
                      <Clock className="w-10 h-10 text-white/40 mx-auto mb-3" />
                      <h4 className="text-base font-semibold text-white mb-1">
                        No Lessons Scheduled
                      </h4>
                      <p className="text-white/60 text-sm">
                        There are no lessons scheduled for this date.
                      </p>
                    </div>
                  </GlassCard>
                ) : (
                  <div className="space-y-2">
                    {sortedLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/8 hover:border-white/10 transition-all cursor-pointer group",
                          lesson.id === nextLessonId && "border-l-2 border-l-blue-400"
                        )}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {/* Time Block - Compact */}
                        <div className="flex-shrink-0 text-center bg-white/10 rounded-lg px-2 py-1.5 min-w-[70px]">
                          <div className="text-xs font-semibold text-white leading-tight">
                            {formatTime(lesson.startTime)}
                          </div>
                          <div className="text-[10px] text-white/40 leading-tight">
                            {formatTime(lesson.endTime)}
                          </div>
                        </div>

                        {/* Lesson Info - Compact */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-white font-semibold text-sm truncate">
                              {lesson.className}
                            </h4>
                            {lesson.id === nextLessonId && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-300 bg-blue-500/30 px-1 py-0.5 rounded flex-shrink-0">
                                Next
                              </span>
                            )}
                            <LessonStatusBadge status={lesson.statusName} size="sm" />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-white/60">
                            {hasVariedMetadata && (
                              <span className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 flex-shrink-0" />
                                {lesson.teacherName}
                              </span>
                            )}
                            {lesson.classroomName && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {lesson.classroomName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Primary Action */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                            className="text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 px-2 py-1 h-7"
                          >
                            Open
                          </Button>
                          {(lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up' || canCancelLesson(lesson)) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-7 w-7"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-900/95 border-white/10">
                                {onConductLesson && (lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up') && (
                                  <DropdownMenuItem
                                    onClick={(e) => handleConductLesson(e, lesson)}
                                    disabled={!canConductLesson(lesson)}
                                    title={
                                      getCannotConductReason(
                                        lesson.statusName,
                                        lesson.scheduledDate,
                                        lesson.startTime,
                                        DEFAULT_CONDUCT_GRACE_MINUTES
                                      ) || 'Mark as conducted'
                                    }
                                    className="text-green-400 focus:text-green-300 focus:bg-green-500/20"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Conducted
                                  </DropdownMenuItem>
                                )}
                                {canCancelLesson(lesson) && onCancelLesson && (
                                  <DropdownMenuItem
                                    onClick={(e) => handleCancelLesson(e, lesson)}
                                    className="text-red-400 focus:text-red-300 focus:bg-red-500/20"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Lesson
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};

export default DailyLessonsSheet;
