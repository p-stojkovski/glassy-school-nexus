import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Clock, 
  BookOpen, 
  MapPin, 
  Users,
  StickyNote,
  LogOut,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { LessonModeConfig } from '@/domains/lessons/types/lessonMode';
import { getLessonModeConfig } from '@/domains/lessons/utils/lessonModeUtils';
import { formatTimeRange } from '../utils/timeUtils';
import { formatTimeWithoutSeconds } from '@/utils/timeFormatUtils';
import { useLessonStudentData } from '../hooks/useLessonStudentData';
import { useLessonNotes } from '../hooks/useLessonNotes';
import { AttendanceCell } from '../student-table/AttendanceCell';
import { HomeworkCell } from '../student-table/HomeworkCell';
import { CommentsCell } from '../student-table/CommentsCell';
import LessonHomeworkSection from '../lesson-detail/LessonHomeworkSection';
import DashboardLoadingState from '../states/DashboardLoadingState';

interface LessonStudentPanelProps {
  lesson: LessonResponse;
  currentTime: string;
  onEndLesson?: () => void;
  isLoading?: boolean;
  /** Optional mode config override - if not provided, will be derived from lesson status */
  modeConfig?: LessonModeConfig;
}

const LessonStudentPanel: React.FC<LessonStudentPanelProps> = ({
  lesson,
  currentTime,
  onEndLesson,
  isLoading = false,
  modeConfig: externalModeConfig,
}) => {
  const navigate = useNavigate();
  
  // Derive mode config from lesson status if not provided externally
  const modeConfig = externalModeConfig || getLessonModeConfig(lesson.statusName, lesson.scheduledDate);
  const isEditingMode = modeConfig.mode === 'editing';
  
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    unifiedSaveStatus: studentsSaveStatus,
    updateAttendance,
    updateHomework,
    updateComments,
  } = useLessonStudentData(lesson.id);

  const {
    notes,
    saveStatus: notesSaveStatus,
    updateNotes,
    loading: notesLoading,
  } = useLessonNotes(lesson.id);

  const timeRange = formatTimeRange(
    formatTimeWithoutSeconds(lesson.startTime), 
    formatTimeWithoutSeconds(lesson.endTime)
  );
  const roomName = lesson.classroomNameSnapshot || lesson.classroomName || 'Classroom TBD';

  const getSaveStatusIndicator = (status: string) => {
    switch (status) {
      case 'saving':
        return (
          <div className="inline-flex items-center gap-1 text-xs text-blue-300">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="inline-flex items-center gap-1 text-xs text-green-300">
            ✓ Saved
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center gap-1 text-xs text-red-300">
            ⚠ Error
          </div>
        );
      default:
        return null;
    }
  };

  if (studentsLoading || notesLoading) {
    return (
      <DashboardLoadingState
        rows={6}
        className={isEditingMode 
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-lg border-amber-500/30 shadow-lg"
          : "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-lg border-blue-500/30 shadow-lg"
        }
        contentClassName="p-2"
      />
    );
  }

  if (studentsError) {
    return (
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border-red-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Students</h3>
          <p className="text-white/70 mb-4">{studentsError}</p>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`backdrop-blur-lg shadow-lg w-full max-w-full overflow-hidden ${
      isEditingMode 
        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30'
        : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
              {lesson.className} · {timeRange} · {roomName} · {students.length} student{students.length !== 1 ? 's' : ''}
              <Badge className={`${modeConfig.badgeClassName} text-white text-xs px-2 py-0.5 ml-2`}>
                {modeConfig.badgeText}
              </Badge>
            </CardTitle>
            <CardDescription className="text-white/70 text-sm">
              Mark attendance and homework
            </CardDescription>
          </div>
          {isEditingMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white/70 hover:text-white hover:bg-white/20"
            >
              Done
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Auto-save Status Notice - Moved to top for immediate visibility */}
      <div className="px-6 py-2 border-b border-white/10">
        <div className={`inline-flex items-center gap-2 text-xs ${
          isEditingMode ? 'text-amber-300' : 'text-blue-300'
        }`}>
          {studentsSaveStatus === 'saving' || notesSaveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving changes...
            </>
          ) : studentsSaveStatus === 'saved' && notesSaveStatus === 'saved' ? (
            <>
              <span className="text-green-400">✓</span>
              All changes saved
            </>
          ) : studentsSaveStatus === 'error' || notesSaveStatus === 'error' ? (
            <>
              <span className="text-red-400">⚠</span>
              Error saving changes
            </>
          ) : (
            <>
              <div className={`w-2 h-2 rounded-full animate-pulse ${modeConfig.statusDotClassName}`} />
              {modeConfig.statusIndicatorText}
            </>
          )}
        </div>
      </div>

      <CardContent className="space-y-6">

        {/* Student Management Table */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden w-full">
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">
                {students.length} student{students.length !== 1 ? 's' : ''} – mark each student once per lesson
              </span>
              {getSaveStatusIndicator(studentsSaveStatus)}
            </div>
          </div>
          
          <Table className="w-full">
            <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/90 font-semibold w-1/6 min-w-[120px]">Student Name</TableHead>
                  <TableHead className="text-white/90 font-semibold w-1/4 min-w-[160px]">Attendance</TableHead>
                  <TableHead className="text-white/90 font-semibold w-1/4 min-w-[140px]">Homework</TableHead>
                  <TableHead className="text-white/90 font-semibold w-1/3 min-w-[180px]">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-white/60">
                        <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
                        <p>No students enrolled in this lesson</p>
                        <p className="text-sm mt-2">Students will appear here once they are enrolled in the class</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow
                      key={student.studentId}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-medium">
                        <button
                          onClick={() => navigate(`/students/${student.studentId}`)}
                          className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer transition-colors"
                        >
                          {student.studentName}
                        </button>
                      </TableCell>
                      
                      <TableCell>
                        <AttendanceCell
                          studentId={student.studentId}
                          currentStatus={student.attendanceStatus}
                          saveStatus={student.attendanceSaveStatus}
                          onStatusChange={updateAttendance}
                          disabled={isLoading}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <HomeworkCell
                          studentId={student.studentId}
                          currentStatus={student.homeworkStatus}
                          saveStatus={student.homeworkSaveStatus}
                          onStatusChange={updateHomework}
                          disabled={isLoading}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <CommentsCell
                          studentId={student.studentId}
                          currentComments={student.comments}
                          saveStatus={student.commentsSaveStatus}
                          onCommentsChange={updateComments}
                          disabled={isLoading}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
          </Table>
        </div>

        {/* Lesson Notes and Homework Section (50/50 Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left Column: Lesson Notes */}
          <div className="bg-white/5 rounded-lg border border-white/[0.05]">
            <div className="px-3 py-2 border-b border-white/[0.05]">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-yellow-400" />
                  Lesson Notes
                </h3>
                {getSaveStatusIndicator(notesSaveStatus)}
              </div>
            </div>
            
            <div className="p-2">
              <Textarea
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Add lesson notes, observations, or reminders..."
                disabled={isLoading}
                rows={3}
                className={`
                  bg-white/10 border-white/20 text-white placeholder:text-white/60 
                  resize-none text-sm
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  ${notesSaveStatus === 'saving' ? 'border-blue-500/50' : ''}
                  ${notesSaveStatus === 'error' ? 'border-red-500/50' : ''}
                  ${notesSaveStatus === 'saved' ? 'border-green-500/50' : ''}
                `}
              />
            </div>
          </div>

          {/* Right Column: Homework */}
          <LessonHomeworkSection
            lessonId={lesson.id}
            classId={lesson.classId}
            isLoading={isLoading}
            isEditingMode={isEditingMode}
          />
        </div>

        {/* Action Section - End Lesson Button (only in teaching mode) */}
        {modeConfig.showEndLessonButton && onEndLesson && (
          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button
              onClick={onEndLesson}
              className="bg-red-600/80 hover:bg-red-700 text-white font-semibold px-8 py-2"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              End Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonStudentPanel;
