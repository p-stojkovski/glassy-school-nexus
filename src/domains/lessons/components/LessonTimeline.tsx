import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  RotateCcw,
  UserX,
  Play,
  Ban,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { LessonResponse, LessonStatusName } from '@/types/api/lesson';
import LessonStatusBadge from './LessonStatusBadge';
import { canTransitionToStatus } from '@/types/api/lesson';

interface LessonTimelineProps {
  lessons: LessonResponse[];
  loading?: boolean;
  groupByMonth?: boolean;
  showActions?: boolean;
  maxItems?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  onViewLesson?: (lesson: LessonResponse) => void;
  onConductLesson?: (lesson: LessonResponse) => void;
  onCancelLesson?: (lesson: LessonResponse) => void;
  onCreateMakeup?: (lesson: LessonResponse) => void;
  // Quick action handlers - these are the actual handlers that will trigger modals
  onQuickConduct?: (lesson: LessonResponse) => void;
  onQuickCancel?: (lesson: LessonResponse) => void;
}

const LessonTimeline: React.FC<LessonTimelineProps> = ({
  lessons,
  loading = false,
  groupByMonth = true,
  showActions = true,
  maxItems,
  emptyMessage = "No lessons available",
  emptyDescription = "There are no lessons to display in the timeline.",
  onViewLesson,
  onConductLesson,
  onCancelLesson,
  onCreateMakeup,
  onQuickConduct,
  onQuickCancel,
}) => {
  // Sort lessons by date (newest first for timeline view)
  const sortedLessons = [...lessons].sort((a, b) => 
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

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
    return `${dayName}, ${dateStr} • ${lesson.startTime} - ${lesson.endTime}`;
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

  const getTimelineIndicatorColor = (status: LessonStatusName) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-400';
      case 'Conducted': return 'bg-green-400';
      case 'Cancelled': return 'bg-red-400';
      case 'Make Up': return 'bg-purple-400';
      case 'No Show': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const canQuickConductLesson = (lesson: LessonResponse) => {
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  };

  const canQuickCancelLesson = (lesson: LessonResponse) => {
    return lesson.statusName === 'Scheduled' || lesson.statusName === 'Make Up';
  };

  const canCreateMakeupLesson = (lesson: LessonResponse) => {
    return lesson.statusName === 'Cancelled' && !lesson.makeupLessonId;
  };

  const renderQuickActions = (lesson: LessonResponse) => {
    if (!showActions) return null;

    const actions = [];

    // Quick conduct action
    if (canQuickConductLesson(lesson) && onQuickConduct) {
      actions.push(
        <Button
          key="conduct"
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onQuickConduct(lesson);
          }}
          className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-1 h-8 w-8"
          title="Mark as conducted"
        >
          <Play className="w-3 h-3" />
        </Button>
      );
    }

    // Quick cancel action
    if (canQuickCancelLesson(lesson) && onQuickCancel) {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onQuickCancel(lesson);
          }}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
          title="Cancel lesson"
        >
          <Ban className="w-3 h-3" />
        </Button>
      );
    }

    // Create makeup action
    if (canCreateMakeupLesson(lesson) && onCreateMakeup) {
      actions.push(
        <Button
          key="makeup"
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onCreateMakeup(lesson);
          }}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-1 h-8 w-8"
          title="Create makeup lesson"
        >
          <Repeat className="w-3 h-3" />
        </Button>
      );
    }


    return actions.length > 0 ? (
      <div className="flex items-center gap-1">
        {actions}
        {onViewLesson && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewLesson(lesson);
            }}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
            title="View details"
          >
            <Eye className="w-3 h-3" />
          </Button>
        )}
      </div>
    ) : (
      onViewLesson && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onViewLesson(lesson);
          }}
          className="text-white/70 hover:text-white hover:bg-white/10"
          title="View details"
        >
          View
        </Button>
      )
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
    <div className="space-y-6">
      {Object.entries(groupedLessons).map(([monthKey, monthLessons], monthIndex) => (
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: monthIndex * 0.1 }}
        >
          {groupByMonth && monthKey !== 'All Lessons' && (
            <div className="flex items-center gap-4 mb-4">
              <h4 className="text-lg font-semibold text-white">{monthKey}</h4>
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-sm text-white/60">{monthLessons.length} lessons</span>
            </div>
          )}

          <div className="space-y-3">
            {monthLessons.map((lesson, lessonIndex) => {
              const StatusIcon = getStatusIcon(lesson.statusName);
              const isLastInGroup = lessonIndex === monthLessons.length - 1;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (monthIndex * 0.1) + (lessonIndex * 0.05) }}
                  className="relative"
                >
                  <GlassCard 
                    className="p-4 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                    onClick={() => onViewLesson?.(lesson)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Timeline Indicator */}
                        <div className="relative flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getTimelineIndicatorColor(lesson.statusName)} flex-shrink-0`} />
                          {!isLastInGroup && (
                            <div className="w-px h-8 bg-white/20 mt-2" />
                          )}
                        </div>

                        {/* Lesson Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <div className="text-white font-medium">
                              {formatLessonDateTime(lesson)}
                            </div>
                            <LessonStatusBadge 
                              status={lesson.statusName} 
                              size="sm" 
                            />
                            {lesson.makeupLessonId && (
                              <Badge 
                                variant="outline" 
                                className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs flex items-center gap-1"
                              >
                                <Repeat className="w-3 h-3" />
                                Has Makeup
                              </Badge>
                            )}
                            {lesson.originalLessonId && (
                              <Badge 
                                variant="outline" 
                                className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Makeup
                              </Badge>
                            )}
                            {isUpcoming(lesson) && (
                              <Badge 
                                variant="outline" 
                                className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs"
                              >
                                Upcoming
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-white/60 mb-1">
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

                          {lesson.notes && (
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

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 ml-4">
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
