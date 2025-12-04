import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import SearchInput from '@/components/common/SearchInput';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeachers } from '@/hooks/useTeachers';

export type ClassViewMode = 'grid' | 'table';

interface ClassFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  subjectFilter: 'all' | string;
  teacherFilter?: 'all' | string;
  statusFilter: 'all' | 'active' | 'inactive';
  showOnlyWithAvailableSlots: boolean;
  onFilterChange: (type: string, value: string) => void;
  clearFilters?: () => void;
  viewMode?: ClassViewMode;
  onViewModeChange?: (mode: ClassViewMode) => void;
  isSearching?: boolean;
  hasActiveFilters?: boolean;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchTerm,
  onSearchChange,
  subjectFilter,
  teacherFilter,
  statusFilter,
  showOnlyWithAvailableSlots,
  onFilterChange,
  clearFilters,
  isSearching = false,
  hasActiveFilters = false,
}) => {
  const { teachers, isLoading: isLoadingTeachers, error: teachersError } = useTeachers();

  // Sort teachers by name
  const sortedTeachers = React.useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name)),
    [teachers]
  );

  // Only show teacher filter if teacherFilter prop is provided
  const showTeacherFilter = teacherFilter !== undefined;

  // Common styles for filter containers
  const filterContainerClass = "flex flex-col gap-1.5";
  const labelClass = "text-xs font-medium text-white/70";
  const selectTriggerClass = "h-9 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 focus:ring-1 focus:ring-white/20";

  return (
    <GlassCard className="p-4">
      {/* Single row: Search + all filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-end">
        {/* Search Input - grows to fill available space */}
        <div className={`${filterContainerClass} w-full lg:flex-1 lg:min-w-0`}>
          <Label htmlFor="class-search" className={labelClass}>
            Search
          </Label>
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search by name, teacher, or subject..."
            isSearching={isSearching}
            className="h-9"
          />
        </div>

        {/* Subject Filter */}
        <div className={`${filterContainerClass} w-full sm:w-1/4 lg:w-44 lg:flex-shrink-0`}>
          <Label htmlFor="subject-filter" className={labelClass}>
            Subject
          </Label>
          <SubjectsDropdown
            value={subjectFilter}
            onValueChange={(value) => onFilterChange('subject', value)}
            includeAllOption={true}
            allOptionLabel="All"
            showIcon={false}
            className={selectTriggerClass}
          />
        </div>

        {/* Teacher Filter */}
        {showTeacherFilter && (
          <div className={`${filterContainerClass} w-full sm:w-1/4 lg:w-44 lg:flex-shrink-0`}>
              <Label htmlFor="teacher-filter" className={labelClass}>
                Teacher
              </Label>
              <Select
                value={teacherFilter}
                onValueChange={(value) => onFilterChange('teacher', value)}
                disabled={isLoadingTeachers}
              >
                <SelectTrigger className={selectTriggerClass}>
                  {isLoadingTeachers ? (
                    <div className="flex items-center">
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : teachersError ? (
                    <div className="flex items-center text-red-400">
                      <AlertCircle className="w-3.5 h-3.5 mr-2" />
                      <span>Error</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="All" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {teachersError ? (
                    <SelectItem value="__error__" disabled>
                      Failed to load teachers
                    </SelectItem>
                  ) : (
                    sortedTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
        )}

        {/* Status Filter */}
        <div className={`${filterContainerClass} w-full sm:w-1/4 lg:w-40 lg:flex-shrink-0`}>
            <Label htmlFor="status-filter" className={labelClass}>
              Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => onFilterChange('status', value)}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span>Inactive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Enrollment Filter */}
        <div className={`${filterContainerClass} w-full sm:w-1/4 lg:w-44 lg:flex-shrink-0`}>
            <Label htmlFor="enrollment-filter" className={labelClass}>
              Enrollment
            </Label>
            <Select
              value={showOnlyWithAvailableSlots ? 'open' : 'all'}
              onValueChange={(value) => onFilterChange('availableSlots', value === 'open' ? 'available' : 'all')}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Open slots</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Clear Filters Button - always visible */}
        <Button
          onClick={clearFilters}
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 shrink-0"
          disabled={!hasActiveFilters}
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Clear
        </Button>
        </div>
    </GlassCard>
  );
};

export default ClassFilters;
