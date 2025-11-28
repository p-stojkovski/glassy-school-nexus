import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AttendanceSummary } from '@/types/api/class';
import { CheckCircle2, XCircle, Clock, FileText, Circle } from 'lucide-react';
import TrendIndicator from './TrendIndicator';
import { calculateAttendanceTrend } from './trendUtils';

interface AttendanceSummaryBadgesProps {
  attendance: AttendanceSummary;
  className?: string;
  showTrend?: boolean;
}

const AttendanceSummaryBadges: React.FC<AttendanceSummaryBadgesProps> = ({ 
  attendance, 
  className = '',
  showTrend = true,
}) => {
  const badges = [
    {
      count: attendance.present,
      label: 'Present',
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30',
      show: attendance.present > 0,
    },
    {
      count: attendance.absent,
      label: 'Absent',
      icon: XCircle,
      color: 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30',
      show: attendance.absent > 0,
    },
    {
      count: attendance.late,
      label: 'Late',
      icon: Clock,
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30',
      show: attendance.late > 0,
    },
    {
      count: attendance.excused,
      label: 'Excused',
      icon: FileText,
      color: 'bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30',
      show: attendance.excused > 0,
    },
    {
      count: attendance.notMarked,
      label: 'Not Marked',
      icon: Circle,
      color: 'bg-gray-500/20 text-gray-300 border-gray-400/30 hover:bg-gray-500/30',
      show: attendance.notMarked > 0,
    },
  ];

  const visibleBadges = badges.filter((b) => b.show);

  if (visibleBadges.length === 0) {
    return <span className="text-white/40 text-sm">No data</span>;
  }

  const totalMarked = attendance.present + attendance.absent + attendance.late + attendance.excused;
  const totalLessons = totalMarked + attendance.notMarked;
  const tooltipText = `Attendance: ${attendance.present} Present, ${attendance.absent} Absent, ${attendance.late} Late, ${attendance.excused} Excused${attendance.notMarked > 0 ? `, ${attendance.notMarked} Not Marked` : ''} (${totalLessons} total lessons)`;

  // Calculate trend based on absence rate
  const trend = showTrend && totalLessons >= 4 
    ? calculateAttendanceTrend(attendance.present, attendance.absent, totalLessons)
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex flex-wrap items-center gap-1.5 ${className}`} role="group" aria-label="Attendance summary">
            {visibleBadges.map(({ count, label, icon: Icon, color }) => (
              <Badge
                key={label}
                variant="outline"
                className={`${color} transition-colors cursor-default text-xs px-2 py-0.5 flex items-center gap-1`}
                aria-label={`${count} ${label}`}
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                <span className="font-semibold">{count}</span>
              </Badge>
            ))}
            {trend && (
              <TrendIndicator 
                direction={trend.direction} 
                tooltipText={trend.tooltip}
                size="sm"
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 border-gray-700">
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(AttendanceSummaryBadges);
