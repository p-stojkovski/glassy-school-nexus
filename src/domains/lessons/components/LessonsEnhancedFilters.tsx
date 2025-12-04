import React, { useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LessonStatusName, LessonTimeWindow } from '@/types/api/lesson';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';

type LessonFilter = 'all' | LessonStatusName;

interface LessonsEnhancedFiltersProps {
  statusFilter: LessonFilter;
  onStatusChange: (value: LessonFilter) => void;
  scopeFilter: ScopeFilter;
  onScopeChange: (value: ScopeFilter) => void;
  timeWindow: LessonTimeWindow;
  onTimeWindowChange: (value: LessonTimeWindow) => void;
  compact?: boolean;
}

const LessonsEnhancedFilters: React.FC<LessonsEnhancedFiltersProps> = ({
  statusFilter,
  onStatusChange,
  scopeFilter,
  onScopeChange,
  timeWindow,
  onTimeWindowChange,
  compact = false,
}) => {
  const windowOptions = useMemo(() => {
    if (scopeFilter === 'upcoming') {
      return [
        { value: 'week', label: 'Next 7 days' },
        { value: 'month', label: 'Next 30 days' },
        { value: 'all', label: 'All upcoming' },
      ] satisfies { value: LessonTimeWindow; label: string }[];
    }

    if (scopeFilter === 'past') {
      return [
        { value: 'week', label: 'Last 7 days' },
        { value: 'month', label: 'Last 30 days' },
        { value: 'all', label: 'All past' },
      ] satisfies { value: LessonTimeWindow; label: string }[];
    }

    return [
      { value: 'all', label: 'All dates' },
    ] satisfies { value: LessonTimeWindow; label: string }[];
  }, [scopeFilter]);

  const effectiveWindow = windowOptions.some(option => option.value === timeWindow)
    ? timeWindow
    : windowOptions[0].value;

  useEffect(() => {
    if (effectiveWindow !== timeWindow) {
      onTimeWindowChange(effectiveWindow);
    }
  }, [effectiveWindow, onTimeWindowChange, timeWindow]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Time Filter - scope */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Scope:</span>
        <Select value={scopeFilter} onValueChange={(value) => onScopeChange(value as ScopeFilter)}>
          <SelectTrigger className={`${compact ? 'w-[120px]' : 'w-[140px]'} bg-white/10 border-white/20 text-white h-9`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            <SelectItem value="upcoming" className="text-white focus:bg-white/10">
              Upcoming
            </SelectItem>
            <SelectItem value="past" className="text-white focus:bg-white/10">
              Past
            </SelectItem>
            <SelectItem value="all" className="text-white focus:bg-white/10">
              All
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Window Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Window:</span>
        <Select value={effectiveWindow} onValueChange={(value) => onTimeWindowChange(value as LessonTimeWindow)}>
          <SelectTrigger className={`${compact ? 'w-[150px]' : 'w-[170px]'} bg-white/10 border-white/20 text-white h-9`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            {windowOptions.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-white focus:bg-white/10">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Status:</span>
        <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as LessonFilter)}>
          <SelectTrigger className={`${compact ? 'w-[120px]' : 'w-[140px]'} bg-white/10 border-white/20 text-white h-9`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
        <SelectContent className="bg-gray-900/95 border-white/20">
          <SelectItem value="all" className="text-white focus:bg-white/10">
            All
          </SelectItem>
          <SelectItem value="Scheduled" className="text-white focus:bg-white/10">
            Scheduled
          </SelectItem>
          <SelectItem value="Conducted" className="text-white focus:bg-white/10">
            Conducted
          </SelectItem>
          <SelectItem value="Cancelled" className="text-white focus:bg-white/10">
            Cancelled
          </SelectItem>
          <SelectItem value="Make Up" className="text-white focus:bg-white/10">
            Make Up
          </SelectItem>
          <SelectItem value="No Show" className="text-white focus:bg-white/10">
            No Show
          </SelectItem>
        </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LessonsEnhancedFilters;
