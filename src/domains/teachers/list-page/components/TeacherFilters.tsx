import React, { useState } from 'react';
import { Check, ChevronDown, FilterX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SearchInput from '@/components/common/SearchInput';
import { cn } from '@/lib/utils';
import { SubjectDto } from '@/types/api/teacher';

interface TeacherFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
  subjectFilter: string;
  setSubjectFilter: (filter: string) => void;
  experienceFilter: 'all' | '0-2' | '3-5' | '5+';
  setExperienceFilter: (filter: 'all' | '0-2' | '3-5' | '5+') => void;
  subjects: SubjectDto[];
  clearFilters: () => void;
  hasActiveFilters?: boolean;
  isSearching?: boolean;
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  subjectFilter,
  setSubjectFilter,
  experienceFilter,
  setExperienceFilter,
  subjects,
  clearFilters,
  hasActiveFilters = false,
  isSearching = false,
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const closePopover = () => setOpenFilter(null);

  const handleStatusSelect = (value: string) => {
    setStatusFilter(value as 'all' | 'active' | 'inactive');
    closePopover();
  };

  const handleSubjectSelect = (value: string) => {
    setSubjectFilter(value);
    closePopover();
  };

  const handleExperienceSelect = (value: string) => {
    setExperienceFilter(value as 'all' | '0-2' | '3-5' | '5+');
    closePopover();
  };

  // Labels for display
  const statusLabel = statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive';
  const subjectLabel = subjectFilter === 'all' ? 'All' : subjects.find(s => s.id === subjectFilter)?.name || 'Unknown';
  const experienceLabel =
    experienceFilter === 'all' ? 'All' :
    experienceFilter === '0-2' ? '0-2 years' :
    experienceFilter === '3-5' ? '3-5 years' :
    '5+ years';

  // Build active filter chips (exclude search term from chips)
  const activeChips: { key: string; label: string }[] = [];
  if (statusFilter !== 'all') activeChips.push({ key: 'status', label: `Status: ${statusLabel}` });
  if (subjectFilter !== 'all') activeChips.push({ key: 'subject', label: `Subject: ${subjectLabel}` });
  if (experienceFilter !== 'all') activeChips.push({ key: 'experience', label: `Experience: ${experienceLabel}` });

  const clearSingleChip = (key: string) => {
    switch (key) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'subject':
        setSubjectFilter('all');
        break;
      case 'experience':
        setExperienceFilter('all');
        break;
      default:
        break;
    }
  };

  const renderOptions = (
    options: { value: string; label: string }[],
    selected: string,
    onSelect: (value: string) => void
  ) => {
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
        <span>{option.label}</span>
        {selected === option.value && <Check className="w-4 h-4 text-cyan-300" />}
      </button>
    ));
  };

  const filterButtonClass =
    'h-9 px-3 border border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-colors flex items-center gap-2';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        {/* Search Input */}
        <div className="w-full lg:flex-1 lg:min-w-0">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or email"
            isSearching={isSearching}
            showStatusText={false}
            clearable
            className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/70"
          />
        </div>

        {/* Filters */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
          {/* Status Filter */}
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
                handleStatusSelect
              )}
            </PopoverContent>
          </Popover>

          {/* Subject Filter */}
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
            <PopoverContent className="w-52 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl max-h-80 overflow-y-auto">
              {renderOptions(
                [
                  { value: 'all', label: 'All Subjects' },
                  ...subjects.map(s => ({ value: s.id, label: s.name }))
                ],
                subjectFilter,
                handleSubjectSelect
              )}
            </PopoverContent>
          </Popover>

          {/* Experience Filter */}
          <Popover
            open={openFilter === 'experience'}
            onOpenChange={(open) => setOpenFilter(open ? 'experience' : null)}
          >
            <PopoverTrigger asChild>
              <Button className={filterButtonClass} variant="outline">
                Experience
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
              {renderOptions(
                [
                  { value: 'all', label: 'All' },
                  { value: '0-2', label: '0-2 years' },
                  { value: '3-5', label: '3-5 years' },
                  { value: '5+', label: '5+ years' },
                ],
                experienceFilter,
                handleExperienceSelect
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filter Chips - always visible */}
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
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3 gap-1.5 border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
          >
            <FilterX className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeacherFilters;
