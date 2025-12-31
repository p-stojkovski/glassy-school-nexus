import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import SearchInput from '@/components/common/SearchInput';

interface TeacherFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  subjectFilter: string;
  setSubjectFilter: (filter: string) => void;
  clearFilters: () => void;
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  subjectFilter,
  setSubjectFilter,
  clearFilters,
}) => {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search teachers by name, email, or subject..."
          />
        </div>
        {/* Subject Filter */}
        <div className="w-full lg:w-56">
          <SubjectsDropdown
            value={subjectFilter}
            onValueChange={setSubjectFilter}
            includeAllOption={true}
            allOptionLabel="All Subjects"
          />
        </div>
        {/* Clear Filters Button */}
        <div className="w-full lg:w-auto">
          <ClearFiltersButton onClick={clearFilters} />
        </div>
      </div>
    </GlassCard>
  );
};

export default TeacherFilters;
