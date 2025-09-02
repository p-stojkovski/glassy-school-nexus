import React from 'react';
import { Search, Filter, Users, Grid, List, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GlassCard from '@/components/common/GlassCard';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import { Button } from '@/components/ui/button';

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
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <div className="relative w-5 h-5">
                <Search className={`absolute inset-0 text-white/60 w-5 h-5 transition-opacity duration-200 ${
                  isSearching ? 'opacity-0' : 'opacity-100'
                }`} />
                <Loader2 className={`absolute inset-0 text-blue-400 w-5 h-5 animate-spin transition-opacity duration-200 ${
                  isSearching ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
            </div>
            <Input
              placeholder="Search classes by name, teacher, or subject..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`pl-10 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/60 transition-all duration-200 ${
                isSearching 
                  ? 'border-blue-400/50 bg-white/5' 
                  : 'hover:border-white/30 focus:border-white/40'
              }`}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <span>Searching...</span>
                </div>
              </div>
            )}
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
      </div>
    </GlassCard>
  );
};

export default ClassFilters;
