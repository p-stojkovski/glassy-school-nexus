import React, { useMemo } from 'react';
import { Users, AlertCircle, Check, X, Clock } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useLessonStudentRecords } from '../../hooks/useLessonStudentRecords';
import StudentRecordRow from './StudentRecordRow';
import { cn } from '@/lib/utils';

interface LessonStudentRecapSectionProps {
  lessonId: string;
}

// Mini stat badge component
const StatBadge: React.FC<{
  count: number;
  total: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = ({ count, total, label, color, icon }) => (
  <div className="flex items-center gap-1.5">
    <div className={cn('w-5 h-5 rounded flex items-center justify-center', color)}>
      {icon}
    </div>
    <div className="text-xs">
      <span className="text-white font-medium">{count}</span>
      <span className="text-white/40">/{total}</span>
    </div>
  </div>
);

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
            <div key={i} className="h-8 bg-white/10 rounded animate-pulse" />
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
          <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <h3 className="text-sm font-medium text-white">Student Records</h3>
          <span className="text-xs text-white/60 ml-auto">{records.length} students</span>
        </div>

        {/* Compact Summary Statistics */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 p-2 bg-white/5 rounded-lg border border-white/10">
          {/* Attendance Stats */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 uppercase tracking-wide">Attendance</span>
            <div className="flex items-center gap-2">
              <StatBadge 
                count={stats.presentCount} 
                total={stats.total} 
                label="Present"
                color="bg-green-400/20"
                icon={<Check className="w-3 h-3 text-green-400" />}
              />
              <StatBadge 
                count={stats.lateCount} 
                total={stats.total} 
                label="Late"
                color="bg-yellow-400/20"
                icon={<Clock className="w-3 h-3 text-yellow-400" />}
              />
              <StatBadge 
                count={stats.absentCount} 
                total={stats.total} 
                label="Absent"
                color="bg-red-400/20"
                icon={<X className="w-3 h-3 text-red-400" />}
              />
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-px bg-white/10 self-stretch hidden sm:block" />
          
          {/* Homework Stats */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 uppercase tracking-wide">Homework</span>
            <div className="flex items-center gap-2">
              <StatBadge 
                count={stats.homeworkCompleteCount} 
                total={stats.total} 
                label="Complete"
                color="bg-green-400/20"
                icon={<Check className="w-3 h-3 text-green-400" />}
              />
              <StatBadge 
                count={stats.homeworkPartialCount} 
                total={stats.total} 
                label="Partial"
                color="bg-yellow-400/20"
                icon={<Clock className="w-3 h-3 text-yellow-400" />}
              />
              <StatBadge 
                count={stats.homeworkMissingCount} 
                total={stats.total} 
                label="Missing"
                color="bg-red-400/20"
                icon={<X className="w-3 h-3 text-red-400" />}
              />
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center gap-3 px-2 text-xs text-white/40 uppercase tracking-wide">
          <div className="flex-1">Student</div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-6 text-center">Att</span>
            <span className="w-6 text-center">Hw</span>
            <span className="w-6 text-center">Note</span>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {records.map((record) => (
            <StudentRecordRow key={record.studentId} record={record} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default LessonStudentRecapSection;
