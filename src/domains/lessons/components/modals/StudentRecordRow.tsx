import React from 'react';
import { MessageSquare, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { StudentRecord } from '../../hooks/useLessonStudentRecords';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StudentRecordRowProps {
  record: StudentRecord;
}

// Compact status indicator component
const StatusIndicator: React.FC<{
  type: 'attendance' | 'homework';
  status: string | null;
}> = ({ type, status }) => {
  const getAttendanceConfig = (status: string | null) => {
    switch (status) {
      case 'present':
        return { icon: Check, color: 'text-green-400', bg: 'bg-green-400/20', label: 'Present' };
      case 'absent':
        return { icon: X, color: 'text-red-400', bg: 'bg-red-400/20', label: 'Absent' };
      case 'late':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Late' };
      case 'excused':
        return { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-400/20', label: 'Excused' };
      default:
        return { icon: AlertTriangle, color: 'text-white/40', bg: 'bg-white/10', label: 'Not set' };
    }
  };

  const getHomeworkConfig = (status: string | null) => {
    switch (status) {
      case 'complete':
        return { icon: Check, color: 'text-green-400', bg: 'bg-green-400/20', label: 'Complete' };
      case 'partial':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Partial' };
      case 'missing':
        return { icon: X, color: 'text-red-400', bg: 'bg-red-400/20', label: 'Missing' };
      default:
        return { icon: AlertTriangle, color: 'text-white/40', bg: 'bg-white/10', label: 'Not set' };
    }
  };

  const config = type === 'attendance' 
    ? getAttendanceConfig(status) 
    : getHomeworkConfig(status);
  
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            config.bg
          )}>
            <Icon className={cn('w-3.5 h-3.5', config.color)} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {type === 'attendance' ? 'Attendance' : 'Homework'}: {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const StudentRecordRow: React.FC<StudentRecordRowProps> = ({ record }) => {
  return (
    <div className="flex items-center gap-3 py-1.5 px-2 hover:bg-white/5 rounded transition-colors group">
      {/* Student Name */}
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-sm truncate">{record.studentName}</p>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Attendance */}
        <StatusIndicator type="attendance" status={record.attendanceStatus} />
        
        {/* Homework */}
        <StatusIndicator type="homework" status={record.homeworkStatus} />

        {/* Comments Indicator */}
        {record.comments ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-400/20 cursor-help">
                  <MessageSquare className="w-3.5 h-3.5 text-yellow-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs break-words">{record.comments}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="w-6 h-6" /> // Spacer for alignment
        )}
      </div>
    </div>
  );
};

export default StudentRecordRow;
