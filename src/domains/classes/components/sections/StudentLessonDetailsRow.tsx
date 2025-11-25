import React from 'react';
import { StudentLessonDetail } from '@/types/api/class';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Circle, MessageSquare, FileText } from 'lucide-react';
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
    <div className="p-4 bg-white/5 space-y-2">
      <div className="text-xs text-white/70 font-semibold mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Lesson History ({lessons.length} lessons)
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {lessons.map((lesson) => {
          const lessonDate = parseISO(lesson.lessonDate);
          const formattedDate = format(lessonDate, 'MMM dd, yyyy');
          const dayOfWeek = format(lessonDate, 'EEEE');

          return (
            <Card
              key={lesson.lessonId}
              className="bg-white/10 border-white/20 p-3 hover:bg-white/15 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-white font-medium text-sm">{formattedDate}</div>
                    <div className="text-white/60 text-xs">{dayOfWeek} | {lesson.lessonTime}</div>
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <div className="text-white/60 text-xs mb-1">Attendance</div>
                  {getAttendanceBadge(lesson.attendanceStatus)}
                </div>

                {/* Homework */}
                <div>
                  <div className="text-white/60 text-xs mb-1">Homework</div>
                  {getHomeworkBadge(lesson.homeworkStatus)}
                </div>

                {/* Comments */}
                <div>
                  <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Comments
                  </div>
                  {lesson.comments ? (
                    <div className="text-white text-xs bg-white/5 p-2 rounded border border-white/10 line-clamp-2">
                      {lesson.comments}
                    </div>
                  ) : (
                    <span className="text-white/40 text-xs">No comments</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(StudentLessonDetailsRow);
