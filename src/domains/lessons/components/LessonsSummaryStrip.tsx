import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { LessonResponse, LessonSummary } from '@/types/api/lesson';

interface LessonsSummaryStripProps {
  summary: LessonSummary;
  nextLesson: LessonResponse | null;
  onUpcomingClick?: () => void;
  onCompletedClick?: () => void;
  onNextLessonClick?: () => void;
}

const LessonsSummaryStrip: React.FC<LessonsSummaryStripProps> = ({
  summary,
  nextLesson,
  onUpcomingClick,
  onCompletedClick,
  onNextLessonClick,
}) => {
  const formatNextLesson = (lesson: LessonResponse): string => {
    const date = new Date(lesson.scheduledDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    // Remove seconds from time display
    const startTime = lesson.startTime.substring(0, 5);
    const endTime = lesson.endTime.substring(0, 5);
    return `${dayName}, ${dateStr} · ${startTime}–${endTime}`;
  };

  const isToday = (lesson: LessonResponse | null): boolean => {
    if (!lesson) return false;
    const today = new Date();
    const lessonDate = new Date(lesson.scheduledDate);
    return (
      today.getFullYear() === lessonDate.getFullYear() &&
      today.getMonth() === lessonDate.getMonth() &&
      today.getDate() === lessonDate.getDate()
    );
  };

  const isTomorrow = (lesson: LessonResponse | null): boolean => {
    if (!lesson) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const lessonDate = new Date(lesson.scheduledDate);
    return (
      tomorrow.getFullYear() === lessonDate.getFullYear() &&
      tomorrow.getMonth() === lessonDate.getMonth() &&
      tomorrow.getDate() === lessonDate.getDate()
    );
  };

  const nextLessonDisplay = nextLesson 
    ? formatNextLesson(nextLesson) 
    : "No upcoming lessons";

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button
          onClick={onNextLessonClick}
          disabled={!nextLesson}
          className="inline-flex items-center gap-2 px-2 py-1 -ml-2 rounded hover:bg-white/10 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
        >
          <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-white/60">Next lesson</span>
          <span className="text-white/40">·</span>
          <span className="font-medium text-white">
            {nextLessonDisplay}
          </span>
          {isToday(nextLesson) && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              Today
            </Badge>
          )}
          {isTomorrow(nextLesson) && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              Tomorrow
            </Badge>
          )}
        </button>
        <span className="text-white/40">·</span>
        <button
          onClick={onUpcomingClick}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="text-white/60">Upcoming:</span>
          <span className="font-semibold text-white">{summary.scheduledLessons}</span>
        </button>
        <span className="text-white/40">·</span>
        <button
          onClick={onCompletedClick}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="text-white/60">Completed:</span>
          <span className="font-semibold text-white">{summary.completedLessons}</span>
        </button>
      </div>
    </GlassCard>
  );
};

export default LessonsSummaryStrip;
