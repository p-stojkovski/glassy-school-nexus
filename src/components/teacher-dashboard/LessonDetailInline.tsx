import React from 'react';
import { Calendar, Clock, MapPin, User, FileText, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonResponse } from '@/types/api/lesson';
import { LessonStudentResponse } from '@/types/api/lesson-students';
import { formatTimeRange, calculateDuration } from './utils/timeUtils';
import StudentActivityTable from './StudentActivityTable';

interface LessonDetailInlineProps {
  lesson: LessonResponse;
  students: LessonStudentResponse[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/**
 * Inline lesson detail component that displays when a lesson card is expanded
 * Shows basic lesson info, notes, and unified student activity table
 */
const LessonDetailInline: React.FC<LessonDetailInlineProps> = ({
  lesson,
  students,
  loading,
  error,
  onRetry
}) => {
  const lessonDate = new Date(lesson.scheduledDate);
  const formattedDate = lessonDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const duration = calculateDuration(lesson.startTime, lesson.endTime);

  if (loading) {
    return (
      <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="h-6 bg-white/10 rounded"></div>
            <div className="h-6 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="text-center py-4">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
      {/* Basic Lesson Info */}
      <div>
        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Lesson Overview
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-white/50 block">Date</span>
            <span className="text-white">{formattedDate}</span>
          </div>
          <div>
            <span className="text-white/50 block">Time & Duration</span>
            <div className="flex items-center gap-1 text-white">
              <Clock className="w-3 h-3" />
              {formatTimeRange(lesson.startTime, lesson.endTime)} ({duration})
            </div>
          </div>
          <div>
            <span className="text-white/50 block">Teacher</span>
            <div className="flex items-center gap-1 text-white">
              <User className="w-3 h-3" />
              {lesson.teacherName}
            </div>
          </div>
          <div>
            <span className="text-white/50 block">Classroom</span>
            <div className="flex items-center gap-1 text-white">
              <MapPin className="w-3 h-3" />
              {lesson.classroomName}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Notes */}
      {lesson.notes && (
        <div>
          <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-yellow-400" />
            Lesson Notes
          </h4>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-white/90 text-sm whitespace-pre-wrap">{lesson.notes}</p>
          </div>
        </div>
      )}

      {/* Student Activity */}
      <div>
        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />
          Student Activity
        </h4>
        <StudentActivityTable students={students} />
      </div>
    </div>
  );
};

export default LessonDetailInline;