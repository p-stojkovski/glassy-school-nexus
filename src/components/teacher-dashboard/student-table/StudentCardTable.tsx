/**
 * Student Card Table Component
 * 
 * Professional business-style card-table hybrid for attendance management.
 * Combines the efficiency of tables with the visual appeal of cards.
 * 
 * Features:
 * - Card-style rows with professional spacing and borders
 * - Enhanced visual hierarchy
 * - Touch-friendly interactions
 * - Responsive design
 * - Status indicators and badges
 * - Professional business appearance
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  User,
  CheckSquare,
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { AttendanceCell } from './AttendanceCell';
import { HomeworkCell } from './HomeworkCell';
import { CommentsCell } from './CommentsCell';
import { ConnectionIndicator, ConnectionStatus } from '@/hooks/useOfflineSync';

// Enhanced student data interface for card display
export interface StudentCardData {
  studentId: string;
  studentName: string;
  attendanceStatus: 'present' | 'absent' | 'late' | null;
  homeworkStatus: 'complete' | 'missing' | 'partial' | null;
  comments: string | null;
  attendanceSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  homeworkSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  commentsSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isOfflinePending?: boolean; // Indicates if this student has pending offline changes
}

export interface StudentCardTableProps {
  students: StudentCardData[];
  loading?: boolean;
  connectionStatus?: ConnectionStatus;
  queueSize?: number;
  isOffline?: boolean;
  onAttendanceChange: (studentId: string, status: 'present' | 'absent' | 'late') => Promise<void>;
  onHomeworkChange: (studentId: string, status: 'complete' | 'missing' | 'partial') => Promise<void>;
  onCommentsChange: (studentId: string, comments: string) => void;
  onBulkMarkPresent?: () => Promise<void>;
  disabled?: boolean;
}

// Individual student card row component
const StudentCardRow: React.FC<{
  student: StudentCardData;
  index: number;
  onAttendanceChange: StudentCardTableProps['onAttendanceChange'];
  onHomeworkChange: StudentCardTableProps['onHomeworkChange'];
  onCommentsChange: StudentCardTableProps['onCommentsChange'];
  isOffline: boolean;
  disabled: boolean;
}> = ({
  student,
  index,
  onAttendanceChange,
  onHomeworkChange,
  onCommentsChange,
  isOffline,
  disabled
}) => {
  // Get attendance status color
  const getAttendanceColor = () => {
    switch (student.attendanceStatus) {
      case 'present': return 'border-l-green-500';
      case 'absent': return 'border-l-red-500';
      case 'late': return 'border-l-yellow-500';
      default: return 'border-l-gray-500';
    }
  };

  // Get homework status color
  const getHomeworkColor = () => {
    switch (student.homeworkStatus) {
      case 'complete': return 'text-green-400';
      case 'missing': return 'text-red-400';
      case 'partial': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card 
      className={`
        bg-white/5 border-white/10 border-l-4 ${getAttendanceColor()}
        hover:bg-white/10 transition-all duration-200
        ${student.isOfflinePending ? 'ring-1 ring-yellow-500/50' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <CardContent className="p-4">
        {/* Header Row - Student Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Student Avatar/Number */}
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-300">
                {index + 1}
              </span>
            </div>
            
            {/* Student Name and Status */}
            <div>
              <h3 className="font-semibold text-white text-lg">
                {student.studentName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {/* Connection/Sync Status */}
                {student.isOfflinePending && (
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-300">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Pending Sync
                  </Badge>
                )}
                
                {/* Activity Indicator */}
                {(student.attendanceSaveStatus === 'saving' || 
                  student.homeworkSaveStatus === 'saving' || 
                  student.commentsSaveStatus === 'saving') && (
                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status Overview */}
          <div className="flex items-center gap-2">
            {/* Attendance Quick Status */}
            <div className={`w-3 h-3 rounded-full ${
              student.attendanceStatus === 'present' ? 'bg-green-500' :
              student.attendanceStatus === 'absent' ? 'bg-red-500' :
              student.attendanceStatus === 'late' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} title={`Attendance: ${student.attendanceStatus || 'Not marked'}`} />
            
            {/* Homework Quick Status */}
            <CheckSquare className={`w-4 h-4 ${getHomeworkColor()}`} 
              title={`Homework: ${student.homeworkStatus || 'Not checked'}`} />
          </div>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Attendance Section */}
          <div className="lg:col-span-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Attendance</label>
              <AttendanceCell
                studentId={student.studentId}
                currentStatus={student.attendanceStatus}
                saveStatus={student.attendanceSaveStatus}
                onStatusChange={onAttendanceChange}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Homework Section */}
          <div className="lg:col-span-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Homework</label>
              <HomeworkCell
                studentId={student.studentId}
                currentStatus={student.homeworkStatus}
                saveStatus={student.homeworkSaveStatus}
                onStatusChange={onHomeworkChange}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="lg:col-span-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Comments</label>
              <CommentsCell
                studentId={student.studentId}
                currentComments={student.comments}
                saveStatus={student.commentsSaveStatus}
                onCommentsChange={onCommentsChange}
                disabled={disabled}
                placeholder="Add notes about this student..."
              />
            </div>
          </div>
        </div>

        {/* Footer - Additional Info (if needed) */}
        {isOffline && student.isOfflinePending && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-yellow-300">
              <WifiOff className="w-3 h-3" />
              <span>Changes will sync when connection is restored</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main table component
export const StudentCardTable: React.FC<StudentCardTableProps> = ({
  students,
  loading = false,
  connectionStatus = 'online',
  queueSize = 0,
  isOffline = false,
  onAttendanceChange,
  onHomeworkChange,
  onCommentsChange,
  onBulkMarkPresent,
  disabled = false
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg border border-white/10">
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Students</h3>
            <p className="text-white/70">Please wait while we load the student information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Student Management</h3>
              <p className="text-sm text-white/70">
                {students.length} students enrolled - Click badges to update status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <ConnectionIndicator 
              connectionStatus={connectionStatus}
              queueSize={queueSize}
            />

            {/* Bulk Actions */}
            {onBulkMarkPresent && (
              <Button
                onClick={onBulkMarkPresent}
                disabled={disabled || students.length === 0}
                size="sm"
                className="bg-green-600/80 hover:bg-green-700 text-white"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Mark All Present
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {students.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold text-white mb-2">No Students Enrolled</h3>
              <p className="text-white/70">
                Students will appear here once they are enrolled in this class
              </p>
            </CardContent>
          </Card>
        ) : (
          students.map((student, index) => (
            <StudentCardRow
              key={student.studentId}
              student={student}
              index={index}
              onAttendanceChange={onAttendanceChange}
              onHomeworkChange={onHomeworkChange}
              onCommentsChange={onCommentsChange}
              isOffline={isOffline}
              disabled={disabled}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <AlertCircle className="w-4 h-4" />
            <span>All changes auto-save {isOffline ? 'offline' : 'immediately'}</span>
          </div>
          
          {isOffline && queueSize > 0 && (
            <div className="flex items-center gap-2 text-yellow-300">
              <WifiOff className="w-4 h-4" />
              <span>{queueSize} changes queued for sync</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};