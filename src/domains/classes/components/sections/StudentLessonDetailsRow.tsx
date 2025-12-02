import React from 'react';
import { StudentLessonDetail } from '@/types/api/class';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Circle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface StudentLessonDetailsRowProps {
  lessons: StudentLessonDetail[];
  loading: boolean;
}

const StudentLessonDetailsRow: React.FC<StudentLessonDetailsRowProps> = ({ lessons, loading }) => {
  const getAttendanceBadge = (status?: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-400/30 text-xs">
          <Circle className="w-3 h-3 mr-1" />
          Not Marked
        </Badge>
      );
    }

    const configs = {
      present: { icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', label: 'Present' },
      absent: { icon: XCircle, color: 'bg-red-500/20 text-red-300 border-red-400/30', label: 'Absent' },
      late: { icon: Clock, color: 'bg-amber-500/20 text-amber-300 border-amber-400/30', label: 'Late' },
      excused: { icon: FileText, color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Excused' },
    };

    const config = configs[status.toLowerCase() as keyof typeof configs];
    if (!config) return <span className="text-white/60 text-xs">Unknown</span>;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getHomeworkBadge = (status?: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-400/30 text-xs">
          <Circle className="w-3 h-3 mr-1" />
          Not Checked
        </Badge>
      );
    }

    const configs = {
      complete: { icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', label: 'Complete' },
      partial: { icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-300 border-amber-400/30', label: 'Partial' },
      missing: { icon: XCircle, color: 'bg-red-500/20 text-red-300 border-red-400/30', label: 'Missing' },
    };

    const config = configs[status.toLowerCase() as keyof typeof configs];
    if (!config) return <span className="text-white/60 text-xs">Unknown</span>;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60" />
          Loading lesson details...
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-white/60 text-sm">
          No conducted lessons yet for this student.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-3">
      {/* Column Headers */}
      <div className="flex items-center gap-6 pb-2 mb-1 border-b border-white/10">
        <div className="flex-shrink-0 w-36 text-xs font-medium text-white/50">Date & Time</div>
        <div className="flex-shrink-0 w-24 text-xs font-medium text-white/50">Attendance</div>
        <div className="flex-shrink-0 w-24 text-xs font-medium text-white/50">Homework</div>
        <div className="flex-1 text-xs font-medium text-white/50">Comments</div>
      </div>

      {/* Lesson Rows */}
      <div className="space-y-0 max-h-96 overflow-y-auto pr-2">
        {lessons.map((lesson, index) => {
          const lessonDate = parseISO(lesson.lessonDate);
          const formattedDate = format(lessonDate, 'MMM dd, yyyy');

          return (
            <div
              key={lesson.lessonId}
              className={`py-2.5 flex items-center gap-6 text-xs ${index < lessons.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              {/* Date & Time */}
              <div className="flex-shrink-0 w-36">
                <div className="text-white/80 font-medium">{formattedDate}</div>
                <div className="text-white/50 text-[11px]">{lesson.lessonTime}</div>
              </div>

              {/* Attendance */}
              <div className="flex-shrink-0 w-24">
                {getAttendanceBadge(lesson.attendanceStatus)}
              </div>

              {/* Homework */}
              <div className="flex-shrink-0 w-24">
                {getHomeworkBadge(lesson.homeworkStatus)}
              </div>

              {/* Comments */}
              <div className="flex-1 min-w-0">
                {lesson.comments ? (
                  <div className="text-white/70 truncate">
                    {lesson.comments}
                  </div>
                ) : (
                  <span className="text-white/30">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(StudentLessonDetailsRow);
