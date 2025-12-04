import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  RotateCcw,
  UserX,
  Repeat,
  AlertTriangle,
  Play,
  Edit3,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import GlassCard from '@/components/common/GlassCard';
import { LessonResponse, LessonStatusName } from '@/types/api/lesson';
import { isPastUnstartedLesson, canConductLesson, getCannotConductReason, DEFAULT_CONDUCT_GRACE_MINUTES } from '@/domains/lessons/lessonMode';
import LessonStatusBadge from './LessonStatusBadge';
import LessonStatusChips from './LessonStatusChips';
import LessonRowActionsMenu from './LessonRowActionsMenu';

/**
 * System-generated note that should be hidden from UI display.
 * This note is auto-created when ending a lesson via teaching mode without explicit notes.
 */
const SYSTEM_TEACHING_MODE_NOTE = 'Lesson completed via teaching mode';

/**
 * Checks if a note is a system-generated technical note that should be hidden.
 * These notes don't provide meaningful content for teachers.
 */
const isSystemTeachingModeNote = (note?: string | null): boolean =>
  note?.trim() === SYSTEM_TEACHING_MODE_NOTE;

interface LessonTimelineProps {
  lessons: LessonResponse[];
  loading?: boolean;
  groupByMonth?: boolean;
  showActions?: boolean;
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
  onViewLesson?: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  onStartTeaching?: (lesson: LessonResponse) => void;
  // Quick action handlers - these are the actual handlers that will trigger modals
  onQuickConduct?: (lesson: LessonResponse) => void;
  onQuickCancel?: (lesson: LessonResponse) => void;
  onQuickReschedule?: (lesson: LessonResponse) => void;
  /** Sorting direction for timeline. Defaults to 'desc' (newest first). */
  sortDirection?: 'asc' | 'desc';
}

