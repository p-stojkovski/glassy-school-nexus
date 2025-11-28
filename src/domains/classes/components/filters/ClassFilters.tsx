import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import SearchInput from '@/components/common/SearchInput';
import { User, Loader2, AlertCircle } from 'lucide-react';
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
  showOnlyWithAvailableSlots: boolean;
  onFilterChange: (type: string, value: string) => void;
  clearFilters?: () => void;
  viewMode?: ClassViewMode;
  onViewModeChange?: (mode: ClassViewMode) => void;
  isSearching?: boolean;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchTerm,
  onSearchChange,
  subjectFilter,
  teacherFilter,
  showOnlyWithAvailableSlots,
  onFilterChange,
  clearFilters,
  viewMode = 'table',
  onViewModeChange,
  isSearching = false,
}) => {
  const { teachers, isLoading: isLoadingTeachers, error: teachersError } = useTeachers();

  // Sort teachers by name
  const sortedTeachers = React.useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name)),
    [teachers]
  );

  // Only show teacher filter if teacherFilter prop is provided
  const showTeacherFilter = teacherFilter !== undefined;

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search classes by name, teacher, or subject..."
              isSearching={isSearching}
            />
          </div>

          {/* Subject Filter */}
          <div className="w-full lg:w-48">
            <SubjectsDropdown
              value={subjectFilter}
              onValueChange={(value) => onFilterChange('subject', value)}
              includeAllOption={true}
              allOptionLabel="All Subjects"
              showIcon={false}
              className="bg-white/10 border-white/20"
            />
          </div>

          {/* Teacher Filter - only shown when teacherFilter prop is provided */}
          {showTeacherFilter && (
            <div className="w-full lg:w-48">
              <Select
                value={teacherFilter}
                onValueChange={(value) => onFilterChange('teacher', value)}
                disabled={isLoadingTeachers}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  {isLoadingTeachers ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : teachersError ? (
                    <div className="flex items-center text-red-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span>Error</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="All Teachers" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
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
        </div>

        <div className="flex gap-2 lg:flex-shrink-0 w-full lg:w-auto">
           <ClearFiltersButton onClick={clearFilters} />
        </div>
      </div>
    </GlassCard>
  );
};

export default ClassFilters;

