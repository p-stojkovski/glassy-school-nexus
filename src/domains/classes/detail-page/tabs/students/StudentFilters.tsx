import React from 'react';
import { FilterX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StudentFilter } from '@/domains/classes/_shared/utils/studentFilters';

interface StudentFiltersProps {
  filter: StudentFilter;
  onFilterChange: (value: StudentFilter) => void;
  compact?: boolean;
  defaultFilter?: StudentFilter;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  filter,
  onFilterChange,
  compact = false,
  defaultFilter = 'all',
}) => {
  const hasNonDefaultFilter = filter !== defaultFilter;

  const handleClear = () => {
    onFilterChange(defaultFilter);
  };
  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Student Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Filter:</span>
        <Select value={filter} onValueChange={(value) => onFilterChange(value as StudentFilter)}>
          <SelectTrigger className={`${compact ? 'w-[160px]' : 'w-[180px]'} bg-white/10 border-white/20 text-white h-9`}>
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            <SelectItem value="all" className="text-white focus:bg-white/10">
              All students
            </SelectItem>
            <SelectItem value="needsAttention" className="text-white focus:bg-white/10">
              Needs attention
            </SelectItem>
            <SelectItem value="attendanceIssues" className="text-white focus:bg-white/10">
              Attendance issues
            </SelectItem>
            <SelectItem value="paymentDue" className="text-white focus:bg-white/10">
              Payment due
            </SelectItem>
            <SelectItem value="hasNotes" className="text-white focus:bg-white/10">
              Has notes
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasNonDefaultFilter && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-1.5 border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
          onClick={handleClear}
        >
          <FilterX className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default StudentFilters;