const LessonTimeline: React.FC<LessonTimelineProps> = ({
  lessons,
  loading = false,
  groupByMonth = true,
  showActions = true,
  maxItems,
  emptyMessage = "No lessons available",
  emptyDescription = "There are no lessons to display in the timeline.",
  nextLesson = null,
  showTeacherName = true,
  onViewLesson,
  onConductLesson,
  onCancelLesson,
  onCreateMakeup,
  onStartTeaching,
  onQuickConduct,
  onQuickCancel,
  onQuickReschedule,
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

  const isUpcoming = (lesson: LessonResponse) => {
    return new Date(lesson.scheduledDate) > new Date() && lesson.statusName === 'Scheduled';
  };

  const getStatusIcon = (status: LessonStatusName) => {
    switch (status) {
      case 'Scheduled': return Calendar;
      case 'Conducted': return CheckCircle;
      case 'Cancelled': return XCircle;
      case 'Make Up': return RotateCcw;
      case 'No Show': return UserX;
      default: return Calendar;
    }
  };

  const getTimelineIndicatorColor = (lesson: LessonResponse) => {
    // Check if this is a past unstarted lesson - show amber/warning color (clear attention)
    const isPastUnstarted = isPastUnstartedLesson(
      lesson.statusName,
      lesson.scheduledDate,
      lesson.endTime
    );
    if (isPastUnstarted) return 'bg-amber-400';
    
    // Timeline dots use softer colors to reduce visual noise
    switch (lesson.statusName) {
      case 'Scheduled': return 'bg-slate-400';
      case 'Conducted': return 'bg-emerald-400';
      case 'Cancelled': return 'bg-rose-400';
      case 'Make Up': return 'bg-violet-400';
      case 'No Show': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  /**
   * Determines the primary CTA for a lesson based on its state.
   * Returns: { label, icon, action, disabled, tooltip, variant }
   */
  const getPrimaryCTA = (lesson: LessonResponse) => {
    const isPastUnstarted = isPastUnstartedLesson(
      lesson.statusName,
      lesson.scheduledDate,
      lesson.endTime
    );
    
    const isScheduledOrMakeUp = lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
    const isConducted = lesson.statusName === 'Conducted';
    const isCancelledOrNoShow = lesson.statusName === 'Cancelled' || lesson.statusName === 'No Show';
    
    const canConduct = canConductLesson(
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

    // 1. Past unstarted lesson - "Document Lesson"
    if (isPastUnstarted) {
      return {
        label: 'Document Lesson',
        icon: Edit3,
        action: () => onStartTeaching?.(lesson),
        disabled: false,
        tooltip: null,
        variant: 'amber' as const, // Warning style for attention-required action
      };
    }

    // 2. Upcoming Scheduled/Make Up within conduct window - "Start Teaching"
    if (isScheduledOrMakeUp && canConduct) {
      return {
        label: 'Start Teaching',
        icon: Play,
        action: () => onStartTeaching?.(lesson),
        disabled: false,
        tooltip: null,
        variant: 'blue' as const, // Primary style for standard action
      };
    }

    // 3. Upcoming Scheduled/Make Up before conduct window - "View Lesson" (Start Teaching disabled)
    if (isScheduledOrMakeUp && !canConduct) {
      return {
        label: 'View Lesson',
        icon: Eye,
        action: () => onViewLesson?.(lesson),
        disabled: false,
        tooltip: conductDisabledReason,
        variant: 'ghost' as const, // Neutral style for non-primary action
      };
    }

    // 4. Conducted lesson - "View Summary"
    if (isConducted) {
      return {
        label: 'View Summary',
        icon: Eye,
        action: () => onStartTeaching?.(lesson), // Navigate to teaching mode for editing
        disabled: false,
        tooltip: null,
        variant: 'blue' as const,
      };
    }

    // 5. Cancelled/No Show - "View Summary"
    if (isCancelledOrNoShow) {
      return {
        label: 'View Summary',
        icon: Eye,
        action: () => onViewLesson?.(lesson),
        disabled: false,
        tooltip: null,
        variant: 'ghost' as const,
      };
    }

    // Fallback
    return {
      label: 'View',
      icon: Eye,
      action: () => onViewLesson?.(lesson),
      disabled: false,
      tooltip: null,
      variant: 'ghost' as const,
    };
  };

  const renderPrimaryCTA = (lesson: LessonResponse) => {
    if (!showActions) return null;
    
    const cta = getPrimaryCTA(lesson);
    const Icon = cta.icon;
    
    // Unified button styles - calmer, consistent color hierarchy:
    // - 'blue' (primary): Standard actions like Start Teaching, View Summary
    // - 'amber' (warning): Attention-required actions like Document Lesson (stands out clearly)
    // - 'ghost': Neutral/secondary actions (blends into background)
    const variantClasses = {
      amber: 'bg-amber-500/25 text-amber-200 hover:bg-amber-500/35 border-amber-500/40 font-medium',
      blue: 'bg-sky-600/15 text-sky-300 hover:bg-sky-600/25 border-sky-600/25',
      ghost: 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80 border-white/[0.08]',
    };
    
    const button = (
      <Button
        size="sm"
        variant="outline"
        disabled={cta.disabled}
        onClick={(e) => {
          e.stopPropagation();
          cta.action();
        }}
        className={`h-7 px-2 text-xs font-medium ${variantClasses[cta.variant]} border`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {cta.label}
      </Button>
    );
    
    if (cta.tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 border-white/20 text-white text-xs max-w-[200px]">
              {cta.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return button;
  };

  const renderQuickActions = (lesson: LessonResponse) => {
    if (!showActions) return null;

    return (
      <LessonRowActionsMenu
        lesson={lesson}
        onMarkConducted={onQuickConduct}
        onCancelLesson={onQuickCancel}
        onRescheduleLesson={onQuickReschedule}
        onCreateMakeup={onCreateMakeup}
        onViewDetails={onViewLesson}
      />
    );
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
                const StatusIcon = getStatusIcon(lesson.statusName);
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
                      className={`w-full py-2.5 px-3 hover:bg-white/[0.04] transition-all duration-150 cursor-pointer ${
                        isNextLesson ? 'border-l-2 border-sky-400/60 pl-2.5' : ''
                      } ${isPastUnstarted ? 'border-l-2 border-amber-400/70 pl-2.5' : ''}`}
                      onClick={() => onViewLesson?.(lesson)}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
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
                            {/* Show warning badge for past unstarted lessons - clear attention indicator */}
                            {isPastUnstarted && (
                              <Badge 
                                variant="outline" 
                                className="bg-amber-500/25 text-amber-200 border-amber-500/35 text-xs flex items-center gap-1 font-medium"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Needs Documentation
                              </Badge>
                            )}
                            {/* Only show status badge for exceptions, not for regular Scheduled lessons */}
                            {!isPastUnstarted && lesson.statusName !== 'Scheduled' && (
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
                            {!isPastUnstarted && isUpcoming(lesson) && (
                              <Badge 
                                variant="outline" 
                                className="bg-slate-500/15 text-slate-300 border-slate-500/20 text-xs"
                              >
                                Upcoming
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
                              <span className="font-medium">Cancelled:</span> {lesson.cancellationReason}
                            </p>
                          )}

                        </div>
                      </div>

                      {/* Actions Area - Primary CTA + Menu */}
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {renderPrimaryCTA(lesson)}
                        {renderQuickActions(lesson)}
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

