import React from 'react';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useTeacherSchedule } from './useTeacherSchedule';
import TeacherScheduleGrid from './TeacherScheduleGrid';
import ScheduleStatsBar from './ScheduleStatsBar';

interface TeacherScheduleTabProps {
  teacherId: string;
}

/**
 * Schedule tab displaying teacher's weekly teaching schedule.
 * Shows aggregated schedule from all assigned classes with stats and weekly grid.
 * Read-only view - clicking a slot navigates to the class detail page.
 */
const TeacherScheduleTab: React.FC<TeacherScheduleTabProps> = ({ teacherId }) => {
  const {
    filteredSlots,
    stats,
    loading,
    error,
    showInactiveClasses,
    setShowInactiveClasses,
    refresh,
  } = useTeacherSchedule({ teacherId });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner message="Loading schedule..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={refresh}
      />
    );
  }

  // Empty state
  if (filteredSlots.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
          <CalendarIcon className="w-6 h-6 text-white/40" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Schedule Found</h3>
        <p className="text-white/60 mb-4 max-w-md mx-auto">
          {showInactiveClasses
            ? "This teacher doesn't have any schedule slots from assigned classes."
            : "This teacher doesn't have any schedule slots from active classes. Try enabling 'Show inactive classes' to see more."}
        </p>
        {!showInactiveClasses && (
          <button
            onClick={() => setShowInactiveClasses(true)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Show inactive classes
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filter toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          {stats && <ScheduleStatsBar stats={stats} />}
        </div>

        {/* Show inactive classes toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactiveClasses}
            onCheckedChange={setShowInactiveClasses}
          />
          <Label
            htmlFor="show-inactive"
            className="text-sm text-white/70 cursor-pointer"
          >
            Show inactive classes
          </Label>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="text-sm text-white/70">
          Click on a schedule slot to view or edit the class schedule.
        </span>
      </div>

      {/* Weekly grid */}
      <TeacherScheduleGrid slots={filteredSlots} />
    </div>
  );
};

export default TeacherScheduleTab;
