import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import HorizontalStatusBar from '../HorizontalStatusBar';
import { AttendanceOverview } from '@/types/api/student';

interface AttendanceCardProps {
  attendance: AttendanceOverview;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ attendance }) => {
  const hasData = attendance.totalSessions > 0;

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Attendance – All time</h3>

      {hasData ? (
        <div className="space-y-3">
          {/* Primary metric - compact layout */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                {attendance.presentCount}/{attendance.totalSessions} classes
              </p>
              <p className="text-xs text-white/50 mt-0.5">Present</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                {attendance.attendanceRate.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Horizontal bar */}
          <HorizontalStatusBar
            segments={[
              { value: attendance.presentCount, color: 'bg-green-600', label: 'Present' },
              { value: attendance.absentCount, color: 'bg-red-600', label: 'Absent' },
              { value: attendance.lateCount, color: 'bg-yellow-600', label: 'Late' }
            ]}
            total={attendance.totalSessions}
          />

          {/* Trend indicator */}
          {attendance.trendDescription && (
            <p className="text-xs text-white/40">
              {attendance.trendDescription}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">
          No sessions yet. Stats will appear after the first lesson.
        </p>
      )}
    </GlassCard>
  );
};

export default AttendanceCard;
