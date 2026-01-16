import React from 'react';
import { Calendar } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';
import { LessonStatusName } from '@/types/api/lesson';

type LessonFilter = 'all' | LessonStatusName;

interface LessonsEmptyStateProps {
  lessonsCount: number;
  scheduleAvailable: boolean;
  scopeFilter: ScopeFilter;
  statusFilter: LessonFilter;
}

/**
 * Get the appropriate empty message based on current state
 */
export function getEmptyMessage(
  lessonsCount: number,
  scopeFilter: ScopeFilter
): string {
  if (lessonsCount === 0) {
    return "No lessons yet";
  }
  if (scopeFilter === 'upcoming' && lessonsCount === 0) {
    return "No upcoming lessons scheduled";
  }
  return "No lessons found matching your filters";
}

/**
 * Get the appropriate empty description based on current state
 */
export function getEmptyDescription(
  lessonsCount: number,
  scheduleAvailable: boolean,
  scopeFilter: ScopeFilter
): string {
  if (lessonsCount === 0) {
    if (!scheduleAvailable) {
      return "To create lessons for this class, first add a weekly schedule in the Schedule tab, then return here and use Generate from schedule to create lessons for the term.";
    }
    return "Use Generate from schedule to create lessons for the upcoming period, or add a single lesson manually.";
  }
  if (scopeFilter === 'upcoming' && lessonsCount === 0) {
    return "Use Generate from schedule to create lessons for the upcoming period, or add a single lesson manually.";
  }
  return "There are no lessons to display with the current filters.";
}

/**
 * Empty state component for LessonsTab when no lessons and no schedule available.
 * Returns null if there are lessons or schedule is available.
 */
export function LessonsEmptyState({
  lessonsCount,
  scheduleAvailable,
  scopeFilter,
}: LessonsEmptyStateProps): React.ReactElement | null {
  // Only show custom empty state when no lessons AND no schedule
  if (lessonsCount > 0 || scheduleAvailable) {
    return null;
  }

  const emptyMessage = getEmptyMessage(lessonsCount, scopeFilter);
  const emptyDescription = getEmptyDescription(lessonsCount, scheduleAvailable, scopeFilter);

  return (
    <GlassCard className="p-8 text-center">
      <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{emptyMessage}</h3>
      <p className="text-white/70 mb-4 max-w-md mx-auto">{emptyDescription}</p>
    </GlassCard>
  );
}
