import React from 'react';
import { CheckCircle, AlertCircle, BookOpen, Users, StickyNote, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LessonResponse } from '@/types/api/lesson';
import { useLessonStatusMetrics } from '@/domains/lessons/hooks/useLessonStatusMetrics';
import { isPastUnstartedLesson } from '@/domains/lessons/lessonMode';

interface LessonStatusChipsProps {
  lesson: LessonResponse;
}

const LessonStatusChips: React.FC<LessonStatusChipsProps> = ({ lesson }) => {
  // Check if this is a past unstarted lesson
  const isPastUnstarted = isPastUnstartedLesson(
    lesson.statusName,
    lesson.scheduledDate,
    lesson.endTime
  );
  
  // Fetch metrics for conducted lessons OR past unstarted lessons (to show missing data)
  const shouldFetch = lesson.statusName === 'Conducted' || isPastUnstarted;
  const { homework, attendance, loading } = useLessonStatusMetrics(lesson.id, shouldFetch);

  // For past unstarted lessons, don't show any chips
  // The "Needs Documentation" badge in the main lesson row is sufficient
  if (isPastUnstarted) {
    return null;
  }

  // Don't show chips for non-conducted, non-past-unstarted lessons
  if (lesson.statusName !== 'Conducted') {
    return null;
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Notes Chip */}
      {lesson.notes?.trim() ? (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-300/70 border-green-500/20 text-xs flex items-center gap-1"
        >
          <StickyNote className="w-3 h-3" />
          Notes
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-white/5 text-white/40 border-white/10 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          No notes
        </Badge>
      )}

      {/* Homework Chip */}
      {homework?.hasHomework ? (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-300/70 border-blue-500/20 text-xs flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3" />
          Homework
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-white/5 text-white/40 border-white/10 text-xs flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3" />
          No homework
        </Badge>
      )}

      {/* Attendance Chip */}
      {attendance.allMarked ? (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-300/70 border-green-500/20 text-xs flex items-center gap-1"
        >
          <CheckCircle className="w-3 h-3" />
          {attendance.presentCount}/{attendance.totalStudents}
        </Badge>
      ) : attendance.someMarked ? (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-300/70 border-yellow-500/20 text-xs flex items-center gap-1"
        >
          <Users className="w-3 h-3" />
          Partial
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-white/5 text-white/40 border-white/10 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          No attendance
        </Badge>
      )}
    </div>
  );
};

export default LessonStatusChips;
