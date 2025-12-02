import React from 'react';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LessonStatusName } from '@/types/api/lesson';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';

type LessonFilter = 'all' | LessonStatusName;

interface LessonsEnhancedFiltersProps {
  statusFilter: LessonFilter;
  onStatusChange: (value: LessonFilter) => void;
  scopeFilter: ScopeFilter;
  onScopeChange: (value: ScopeFilter) => void;
  compact?: boolean;
}

const LessonsEnhancedFilters: React.FC<LessonsEnhancedFiltersProps> = ({
  statusFilter,
  onStatusChange,
  scopeFilter,
  onScopeChange,
  compact = false,
}) => {
  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || scopeFilter !== 'all';

  const clearAllFilters = () => {
    onStatusChange('all');
    onScopeChange('all');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Time Filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/50">Time:</span>
        <Select value={scopeFilter} onValueChange={(value) => onScopeChange(value as ScopeFilter)}>
          <SelectTrigger className={`${compact ? 'w-[120px]' : 'w-[140px]'} bg-white/10 border-white/20 text-white h-9`}>
            <SelectValue />
          </SelectTrigger>
        <SelectContent className="bg-gray-900/95 border-white/20">
          <SelectItem value="all" className="text-white focus:bg-white/10">
            All
          </SelectItem>
          <SelectItem value="upcoming" className="text-white focus:bg-white/10">
            Upcoming
          </SelectItem>
          <SelectItem value="past" className="text-white focus:bg-white/10">
            Past
          </SelectItem>
        </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/50">Status:</span>
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

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default LessonsEnhancedFilters;
