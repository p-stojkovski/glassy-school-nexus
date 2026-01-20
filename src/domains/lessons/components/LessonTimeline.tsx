import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Calendar,
  RotateCcw,
  Repeat,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { LessonResponse } from '@/types/api/lesson';
import { isPastUnstartedLesson } from '@/domains/lessons/lessonMode';
import LessonStatusBadge from './LessonStatusBadge';
import LessonStatusChips from './LessonStatusChips';

/**
 * System-generated notes that should be hidden from UI display.
 * These notes are auto-created when ending a lesson via teaching mode or teacher dashboard without explicit notes.
 */
const SYSTEM_NOTES_TO_HIDE = [
  'Lesson completed via teaching mode',
  'Lesson completed via teacher dashboard',
];

/**
 * Checks if a note is a system-generated technical note that should be hidden.
 * These notes don't provide meaningful content for teachers.
 */
const isSystemTeachingModeNote = (note?: string | null): boolean =>
  note?.trim() ? SYSTEM_NOTES_TO_HIDE.includes(note.trim()) : false;

interface LessonTimelineProps {
  lessons: LessonResponse[];
  loading?: boolean;
  groupByMonth?: boolean;
  maxItems?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  nextLesson?: LessonResponse | null;
  /**
   * Whether to show the teacher name on each lesson card.
   * Set to false in contexts where the teacher is already known (e.g., Class Lessons tab).
   * @default true
   */
  showTeacherName?: boolean;
  /**
   * Whether to show the semester badge on each lesson row.
   * Defaults to true; the Class Lessons tab hides it by passing false.
   */
  showSemesterBadge?: boolean;
  /** Handler for row click - navigates to teaching/detail page */
  onLessonClick?: (lesson: LessonResponse) => void;
  /** Sorting direction for timeline. Defaults to 'desc' (newest first). */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Renders a semester badge with context-aware styling.
 */
const SemesterBadge: React.FC<{ lesson: LessonResponse }> = ({ lesson }) => {
  if (lesson.semesterDeleted) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
        {lesson.semesterName} (Deleted)
      </span>
    );
  }

  if (lesson.semesterId && lesson.semesterName) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
        {lesson.semesterName}
      </span>
    );
  }

  // Unassigned or outside semester dates
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/5 text-white/40 border border-white/10">
      -
    </span>
  );
};

