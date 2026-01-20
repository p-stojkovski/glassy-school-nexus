import React, { useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import type { LessonStatusName } from '@/types/api/teacherLesson';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';
import { LessonTimeWindow } from '@/types/api/lesson';

type DateRangePreset =
  | 'upcoming_week'
  | 'upcoming_month'
  | 'upcoming_all'
  | 'past_week'
  | 'past_month'
  | 'past_all'
  | 'all_all';

interface TeacherLessonsFiltersProps {
  selectedStatus: LessonStatusName | 'All';
  onStatusChange: (status: LessonStatusName | 'All') => void;
  selectedClassId: string | null;
  onClassIdChange: (classId: string | null) => void;
  scopeFilter: ScopeFilter;
  onScopeChange: (scope: ScopeFilter) => void;
  timeWindow: LessonTimeWindow;
  onTimeWindowChange: (window: LessonTimeWindow) => void;
  classes: { id: string; name: string }[];
  onClearFilters?: () => void;
}

export const TeacherLessonsFilters: React.FC<TeacherLessonsFiltersProps> = ({
  selectedStatus,
  onStatusChange,
  selectedClassId,
  onClassIdChange,
  scopeFilter,
  onScopeChange,
  timeWindow,
  onTimeWindowChange,
  classes,
  onClearFilters,
}) => {
  const dateRangeOptions = useMemo(() => ([
    { value: 'upcoming_week', label: 'Next 7 days' },
    { value: 'past_week', label: 'Last 7 days' },
    { value: 'upcoming_month', label: 'Next 30 days' },
    { value: 'past_month', label: 'Last 30 days' },
    { value: 'upcoming_all', label: 'All upcoming' },
    { value: 'past_all', label: 'All past' },
    { value: 'all_all', label: 'All dates' },
  ] satisfies { value: DateRangePreset; label: string }[]), []);

  const effectiveTimeWindow: LessonTimeWindow = useMemo(() => {
    if (scopeFilter === 'all') return 'all';
    if (timeWindow === 'week' || timeWindow === 'month' || timeWindow === 'all') return timeWindow;
    return 'month';
  }, [scopeFilter, timeWindow]);

  const dateRangePreset: DateRangePreset = useMemo(() => {
    if (scopeFilter === 'all') return 'all_all';
    if (scopeFilter === 'upcoming') return `upcoming_${effectiveTimeWindow}` as DateRangePreset;
    if (scopeFilter === 'past') return `past_${effectiveTimeWindow}` as DateRangePreset;
    return 'all_all';
  }, [effectiveTimeWindow, scopeFilter]);

  useEffect(() => {
    // Keep state consistent for the 'all dates' view.
    if (scopeFilter === 'all' && timeWindow !== 'all') {
      onTimeWindowChange('all');
    }
  }, [onTimeWindowChange, scopeFilter, timeWindow]);

  const handleDateRangeChange = (preset: DateRangePreset) => {
    if (preset === 'all_all') {
      onScopeChange('all');
      onTimeWindowChange('all');
      return;
    }

    const [scope, window] = preset.split('_') as ['upcoming' | 'past', LessonTimeWindow];
    onScopeChange(scope);
    onTimeWindowChange(window);
  };

  const hasActiveFilters =
    selectedStatus !== 'All' ||
    selectedClassId !== null ||
    scopeFilter !== 'all' ||
    timeWindow !== 'all';

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Date Range Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Date range:</span>
        <Select value={dateRangePreset} onValueChange={(value) => handleDateRangeChange(value as DateRangePreset)}>
          <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            {dateRangeOptions.map(option => (
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
        <Select
          value={selectedStatus}
          onValueChange={(value) => onStatusChange(value as LessonStatusName | 'All')}
        >
          <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            <SelectItem value="All" className="text-white focus:bg-white/10 focus:text-white">
              All
            </SelectItem>
            <SelectItem value="Scheduled" className="text-white focus:bg-white/10 focus:text-white">
              Scheduled
            </SelectItem>
            <SelectItem value="Conducted" className="text-white focus:bg-white/10 focus:text-white">
              Conducted
            </SelectItem>
            <SelectItem value="Cancelled" className="text-white focus:bg-white/10 focus:text-white">
              Cancelled
            </SelectItem>
            <SelectItem value="Make Up" className="text-white focus:bg-white/10 focus:text-white">
              Make Up
            </SelectItem>
            <SelectItem value="No Show" className="text-white focus:bg-white/10 focus:text-white">
              No Show
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Class Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Class:</span>
        <Select
          value={selectedClassId ?? 'all'}
          onValueChange={(value) => onClassIdChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white h-9">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white">
              All Classes
            </SelectItem>
            {classes.map((cls) => (
              <SelectItem
                key={cls.id}
                value={cls.id}
                className="text-white focus:bg-white/10 focus:text-white"
              >
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && onClearFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-1.5 border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
          onClick={onClearFilters}
        >
          <FilterX className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};
