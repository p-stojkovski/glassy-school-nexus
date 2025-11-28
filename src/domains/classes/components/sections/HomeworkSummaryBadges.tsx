import React from 'react';
import InfoTooltip from '@/components/common/InfoTooltip';
import { HomeworkSummary } from '@/types/api/class';
import { CheckCircle2, AlertTriangle, XCircle, Circle, BookOpen } from 'lucide-react';

interface HomeworkSummaryBadgesProps {
  homework: HomeworkSummary;
  className?: string;
}

/**
 * Homework summary indicator with tooltip.
 * Shows a single icon that reveals detailed breakdown on hover.
 */
const HomeworkSummaryBadges: React.FC<HomeworkSummaryBadgesProps> = ({ 
  homework, 
  className = '',
}) => {
  const totalChecked = homework.complete + homework.partial + homework.missing;
  const totalLessons = totalChecked + homework.notChecked;

  if (totalLessons === 0) {
    return (
      <div className={`flex justify-center ${className}`}>
        <span className="text-white/30 text-sm">—</span>
      </div>
    );
  }

  const completionRate = totalLessons > 0 ? Math.round(((homework.complete + homework.partial * 0.5) / totalLessons) * 100) : 0;

  // Build tooltip items
  const tooltipItems = [
    { label: 'Complete', value: homework.complete, icon: CheckCircle2, iconColor: 'text-emerald-400' },
    { label: 'Partial', value: homework.partial, icon: AlertTriangle, iconColor: 'text-amber-400' },
    { label: 'Missing', value: homework.missing, icon: XCircle, iconColor: 'text-red-400' },
    ...(homework.notChecked > 0 ? [{ label: 'Not Checked', value: homework.notChecked, icon: Circle, iconColor: 'text-gray-400' }] : []),
  ];

  return (
    <InfoTooltip
      title="Homework Summary"
      titleIcon={BookOpen}
      titleColor="text-purple-300"
      items={tooltipItems}
      summary={`${completionRate}% completion rate (${totalLessons} lessons)`}
    >
      <button
        className={`group flex items-center justify-center gap-1.5 p-1.5 rounded-lg border
          bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50
          transition-all duration-200 cursor-pointer ${className}`}
        aria-label="View homework details"
      >
        <BookOpen className="w-4 h-4 text-purple-400" />
      </button>
    </InfoTooltip>
  );
};

export default React.memo(HomeworkSummaryBadges);
