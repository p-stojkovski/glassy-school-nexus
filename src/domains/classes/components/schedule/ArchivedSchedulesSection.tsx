import React, { useEffect, useMemo } from 'react';
import { Archive, ChevronDown, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ArchivedScheduleSlotResponse } from '@/types/api/class';
import { sortSchedulesByDay } from '@/domains/classes/utils/scheduleUtils';

/**
 * Props for ArchivedSchedulesSection component
 */
interface ArchivedSchedulesSectionProps {
  /** List of archived schedules */
  archivedSchedules: ArchivedScheduleSlotResponse[];
  /** Whether section is expanded */
  isExpanded: boolean;
  /** Callback to toggle expansion */
  onToggleExpand: () => void;
  /** Whether data is currently loading */
  isLoading: boolean;
}

/**
 * Component displaying archived schedules in a collapsible section
 *
 * Features:
 * - Lazy loads archived schedules on first expand
 * - Shows count of archived schedules
 * - Displays past lesson count for each schedule
 * - Read-only display (no edit/delete)
 * - Clean collapse/expand UI
 *
 * Clean code principles:
 * - Single responsibility: Displays archived schedules only
 * - Composition: Reusable, self-contained
 * - Performance: Lazy loading, proper loading states
 * - Accessibility: Semantic HTML, clear visual hierarchy
 */
const ArchivedSchedulesSection: React.FC<ArchivedSchedulesSectionProps> = ({
  archivedSchedules,
  isExpanded,
  onToggleExpand,
  isLoading,
}) => {
  // Only show section if there are archived schedules
  if (archivedSchedules.length === 0) {
    return null;
  }

  const sortedArchivedSchedules = useMemo(
    () => sortSchedulesByDay(archivedSchedules),
    [archivedSchedules]
  );

  const archivedCount = archivedSchedules.length;
  const totalPastLessons = archivedSchedules.reduce(
    (sum, schedule) => sum + schedule.pastLessonCount,
    0
  );

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-white/10">
      {/* Header with toggle */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-white/5 transition-colors group"
      >
        <ChevronDown
          className={`w-5 h-5 text-yellow-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
        <Archive className="w-5 h-5 text-yellow-500" />
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-white flex items-center gap-2">
            Archived Schedules
            <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              {archivedCount}
            </span>
          </h3>
          <p className="text-sm text-white/60">
            {totalPastLessons} past lesson{totalPastLessons !== 1 ? 's' : ''} across all archived schedules
          </p>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="pl-4 space-y-3">
          {isLoading ? (
            // Loading state
            <div className="flex items-center justify-center py-6">
              <LoaderCircle className="w-5 h-5 text-yellow-500 animate-spin mr-2" />
              <span className="text-white/60">Loading archived schedules...</span>
            </div>
          ) : sortedArchivedSchedules.length > 0 ? (
            // Archived schedules list
            sortedArchivedSchedules.map((schedule) => (
              <GlassCard key={schedule.id} className="p-4 opacity-80 border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {schedule.dayOfWeek}
                      </span>
                      <span className="text-white/70">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mt-1">
                      {schedule.pastLessonCount} past lesson
                      {schedule.pastLessonCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs text-yellow-400 border border-yellow-400/50 rounded">
                      Read-only
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            // Empty state
            <div className="text-center py-6 text-white/60">
              <p>No archived schedules</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchivedSchedulesSection;
