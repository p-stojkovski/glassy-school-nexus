import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import SearchInput from '@/components/common/SearchInput';

export type ClassViewMode = 'grid' | 'table';

interface ClassFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  subjectFilter: 'all' | string;
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
  showOnlyWithAvailableSlots,
  onFilterChange,
  clearFilters,
  viewMode = 'table',
  onViewModeChange,
  isSearching = false,
}) => {
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
        </div>

        <div className="flex gap-2 lg:flex-shrink-0 w-full lg:w-auto">
           <ClearFiltersButton onClick={clearFilters} />
        </div>
      </div>
    </GlassCard>
  );
};

export default ClassFilters;

