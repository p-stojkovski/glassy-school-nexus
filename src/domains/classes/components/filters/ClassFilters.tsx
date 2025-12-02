import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import SearchInput from '@/components/common/SearchInput';
import { User, Loader2, AlertCircle, EyeOff, Eye } from 'lucide-react';
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
  showDisabled: boolean;
  onShowDisabledChange: (show: boolean) => void;
  onFilterChange: (type: string, value: string) => void;
  clearFilters?: () => void;
  viewMode?: ClassViewMode;
  onViewModeChange?: (mode: ClassViewMode) => void;
  isSearching?: boolean;
  hasDisabledClasses?: boolean;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchTerm,
  onSearchChange,
  subjectFilter,
  teacherFilter,
  showOnlyWithAvailableSlots,
  showDisabled,
  onShowDisabledChange,
  onFilterChange,
  clearFilters,
  viewMode = 'table',
  onViewModeChange,
  isSearching = false,
  hasDisabledClasses = false,
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
          {/* Show Disabled Classes Toggle - Premium style button */}
          {hasDisabledClasses && (
            <button
              onClick={() => onShowDisabledChange(!showDisabled)}
              className={`
                group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                transition-all duration-300 ease-out
                ${showDisabled 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/40 shadow-lg shadow-purple-500/10' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Icon with glow effect when active */}
              <div className={`
                relative transition-all duration-300
                ${showDisabled ? 'text-purple-400' : 'text-white/50 group-hover:text-white/70'}
              `}>
                {showDisabled ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                {showDisabled && (
                  <div className="absolute inset-0 blur-md bg-purple-400/50 -z-10" />
                )}
              </div>
              
              {/* Label */}
              <span className={`
                text-sm font-medium transition-colors duration-300
                ${showDisabled ? 'text-white' : 'text-white/60 group-hover:text-white/80'}
              `}>
                Disabled
              </span>
              
              {/* Status indicator dot */}
              <div className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${showDisabled 
                  ? 'bg-purple-400 shadow-lg shadow-purple-400/50' 
                  : 'bg-white/30 group-hover:bg-white/40'
                }
              `} />
            </button>
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