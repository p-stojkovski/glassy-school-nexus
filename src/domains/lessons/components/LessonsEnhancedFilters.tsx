import React, { useEffect, useMemo } from 'react';
import { FilterX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LabeledSelect from '@/components/common/LabeledSelect';
import { Button } from '@/components/ui/button';
import { LessonStatusName, LessonTimeWindow } from '@/types/api/lesson';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';
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
  // Semester filter (optional)
  semesters?: AcademicSemesterResponse[];
  selectedSemesterId?: string;
  onSemesterChange?: (value: string) => void;
  loadingSemesters?: boolean;

  /** Optional defaults for showing Reset only when needed */
  defaultStatusFilter?: LessonFilter;
  defaultScopeFilter?: ScopeFilter;
  defaultTimeWindow?: LessonTimeWindow;
  defaultSemesterId?: string;
}

type DateRangePreset =
  | 'upcoming_week'
  | 'upcoming_month'
  | 'upcoming_all'
  | 'past_week'
  | 'past_month'
  | 'past_all'
  | 'all_all';

const LessonsEnhancedFilters: React.FC<LessonsEnhancedFiltersProps> = ({
  statusFilter,
  onStatusChange,
  scopeFilter,
  onScopeChange,
  timeWindow,
  onTimeWindowChange,
  compact = false,
  // Semester props
  semesters = [],
  selectedSemesterId = 'all',
  onSemesterChange,
  loadingSemesters = false,

  defaultStatusFilter = 'all',
  defaultScopeFilter = 'upcoming',
  defaultTimeWindow = 'month',
  defaultSemesterId = 'all',
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
    return defaultTimeWindow;
  }, [defaultTimeWindow, scopeFilter, timeWindow]);

  const dateRangePreset: DateRangePreset = useMemo(() => {
    if (scopeFilter === 'all') return 'all_all';
    if (scopeFilter === 'upcoming') return `upcoming_${effectiveTimeWindow}` as DateRangePreset;
    if (scopeFilter === 'past') return `past_${effectiveTimeWindow}` as DateRangePreset;
    return 'upcoming_month';
  }, [effectiveTimeWindow, scopeFilter]);

  useEffect(() => {
    // Keep state consistent for the 'all dates' view.
    if (scopeFilter === 'all' && timeWindow !== 'all') {
      onTimeWindowChange('all');
    }
  }, [onTimeWindowChange, scopeFilter, timeWindow]);

  const semesterActive = semesters.length > 0 && selectedSemesterId !== defaultSemesterId;
  const hasAnyNonDefaultFilter =
    statusFilter !== defaultStatusFilter ||
    scopeFilter !== defaultScopeFilter ||
    effectiveTimeWindow !== defaultTimeWindow ||
    semesterActive;

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

  const handleReset = () => {
    onStatusChange(defaultStatusFilter);
    onScopeChange(defaultScopeFilter);
    onTimeWindowChange(defaultTimeWindow);
    onSemesterChange?.(defaultSemesterId);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {/* Date range */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-white/50 font-medium">Date range:</span>
          <Select value={dateRangePreset} onValueChange={(value) => handleDateRangeChange(value as DateRangePreset)}>
            <SelectTrigger className={`${compact ? 'w-[160px]' : 'w-[200px]'} bg-white/10 border-white/20 text-white h-9`}>
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

        {/* Semester Filter */}
        {semesters.length > 0 && (
          <LabeledSelect label="Semester:" labelId="lessons-semester-label">
            <Select value={selectedSemesterId} onValueChange={(value) => onSemesterChange?.(value)} disabled={loadingSemesters}>
              <SelectTrigger aria-labelledby="lessons-semester-label" className={`${compact ? 'w-[200px]' : 'w-[240px]'} bg-white/10 border-white/20 text-white h-9`}>
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-white/20">
                <SelectItem value="all" className="text-white focus:bg-white/10">All Semesters</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id} className="text-white focus:bg-white/10">
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledSelect>
        )}

        {hasAnyNonDefaultFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
            onClick={handleReset}
          >
            <FilterX className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonsEnhancedFilters;
