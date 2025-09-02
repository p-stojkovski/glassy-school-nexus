import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/common/GlassCard';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';

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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search teachers by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>{' '}
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
