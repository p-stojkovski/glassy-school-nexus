import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HomeworkSummary } from '@/types/api/class';
import { CheckCircle2, AlertTriangle, XCircle, Circle } from 'lucide-react';

interface HomeworkSummaryBadgesProps {
  homework: HomeworkSummary;
  className?: string;
}

const HomeworkSummaryBadges: React.FC<HomeworkSummaryBadgesProps> = ({ homework, className = '' }) => {
  const badges = [
    {
      count: homework.complete,
      label: 'Complete',
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30',
      show: homework.complete > 0,
    },
    {
      count: homework.partial,
      label: 'Partial',
      icon: AlertTriangle,
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30',
      show: homework.partial > 0,
    },
    {
      count: homework.missing,
      label: 'Missing',
      icon: XCircle,
      color: 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30',
      show: homework.missing > 0,
    },
    {
      count: homework.notChecked,
      label: 'Not Checked',
      icon: Circle,
      color: 'bg-gray-500/20 text-gray-300 border-gray-400/30 hover:bg-gray-500/30',
      show: homework.notChecked > 0,
    },
  ];

  const visibleBadges = badges.filter((b) => b.show);

  if (visibleBadges.length === 0) {
    return <span className="text-white/40 text-sm">No data</span>;
  }

  const totalChecked = homework.complete + homework.partial + homework.missing;
  const totalLessons = totalChecked + homework.notChecked;
  const completionRate = totalLessons > 0 ? Math.round(((homework.complete + homework.partial * 0.5) / totalLessons) * 100) : 0;
  const tooltipText = `Homework: ${homework.complete} Complete, ${homework.partial} Partial, ${homework.missing} Missing${homework.notChecked > 0 ? `, ${homework.notChecked} Not Checked` : ''} (${completionRate}% completion rate)`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex flex-wrap items-center gap-1.5 ${className}`} role="group" aria-label="Homework summary">
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
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 border-gray-700">
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(HomeworkSummaryBadges);