const LessonTimeline: React.FC<LessonTimelineProps> = ({
  lessons,
  loading = false,
  groupByMonth = true,
  maxItems,
  emptyMessage = "No lessons available",
  emptyDescription = "There are no lessons to display in the timeline.",
  nextLesson = null,
  showTeacherName = true,
  showSemesterBadge = true,
  onLessonClick,
  sortDirection = 'desc',
}) => {
  // Sort lessons by date/time, defaulting to newest first for existing contexts
  const sortedLessons = [...lessons].sort((a, b) => {
    const dateDiff = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    if (dateDiff !== 0) {
      return sortDirection === 'asc' ? dateDiff : -dateDiff;
    }
    const timeDiff = a.startTime.localeCompare(b.startTime);
    return sortDirection === 'asc' ? timeDiff : -timeDiff;
  });

  // Apply max items limit if specified
  const displayLessons = maxItems ? sortedLessons.slice(0, maxItems) : sortedLessons;

  // Group lessons by month if enabled
  const groupedLessons = groupByMonth 
    ? displayLessons.reduce((groups, lesson) => {
        const monthKey = new Date(lesson.scheduledDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(lesson);
        return groups;
      }, {} as Record<string, LessonResponse[]>)
    : { 'All Lessons': displayLessons };

  const formatLessonDateTime = (lesson: LessonResponse) => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    // Remove seconds from time display
    const startTime = lesson.startTime.substring(0, 5);
    const endTime = lesson.endTime.substring(0, 5);
    return `${dayName}, ${dateStr} · ${startTime}–${endTime}`;
  };

  const getTimelineIndicatorColor = (lesson: LessonResponse) => {
    // Check if this is a past unstarted lesson - show amber/warning color (clear attention)
    const isPastUnstarted = isPastUnstartedLesson(
      lesson.statusName,
      lesson.scheduledDate,
      lesson.endTime
    );
    if (isPastUnstarted) return 'bg-amber-400/60';

    // Timeline dots use softer colors to reduce visual noise
    switch (lesson.statusName) {
      case 'Scheduled': return 'bg-slate-400/50';
      case 'Conducted': return 'bg-emerald-400/50';
      case 'Cancelled': return 'bg-rose-400/50';
      case 'Make Up': return 'bg-violet-400/50';
      case 'No Show': return 'bg-slate-500/50';
      default: return 'bg-slate-500/50';
    }
  };

  // Empty state
  if (displayLessons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <GlassCard className="p-8">
          <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {emptyMessage}
          </h3>
          <p className="text-white/60 text-sm">
            {emptyDescription}
          </p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {Object.entries(groupedLessons).map(([monthKey, monthLessons], monthIndex) => (
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: monthIndex * 0.1 }}
          className="w-full"
        >
          {groupByMonth && monthKey !== 'All Lessons' && (
            <div className="mb-3">
              <h4 className="text-base font-medium text-white/80">
                {monthKey} <span className="text-sm text-white/50">({monthLessons.length})</span>
              </h4>
            </div>
          )}

          <div className="space-y-3 w-full">
              {monthLessons.map((lesson, lessonIndex) => {
                const isNextLesson = nextLesson?.id === lesson.id;
                const isPastUnstarted = isPastUnstartedLesson(
                  lesson.statusName,
                  lesson.scheduledDate,
                  lesson.endTime
                );

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (monthIndex * 0.1) + (lessonIndex * 0.05) }}
                    className="relative w-full"
                    data-lesson-id={lesson.id}
                  >
                    <GlassCard
                      className={`w-full py-2.5 px-3 hover:bg-white/10 transition-colors cursor-pointer group ${
                        isNextLesson ? 'border-l-2 border-sky-400/60 pl-2.5' : ''
                      } ${isPastUnstarted ? 'border-l-4 border-l-amber-500/40 bg-amber-500/5 pl-2.5' : ''}`}
                      onClick={() => onLessonClick?.(lesson)}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Timeline Indicator */}
                        <div className="relative flex items-center justify-center w-3 flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${getTimelineIndicatorColor(lesson)} z-10`} />
                        </div>

                        {/* Lesson Content */}
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-3 flex-wrap ${lesson.statusName === 'Conducted' || (showTeacherName) || lesson.notes || lesson.cancellationReason ? 'mb-1' : ''}`}>
                            <div className="text-white font-medium text-sm">
                              {formatLessonDateTime(lesson)}
                            </div>
                            {/* Semester badge */}
                            {showSemesterBadge && <SemesterBadge lesson={lesson} /> }
                            {/* Only show status badge for exceptions, not for regular Scheduled or Conducted lessons */}
                            {!isPastUnstarted && lesson.statusName !== 'Scheduled' && lesson.statusName !== 'Conducted' && (
                              <LessonStatusBadge
                                status={lesson.statusName}
                                size="sm"
                              />
                            )}
                            {lesson.makeupLessonId && (
                              <Badge
                                variant="outline"
                                className="bg-violet-500/15 text-violet-300 border-violet-500/20 text-xs flex items-center gap-1"
                              >
                                <Repeat className="w-3 h-3" />
                                Has Makeup
                              </Badge>
                            )}
                            {lesson.originalLessonId && (
                              <Badge
                                variant="outline"
                                className="bg-violet-500/15 text-violet-300 border-violet-500/20 text-xs flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Makeup
                              </Badge>
                            )}
                          </div>

                          {/* Status Chips for conducted lessons only */}
                          {lesson.statusName === 'Conducted' && (
                            <div className="mb-2">
                              <LessonStatusChips lesson={lesson} />
                            </div>
                          )}

                          {/* Teacher/Location row - only shown when showTeacherName is true (non-class contexts) */}
                          {showTeacherName && (
                            <div className="flex items-center gap-4 text-sm text-white/50 mb-1">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{lesson.teacherName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{lesson.classroomName}</span>
                              </div>
                              {lesson.generationSource && lesson.generationSource !== 'manual' && (
                                <span className="capitalize text-xs bg-white/10 px-2 py-1 rounded">
                                  {lesson.generationSource}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Notes - hide system-generated teaching mode note */}
                          {lesson.notes && !isSystemTeachingModeNote(lesson.notes) && (
                            <p className="text-sm text-white/70 mt-2 line-clamp-2">
                              {lesson.notes}
                            </p>
                          )}

                          {lesson.cancellationReason && (
                            <p className="text-sm text-red-300 mt-2">
                              <span className="font-medium">Reason:</span> {lesson.cancellationReason}
                            </p>
                          )}

                        </div>
                      </div>

                      {/* Navigation Arrow */}
                      <div className="flex items-center ml-2 flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Show more indicator if there are more lessons */}
      {maxItems && lessons.length > maxItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <div className="text-white/60 text-sm">
            Showing {maxItems} of {lessons.length} lessons
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonTimeline;

