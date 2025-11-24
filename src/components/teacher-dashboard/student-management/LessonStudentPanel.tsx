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
import { formatTimeRange } from '../utils/timeUtils';
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
}

const LessonStudentPanel: React.FC<LessonStudentPanelProps> = ({
  lesson,
  currentTime,
  onEndLesson,
  isLoading = false
}) => {
  const navigate = useNavigate();
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

  const timeRange = formatTimeRange(lesson.startTime, lesson.endTime);
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
        className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-lg border-blue-500/30 shadow-lg"
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
    <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-lg border-blue-500/30 shadow-lg w-full max-w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-3 py-1">
                🔵 LESSON IN PROGRESS
              </Badge>
            </div>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {lesson.className} - Student Management
            </CardTitle>
            <CardDescription className="text-white/80">
              Manage attendance, homework, and comments for all students in this lesson
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lesson Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/10 rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs text-white/60">Time</div>
              <div className="font-medium">{timeRange}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs text-white/60">Room</div>
              <div className="font-medium">{roomName}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs text-white/60">Students</div>
              <div className="font-medium">{students.length} enrolled</div>
            </div>
          </div>
        </div>

        {/* Student Management Table */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden w-full">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Management
              </h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Lesson Notes */}
          <div className="bg-white/5 rounded-lg border border-white/10">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-yellow-400" />
                  Lesson Notes
                </h3>
                {getSaveStatusIndicator(notesSaveStatus)}
              </div>
            </div>
            
            <div className="p-4">
              <Textarea
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Add lesson notes, observations, or reminders..."
                disabled={isLoading}
                rows={4}
                className={`
                  bg-white/10 border-white/20 text-white placeholder:text-white/60 
                  resize-none
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
          />
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-center pt-4 border-t border-white/10">
          {/* End Lesson */}
          <Button
            onClick={onEndLesson}
            className="bg-red-600/80 hover:bg-red-700 text-white font-semibold px-8 py-2"
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            End Lesson
          </Button>
        </div>

        {/* Active Status Indicator */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-blue-300 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Lesson management active - all changes auto-save
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonStudentPanel;
