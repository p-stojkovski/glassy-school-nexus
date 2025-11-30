import React from 'react';
import { motion } from 'framer-motion';
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
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  X,
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import LessonStatusBadge from '../LessonStatusBadge';
import GlassCard from '@/components/common/GlassCard';

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
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
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
            <SheetHeader className="px-4 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-lg font-semibold text-white truncate">
                      Lessons for {formatDate(date)}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white/60 text-sm">
                        {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} scheduled
                      </span>
                      {isToday && (
                        <span className="text-xs font-medium uppercase tracking-wide text-blue-300 bg-blue-500/30 px-1.5 py-0.5 rounded">
                          Today
                        </span>
                      )}
                    </div>
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
                    {sortedLessons.map((lesson, index) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group"
                          onClick={() => handleLessonClick(lesson)}
                        >
                          {/* Time Block - Compact */}
                          <div className="flex-shrink-0 text-center bg-white/10 rounded-lg px-3 py-2 min-w-[65px]">
                            <div className="text-sm font-bold text-white leading-tight">
                              {formatTime(lesson.startTime)}
                            </div>
                            <div className="text-[10px] text-white/50 leading-tight">
                              {formatTime(lesson.endTime)}
                            </div>
                          </div>

                          {/* Lesson Info - Compact */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium text-sm truncate">
                                {lesson.className}
                              </h4>
                              <LessonStatusBadge status={lesson.statusName} size="sm" />
                            </div>

                            <div className="flex items-center gap-3 text-xs text-white/60">
                              <span className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 flex-shrink-0" />
                                {lesson.teacherName}
                              </span>
                              {lesson.classroomName && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  {lesson.classroomName}
                                </span>
                              )}
                              {lesson.subjectName && (
                                <span className="hidden sm:inline text-white/40">
                                  {lesson.subjectName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Buttons - Horizontal */}
                          <div className="flex items-center gap-0.5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                            {canConductLesson(lesson) && onConductLesson && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleConductLesson(e, lesson)}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/20 p-1.5 h-7 w-7"
                                title="Mark as conducted"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {canCancelLesson(lesson) && onCancelLesson && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleCancelLesson(e, lesson)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 h-7 w-7"
                                title="Cancel lesson"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLessonClick(lesson);
                              }}
                              className="text-white/50 hover:text-white hover:bg-white/20 p-1.5 h-7 w-7"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-white/10 bg-white/5 p-4 flex-shrink-0">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};

export default DailyLessonsSheet;
