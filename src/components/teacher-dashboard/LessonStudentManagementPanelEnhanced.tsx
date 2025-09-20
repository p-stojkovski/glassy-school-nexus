import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  BookOpen, 
  MapPin, 
  Users,
  StickyNote,
  LogOut,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRange } from './utils/timeUtils';
import { useLessonStudentDataWithSync, StudentRowState } from './hooks/useLessonStudentDataWithSync';
import { useLessonNotes } from './hooks/useLessonNotes';
import { StudentCardTable, StudentCardData } from './student-table/StudentCardTable';
import { ConnectionIndicator } from '@/hooks/useOfflineSync';

interface LessonStudentManagementPanelEnhancedProps {
  lesson: LessonResponse;
  currentTime: string;
  onEndLesson?: () => void;
  isLoading?: boolean;
}

export const LessonStudentManagementPanelEnhanced: React.FC<LessonStudentManagementPanelEnhancedProps> = ({
  lesson,
  currentTime,
  onEndLesson,
  isLoading = false
}) => {
  // Enhanced student data with offline sync
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    connectionStatus,
    queueSize,
    isOffline,
    isSyncing,
    updateAttendance,
    updateHomework,
    updateComments,
    bulkMarkPresent,
    syncNow,
    refreshStudents,
  } = useLessonStudentDataWithSync(lesson.id);

  // Lesson notes (keep existing functionality)
  const {
    notes,
    saveStatus: notesSaveStatus,
    updateNotes,
    loading: notesLoading,
  } = useLessonNotes(lesson.id);

  const timeRange = formatTimeRange(lesson.startTime, lesson.endTime);
  const roomName = lesson.classroomNameSnapshot || lesson.classroomName || 'Classroom TBD';

  // Convert student data for card table
  const studentCardData: StudentCardData[] = students.map(student => ({
    ...student,
    attendanceStatus: student.attendanceStatus,
    homeworkStatus: student.homeworkStatus,
    comments: student.comments,
    attendanceSaveStatus: student.attendanceSaveStatus,
    homeworkSaveStatus: student.homeworkSaveStatus,
    commentsSaveStatus: student.commentsSaveStatus,
    isOfflinePending: student.isOfflinePending,
  }));

  // Save status indicator helper
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

  // Loading state
  if (studentsLoading || notesLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-lg border-blue-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Student Data</h3>
          <p className="text-white/70">Please wait while we load the lesson information...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (studentsError) {
    return (
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border-red-500/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Students</h3>
          <p className="text-white/70 mb-4">{studentsError}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={refreshStudents}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            {isOffline && queueSize > 0 && (
              <Button
                variant="outline"
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
                onClick={syncNow}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4 mr-2" />
                )}
                Sync Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-lg border-blue-500/30 shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-3 py-1">
                🔵 LESSON IN PROGRESS
              </Badge>
              <ConnectionIndicator 
                connectionStatus={connectionStatus}
                queueSize={queueSize}
              />
            </div>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {lesson.className} - Enhanced Student Management
            </CardTitle>
            <CardDescription className="text-white/80">
              Professional card-based interface with offline sync capabilities - Click badges to update status
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lesson Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/10 rounded-lg">
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

          <div className="flex items-center gap-2 text-white">
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-red-400" />
            ) : (
              <Wifi className="w-4 h-4 text-green-400" />
            )}
            <div>
              <div className="text-xs text-white/60">Status</div>
              <div className="font-medium">
                {isOffline ? 'Working Offline' : 'Online'}
              </div>
            </div>
          </div>
        </div>

        {/* Offline Alert */}
        {isOffline && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <WifiOff className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              <strong>Working Offline:</strong> Your changes are being saved locally and will sync when connection is restored.
              {queueSize > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  {queueSize} changes queued
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Card-Based Student Management */}
        <StudentCardTable
          students={studentCardData}
          loading={studentsLoading}
          connectionStatus={connectionStatus}
          queueSize={queueSize}
          isOffline={isOffline}
          onAttendanceChange={updateAttendance}
          onHomeworkChange={updateHomework}
          onCommentsChange={updateComments}
          onBulkMarkPresent={bulkMarkPresent}
          disabled={isLoading}
        />

        {/* Lesson Notes Section */}
        <div className="bg-white/5 rounded-lg border border-white/10">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5" />
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

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {/* Sync Controls */}
          <div className="flex items-center gap-3">
            {(isOffline || queueSize > 0) && (
              <Button
                onClick={syncNow}
                disabled={isSyncing || connectionStatus !== 'online'}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
            
            <Button
              onClick={refreshStudents}
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* End Lesson */}
          <Button
            onClick={onEndLesson}
            className="bg-red-600/80 hover:bg-red-700 text-white font-semibold px-6"
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            End Lesson
          </Button>
        </div>

        {/* Status Footer */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-blue-300 text-sm">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isOffline ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            Enhanced lesson management active - {isOffline ? 'offline sync enabled' : 'all changes auto-save'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};