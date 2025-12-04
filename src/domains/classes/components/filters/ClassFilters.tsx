import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import SearchInput from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTeachers } from '@/hooks/useTeachers';
import { useSubjects } from '@/hooks/useSubjects';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';
import { cn } from '@/lib/utils';

export type ClassViewMode = 'grid' | 'table';

interface ClassFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  academicYearFilter: 'all' | string;
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
  onYearsLoaded?: (years: AcademicYear[]) => void;
  activeYearId?: string | null;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchTerm,
  onSearchChange,
  academicYearFilter,
  subjectFilter,
  teacherFilter,
  statusFilter,
  showOnlyWithAvailableSlots,
  onFilterChange,
  clearFilters,
  isSearching = false,
  hasActiveFilters = false,
  onYearsLoaded,
  activeYearId = null,
}) => {
  const { teachers, isLoading: isLoadingTeachers, error: teachersError } = useTeachers();
  const { subjects, isLoading: isLoadingSubjects, error: subjectsError } = useSubjects();
  const { years, isLoading: isLoadingYears, error: yearsError } = useAcademicYears();

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const emittedYearsRef = useRef(false);

  const sortedTeachers = useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name)),
    [teachers]
  );

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.sortOrder - b.sortOrder),
    [subjects]
  );

  const sortedYears = useMemo(
    () =>
      [...years].sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }),
    [years]
  );

  // Ensure parent receives loaded years (keeps default active year logic intact)
  useEffect(() => {
    if (!emittedYearsRef.current && sortedYears.length > 0) {
      onYearsLoaded?.(sortedYears);
      emittedYearsRef.current = true;
    }
  }, [sortedYears, onYearsLoaded]);

  const closePopover = () => setOpenFilter(null);

  const handleSelect = (type: string, value: string) => {
    onFilterChange(type, value);
    closePopover();
  };

  const yearLabel =
    academicYearFilter === 'all'
      ? 'All Years'
      : sortedYears.find((y) => y.id === academicYearFilter)?.name || 'Year';

  const subjectLabel =
    subjectFilter === 'all'
      ? 'All Subjects'
      : sortedSubjects.find((s) => s.id === subjectFilter)?.name || 'Subject';

  const teacherLabel =
    teacherFilter && teacherFilter !== 'all'
      ? sortedTeachers.find((t) => t.id === teacherFilter)?.name || 'Teacher'
      : 'All Teachers';

  const yearFilterIsActive = academicYearFilter !== 'all';

  const activeChips: { key: string; label: string }[] = [];
  if (searchTerm.trim()) activeChips.push({ key: 'search', label: `Search: ${searchTerm.trim()}` });
  if (yearFilterIsActive) activeChips.push({ key: 'academicYear', label: `Academic Year: ${yearLabel}` });
  if (subjectFilter !== 'all') activeChips.push({ key: 'subject', label: `Subject: ${subjectLabel}` });
  if (teacherFilter && teacherFilter !== 'all') activeChips.push({ key: 'teacher', label: `Teacher: ${teacherLabel}` });
  if (statusFilter !== 'all') {
    const statusName =
      statusFilter === 'inactive'
        ? 'Inactive'
        : 'Active';
    activeChips.push({ key: 'status', label: `Status: ${statusName}` });
  }
  if (showOnlyWithAvailableSlots) activeChips.push({ key: 'availableSlots', label: 'Enrollment: Open slots' });

  const clearSingleChip = (key: string) => {
    switch (key) {
      case 'search':
        onSearchChange('');
        break;
      case 'academicYear':
        onFilterChange('academicYear', activeYearId || 'all');
        break;
      case 'subject':
        onFilterChange('subject', 'all');
        break;
      case 'teacher':
        onFilterChange('teacher', 'all');
        break;
      case 'status':
        onFilterChange('status', 'all');
        break;
      case 'availableSlots':
        onFilterChange('availableSlots', 'all');
        break;
      default:
        break;
    }
  };

  const renderOptions = (
    options: { value: string; label: string; hint?: string }[],
    selected: string,
    onSelect: (value: string) => void,
    isLoading = false,
    error?: string,
    emptyLabel = 'No options found'
  ) => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/70">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
          Loading...
        </div>
      );
    }

    if (error) {
      return (
        <div className="px-3 py-2 text-sm text-amber-200">
          {error}
        </div>
      );
    }

    if (!options.length) {
      return <div className="px-3 py-2 text-sm text-white/50">{emptyLabel}</div>;
    }

    return options.map((option) => (
      <button
        key={option.value}
        onClick={() => onSelect(option.value)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm text-white transition-colors',
          'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40',
          selected === option.value ? 'bg-white/10 border border-cyan-400/30 shadow-inner' : 'border border-transparent'
        )}
      >
        <div className="flex flex-col">
          <span>{option.label}</span>
          {option.hint && <span className="text-xs text-white/50">{option.hint}</span>}
        </div>
        {selected === option.value && <Check className="w-4 h-4 text-cyan-300" />}
      </button>
    ));
  };

  const filterButtonClass =
    'h-10 px-3 rounded-full border border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-colors flex items-center gap-2';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="w-full lg:flex-1 lg:min-w-0">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search by name, teacher, or subject"
            isSearching={isSearching}
            showStatusText={false}
            className="h-11 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/70"
          />
        </div>

        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
          <Popover
            open={openFilter === 'academicYear'}
            onOpenChange={(open) => setOpenFilter(open ? 'academicYear' : null)}
          >
            <PopoverTrigger asChild>
              <Button className={filterButtonClass} variant="outline">
                Academic Year
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
              {renderOptions(
                [
                  { value: 'all', label: 'All Years' },
                  ...sortedYears.map((year) => ({
                    value: year.id,
                    label: year.name,
                    hint: year.isActive ? 'Active year' : undefined,
                  })),
                ],
                academicYearFilter,
                (value) => handleSelect('academicYear', value),
                isLoadingYears,
                yearsError || undefined,
                'No academic years found'
              )}
            </PopoverContent>
          </Popover>

          <Popover
            open={openFilter === 'subject'}
            onOpenChange={(open) => setOpenFilter(open ? 'subject' : null)}
          >
            <PopoverTrigger asChild>
              <Button className={filterButtonClass} variant="outline">
                Subject
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
              {renderOptions(
                [
                  { value: 'all', label: 'All Subjects' },
                  ...sortedSubjects.map((subject) => ({
                    value: subject.id,
                    label: subject.name,
                  })),
                ],
                subjectFilter,
                (value) => handleSelect('subject', value),
                isLoadingSubjects,
                subjectsError || undefined,
                'No subjects found'
              )}
            </PopoverContent>
          </Popover>

          {teacherFilter !== undefined && (
            <Popover
              open={openFilter === 'teacher'}
              onOpenChange={(open) => setOpenFilter(open ? 'teacher' : null)}
            >
              <PopoverTrigger asChild>
                <Button className={filterButtonClass} variant="outline">
                  Teacher
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
                {renderOptions(
                  [
                    { value: 'all', label: 'All Teachers' },
                    ...sortedTeachers.map((teacher) => ({
                      value: teacher.id,
                      label: teacher.name,
                    })),
                  ],
                  teacherFilter,
                  (value) => handleSelect('teacher', value),
                  isLoadingTeachers,
                  teachersError || undefined,
                  'No teachers found'
                )}
              </PopoverContent>
            </Popover>
          )}

          <Popover
            open={openFilter === 'status'}
            onOpenChange={(open) => setOpenFilter(open ? 'status' : null)}
          >
            <PopoverTrigger asChild>
              <Button className={filterButtonClass} variant="outline">
                Status
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
              {renderOptions(
                [
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ],
                statusFilter,
                (value) => handleSelect('status', value)
              )}
            </PopoverContent>
          </Popover>

          <Popover
            open={openFilter === 'enrollment'}
            onOpenChange={(open) => setOpenFilter(open ? 'enrollment' : null)}
          >
            <PopoverTrigger asChild>
              <Button className={filterButtonClass} variant="outline">
                Enrollment
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
              {renderOptions(
                [
                  { value: 'all', label: 'All' },
                  { value: 'open', label: 'Open slots' },
                ],
                showOnlyWithAvailableSlots ? 'open' : 'all',
                (value) => handleSelect('availableSlots', value === 'open' ? 'available' : 'all')
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 min-h-[44px]">
        {activeChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => clearSingleChip(chip.key)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/15 border border-cyan-300/30 text-sm text-white hover:bg-cyan-400/25 transition-colors"
          >
            <span>{chip.label}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        ))}

        {activeChips.length === 0 && (
          <span className="text-sm text-white/50">No filters applied</span>
        )}

        {hasActiveFilters && clearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3 text-sm text-white/80 hover:text-white hover:bg-white/10 border border-transparent"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClassFilters;
