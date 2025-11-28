import React from 'react';
import { StickyNote } from 'lucide-react';
import { StudentRecord } from '../../hooks/useLessonStudentRecords';
import { AttendanceCell } from '@/components/teacher-dashboard/student-table/AttendanceCell';
import { HomeworkCell } from '@/components/teacher-dashboard/student-table/HomeworkCell';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StudentRecordRowProps {
  record: StudentRecord;
}

const StudentRecordRow: React.FC<StudentRecordRowProps> = ({ record }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 gap-2 hover:bg-white/10 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate text-sm">{record.studentName}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 scale-90 origin-right">
        {/* Attendance Badge - Read Only */}
        <div className="flex items-center">
          <AttendanceCell
            studentId={record.studentId}
            currentStatus={record.attendanceStatus}
            saveStatus="idle"
            onStatusChange={() => {}} // No-op - read-only
            disabled={true}
          />
        </div>

        {/* Homework Badge - Read Only */}
        <div className="flex items-center">
          <HomeworkCell
            studentId={record.studentId}
            currentStatus={record.homeworkStatus}
            saveStatus="idle"
            onStatusChange={() => {}} // No-op - read-only
            disabled={true}
          />
        </div>

        {/* Comments Indicator */}
        {record.comments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-white/10 rounded transition-colors cursor-help">
                  <StickyNote className="w-4 h-4 text-yellow-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm break-words">{record.comments}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default StudentRecordRow;
