import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentFilter } from '@/domains/classes/utils/studentFilters';

interface StudentFiltersProps {
  filter: StudentFilter;
  onFilterChange: (value: StudentFilter) => void;
  compact?: boolean;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  filter,
  onFilterChange,
  compact = false,
}) => {
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
    </div>
  );
};

export default StudentFilters;
