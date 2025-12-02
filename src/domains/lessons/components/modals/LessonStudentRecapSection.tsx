import React, { useMemo } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useLessonStudentRecords } from '../../hooks/useLessonStudentRecords';
import StudentRecordRow from './StudentRecordRow';
import { Button } from '@/components/ui/button';
import { LessonResponse } from '@/types/api/lesson';

interface LessonStudentRecapSectionProps {
  lessonId: string;
  lesson?: LessonResponse;
  onEditLessonDetails?: (lesson: LessonResponse) => void;
}

const LessonStudentRecapSection: React.FC<LessonStudentRecapSectionProps> = ({
  lessonId,
  lesson,
  onEditLessonDetails,
}) => {
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white">Student Records</h3>
              <p className="text-xs text-white/60">{records.length} students</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/70 bg-white/5 rounded-md px-3 py-2">
          <span className="text-white/80 font-medium">Attendance:</span>{' '}
          {stats.presentCount} present · {stats.lateCount} late · {stats.absentCount + stats.excusedCount} absent/excused
          <span className="text-white/80 font-medium ml-3">Homework:</span>{' '}
          {stats.homeworkCompleteCount} done · {stats.homeworkPartialCount} partial · {stats.homeworkMissingCount} missing
        </div>

        <div className="flex items-center gap-3 px-2 text-xs text-white/40 uppercase tracking-wide">
          <div className="flex-1">Student</div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-6 text-center">Att</span>
            <span className="w-6 text-center">Hw</span>
            <span className="w-6 text-center">Note</span>
          </div>
        </div>

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
