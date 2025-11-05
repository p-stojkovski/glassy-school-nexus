import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { LessonStudentResponse } from '@/types/api/lesson-students';

interface AttendanceSummarySectionProps {
  students: LessonStudentResponse[];
}

const AttendanceSummarySection: React.FC<AttendanceSummarySectionProps> = ({ students }) => {
  // Calculate attendance statistics
  const totalStudents = students.length;
  const presentStudents = students.filter(s => s.attendanceStatus === 'present');
  const absentStudents = students.filter(s => s.attendanceStatus === 'absent');
  const lateStudents = students.filter(s => s.attendanceStatus === 'late');
  const unmarkedStudents = students.filter(s => !s.attendanceStatus);
  
  const attendanceCount = presentStudents.length + lateStudents.length;
  const attendanceRate = totalStudents > 0 ? Math.round((attendanceCount / totalStudents) * 100) : 0;
  
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getBadgeColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (rate >= 75) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };
  
  const getAttendanceLabel = (rate: number) => {
    if (rate >= 90) return 'Excellent attendance';
    if (rate >= 75) return 'Good attendance';
    return 'Poor attendance';
  };

  if (totalStudents === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Attendance Summary
        </h3>
        <p className="text-white/70 italic">No students enrolled in this lesson</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-green-400" />
        Attendance Summary
      </h3>
      
      {/* Attendance Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70">Attendance Rate</span>
          <Badge className={getBadgeColor(attendanceRate)}>
            {getAttendanceLabel(attendanceRate)}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${getAttendanceColor(attendanceRate)}`}>
            {attendanceCount}/{totalStudents}
          </span>
          <span className={`text-lg ${getAttendanceColor(attendanceRate)}`}>
            ({attendanceRate}%)
          </span>
        </div>
      </div>
      
      {/* Student Lists */}
      <div className="space-y-4">
        {/* Present Students */}
        {presentStudents.length > 0 && (
          <StudentStatusList
            title="Present"
            count={presentStudents.length}
            students={presentStudents}
            colorClass="green"
          />
        )}
        
        {/* Late Students */}
        {lateStudents.length > 0 && (
          <StudentStatusList
            title="Late"
            count={lateStudents.length}
            students={lateStudents}
            colorClass="yellow"
          />
        )}
        
        {/* Absent Students */}
        {absentStudents.length > 0 && (
          <StudentStatusList
            title="Absent"
            count={absentStudents.length}
            students={absentStudents}
            colorClass="red"
          />
        )}
        
        {/* Unmarked Students */}
        {unmarkedStudents.length > 0 && (
          <StudentStatusList
            title="Not Marked"
            count={unmarkedStudents.length}
            students={unmarkedStudents}
            colorClass="gray"
          />
        )}
      </div>
    </div>
  );
};

interface StudentStatusListProps {
  title: string;
  count: number;
  students: LessonStudentResponse[];
  colorClass: 'green' | 'yellow' | 'red' | 'gray';
}

const StudentStatusList: React.FC<StudentStatusListProps> = ({ title, count, students, colorClass }) => {
  const colorMap = {
    green: 'text-green-400 bg-green-500/20 border-green-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    red: 'text-red-400 bg-red-500/20 border-red-500/30',
    gray: 'text-gray-400 bg-gray-500/20 border-gray-500/30'
  };

  return (
    <div>
      <h4 className={`text-sm font-medium ${colorMap[colorClass].split(' ')[0]} mb-2 flex items-center gap-1`}>
        <span className={`w-2 h-2 bg-${colorClass}-400 rounded-full`}></span>
        {title} ({count})
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {students.map(student => (
          <Badge key={student.studentId} className={`${colorMap[colorClass]} text-xs px-2 py-1`}>
            {student.studentName}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummarySection;