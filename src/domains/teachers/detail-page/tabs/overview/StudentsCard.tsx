import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { StudentsOverview, StudentFinancialSummary } from '@/types/api/teacher';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentsCardProps {
  data: StudentsOverview;
  financials: StudentFinancialSummary;
}

const StudentsCard: React.FC<StudentsCardProps> = ({ data }) => {
  const hasStudents = data.totalStudents > 0;
  const attendance = data.attendancePercentage;

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <GlassCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/60">Students</h3>
        <Users className="w-4 h-4 text-white/40" />
      </div>

      {hasStudents ? (
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-white">{data.totalStudents}</p>
            <span className="text-xs text-green-400">{data.activeStudents} enrolled</span>
            {data.inactiveStudents > 0 && (
              <span className="text-xs text-white/40">{data.inactiveStudents} inactive</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-white/50">Attendance </span>
            <span className={cn('text-sm font-semibold', getAttendanceColor(attendance))}>
              {attendance}%
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/50">No students in classes</p>
      )}
    </GlassCard>
  );
};

export default StudentsCard;
