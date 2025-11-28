import React, { useMemo } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useLessonStudentRecords } from '../../hooks/useLessonStudentRecords';
import StudentRecordRow from './StudentRecordRow';

interface LessonStudentRecapSectionProps {
  lessonId: string;
}

const LessonStudentRecapSection: React.FC<LessonStudentRecapSectionProps> = ({ lessonId }) => {
  const { records, loading, error } = useLessonStudentRecords(lessonId);

  // Calculate summary statistics
  const stats = useMemo(() => {
    return {
      total: records.length,
      presentCount: records.filter(r => r.attendanceStatus === 'present').length,
      absentCount: records.filter(r => r.attendanceStatus === 'absent').length,
      lateCount: records.filter(r => r.attendanceStatus === 'late').length,
      excusedCount: records.filter(r => r.attendanceStatus === 'excused').length,
      homeworkCompleteCount: records.filter(r => r.homeworkStatus === 'complete').length,
      homeworkPartialCount: records.filter(r => r.homeworkStatus === 'partial').length,
      homeworkMissingCount: records.filter(r => r.homeworkStatus === 'missing').length,
    };
  }, [records]);

  if (loading) {
    return (
      <GlassCard className="p-3">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-3 border-red-500/50">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </GlassCard>
    );
  }

  if (records.length === 0) {
    return (
      <GlassCard className="p-3">
        <div className="flex items-center justify-center gap-2 text-white/60 py-6">
          <Users className="w-4 h-4" />
          <span className="text-sm">No students in this lesson</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-3">
      <div className="space-y-3">
        {/* Header with count */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white flex-shrink-0" />
          <h3 className="text-base font-semibold text-white">Student Records</h3>
          <span className="text-xs text-white/60 ml-auto">{records.length} students</span>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs">
            <span className="text-white/60 block">Attendance</span>
            <span className="text-white font-medium">
              {stats.presentCount}/{stats.total} Present
            </span>
          </div>
          <div className="text-xs">
            <span className="text-white/60 block">Homework</span>
            <span className="text-white font-medium">
              {stats.homeworkCompleteCount}/{stats.total} Complete
            </span>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-1 max-h-[350px] overflow-y-auto">
          {records.map((record) => (
            <StudentRecordRow key={record.studentId} record={record} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default LessonStudentRecapSection;
