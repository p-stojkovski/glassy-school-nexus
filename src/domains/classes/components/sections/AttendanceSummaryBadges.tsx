import React from 'react';
import InfoTooltip from '@/components/common/InfoTooltip';
import { AttendanceSummary } from '@/types/api/class';
import { CheckCircle2, XCircle, Clock, FileText, Circle, Calendar } from 'lucide-react';

interface AttendanceSummaryBadgesProps {
  attendance: AttendanceSummary;
  className?: string;
}

/**
 * Attendance summary indicator with tooltip.
 * Shows a single icon that reveals detailed breakdown on hover.
 */
const AttendanceSummaryBadges: React.FC<AttendanceSummaryBadgesProps> = ({ 
  attendance, 
  className = '',
}) => {
  const totalMarked = attendance.present + attendance.absent + attendance.late + attendance.excused;
  const totalLessons = totalMarked + attendance.notMarked;

  if (totalLessons === 0) {
    return (
      <div className={`flex justify-center ${className}`}>
        <span className="text-white/30 text-sm">—</span>
      </div>
    );
  }

  const attendanceRate = totalLessons > 0 ? Math.round((attendance.present / totalLessons) * 100) : 0;

  // Build tooltip items
  const tooltipItems = [
    { label: 'Present', value: attendance.present, icon: CheckCircle2, iconColor: 'text-emerald-400' },
    { label: 'Absent', value: attendance.absent, icon: XCircle, iconColor: 'text-red-400' },
    { label: 'Late', value: attendance.late, icon: Clock, iconColor: 'text-amber-400' },
    { label: 'Excused', value: attendance.excused, icon: FileText, iconColor: 'text-blue-400' },
    ...(attendance.notMarked > 0 ? [{ label: 'Not Marked', value: attendance.notMarked, icon: Circle, iconColor: 'text-gray-400' }] : []),
  ];

  return (
    <InfoTooltip
      title="Attendance Summary"
      titleIcon={Calendar}
      titleColor="text-blue-300"
      items={tooltipItems}
      summary={`${attendanceRate}% attendance rate (${totalLessons} lessons)`}
    >
      <button
        className={`group flex items-center justify-center gap-1.5 p-1.5 rounded-lg border
          bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50
          transition-all duration-200 cursor-pointer ${className}`}
        aria-label="View attendance details"
      >
        <Calendar className="w-4 h-4 text-blue-400" />
      </button>
    </InfoTooltip>
  );
};

export default React.memo(AttendanceSummaryBadges);
