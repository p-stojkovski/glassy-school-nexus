import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, BookCheck, X, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LessonStudentResponse } from '@/types/api/lesson-students';

interface StudentActivityTableProps {
  students: LessonStudentResponse[];
}

/**
 * Unified table showing student attendance, homework status, and comments
 * Merges all student activity data into one comprehensive view
 */
const StudentActivityTable: React.FC<StudentActivityTableProps> = ({ students }) => {
  // Helper functions for status rendering
  const getAttendanceIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'excused':
        return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAttendanceBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'present':
        return (
          <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10 text-xs">
            Present
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10 text-xs">
            Late
          </Badge>
        );
      case 'excused':
        return (
          <Badge variant="outline" className="text-blue-400 border-blue-400/50 bg-blue-400/10 text-xs">
            Excused
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="outline" className="text-red-400 border-red-400/50 bg-red-400/10 text-xs">
            Absent
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-400 border-gray-400/50 bg-gray-400/10 text-xs">
            Not Marked
          </Badge>
        );
    }
  };

  const getHomeworkIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return <BookCheck className="w-4 h-4 text-green-400" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'missing':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHomeworkBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'complete':
        return (
          <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10 text-xs">
            Complete
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10 text-xs">
            Partial
          </Badge>
        );
      case 'missing':
        return (
          <Badge variant="outline" className="text-red-400 border-red-400/50 bg-red-400/10 text-xs">
            Missing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-400 border-gray-400/50 bg-gray-400/10 text-xs">
            Not Checked
          </Badge>
        );
    }
  };

  if (!students || students.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
        <p className="text-white/60 text-sm">No student data available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-3 text-xs font-medium text-white/60 uppercase tracking-wide">
                Student
              </th>
              <th className="text-left p-3 text-xs font-medium text-white/60 uppercase tracking-wide">
                Attendance
              </th>
              <th className="text-left p-3 text-xs font-medium text-white/60 uppercase tracking-wide">
                Homework
              </th>
              <th className="text-left p-3 text-xs font-medium text-white/60 uppercase tracking-wide">
                Comments
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr 
                key={student.id || index}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                {/* Student Name */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {student.studentName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-white text-sm font-medium">
                      {student.studentName || 'Unknown Student'}
                    </span>
                  </div>
                </td>

                {/* Attendance Status */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {getAttendanceIcon(student.attendanceStatus || 'not_marked')}
                    {getAttendanceBadge(student.attendanceStatus || 'not_marked')}
                  </div>
                </td>

                {/* Homework Status */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {getHomeworkIcon(student.homeworkStatus || 'not_checked')}
                    {getHomeworkBadge(student.homeworkStatus || 'not_checked')}
                  </div>
                </td>

                {/* Comments */}
                <td className="p-3">
                  {student.comments ? (
                    <div className="max-w-xs">
                      <p className="text-white/80 text-sm truncate" title={student.comments}>
                        {student.comments}
                      </p>
                    </div>
                  ) : (
                    <span className="text-white/40 text-sm italic">No comments</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Footer */}
      <div className="bg-white/5 border-t border-white/10 p-3">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>
            Total Students: {students.length}
          </span>
          <div className="flex items-center gap-4">
            <span>
              Present: {students.filter(s => s.attendanceStatus?.toLowerCase() === 'present').length}
            </span>
            <span>
              Homework Complete: {students.filter(s => s.homeworkStatus?.toLowerCase() === 'complete').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityTable;