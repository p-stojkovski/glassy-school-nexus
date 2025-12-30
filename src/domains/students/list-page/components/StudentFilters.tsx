import React, { useState } from 'react';
import { Check, ChevronDown, FilterX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SearchInput from '@/components/common/SearchInput';
import { cn } from '@/lib/utils';
import { useCanViewFinance } from '@/hooks/usePermissions';

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
  teacherFilter: string;
  setTeacherFilter: (filter: string) => void;
  discountFilter: 'all' | 'with-discount' | 'no-discount';
  setDiscountFilter: (filter: 'all' | 'with-discount' | 'no-discount') => void;
  paymentFilter: 'all' | 'has-obligations' | 'no-obligations';
  setPaymentFilter: (filter: 'all' | 'has-obligations' | 'no-obligations') => void;
  teachers: { id: string; name: string }[];
  clearFilters: () => void;
  hasActiveFilters?: boolean;
  isSearching?: boolean;
  /** Override for canViewFinance permission (optional - uses hook if not provided) */
  canViewFinance?: boolean;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  teacherFilter,
  setTeacherFilter,
  discountFilter,
  setDiscountFilter,
  paymentFilter,
  setPaymentFilter,
  teachers,
  clearFilters,
  hasActiveFilters = false,
  isSearching = false,
  canViewFinance: canViewFinanceProp,
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // Use prop if provided, otherwise use hook
  const canViewFinanceFromHook = useCanViewFinance();
  const canViewFinance = canViewFinanceProp ?? canViewFinanceFromHook;

  const closePopover = () => setOpenFilter(null);

  const handleStatusSelect = (value: string) => {
    setStatusFilter(value as 'all' | 'active' | 'inactive');
    closePopover();
  };

  const handleTeacherSelect = (value: string) => {
    setTeacherFilter(value);
    closePopover();
  };

  const handleDiscountSelect = (value: string) => {
    setDiscountFilter(value as 'all' | 'with-discount' | 'no-discount');
    closePopover();
  };

  const handlePaymentSelect = (value: string) => {
    setPaymentFilter(value as 'all' | 'has-obligations' | 'no-obligations');
    closePopover();
  };

  // Labels for display
  const statusLabel = statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive';
  const teacherLabel = teacherFilter === 'all' ? 'All' : teachers.find(t => t.id === teacherFilter)?.name || 'Unknown';
  const discountLabel = discountFilter === 'all' ? 'All' : discountFilter === 'with-discount' ? 'With Discount' : 'No Discount';
  const paymentLabel = paymentFilter === 'all' ? 'All' : paymentFilter === 'has-obligations' ? 'Has Obligations' : 'No Obligations';

  // Build active filter chips (exclude search term from chips)
  const activeChips: { key: string; label: string }[] = [];
  if (statusFilter !== 'all') activeChips.push({ key: 'status', label: `Status: ${statusLabel}` });
  if (teacherFilter !== 'all') activeChips.push({ key: 'teacher', label: `Teacher: ${teacherLabel}` });
  if (discountFilter !== 'all') activeChips.push({ key: 'discount', label: `Discount: ${discountLabel}` });
  // Only show payment filter chip if user can view finance
  if (canViewFinance && paymentFilter !== 'all') activeChips.push({ key: 'payment', label: `Payment: ${paymentLabel}` });

  const clearSingleChip = (key: string) => {
    switch (key) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'teacher':
        setTeacherFilter('all');
        break;
      case 'discount':
        setDiscountFilter('all');
        break;
      case 'payment':
        setPaymentFilter('all');
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

          {/* Teacher Filter */}
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
            <PopoverContent className="w-52 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl max-h-80 overflow-y-auto">
              {renderOptions(
                [
                  { value: 'all', label: 'All Teachers' },
                  ...teachers.map(t => ({ value: t.id, label: t.name }))
                ],
                teacherFilter,
                handleTeacherSelect
              )}
            </PopoverContent>
          </Popover>

          {/* Discount Filter */}
          <Popover
            open={openFilter === 'discount'}
            onOpenChange={(open) => setOpenFilter(open ? 'discount' : null)}
          >
            <PopoverTrigger asChild>
              <Button className={filterButtonClass} variant="outline">
                Discount
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
              {renderOptions(
                [
                  { value: 'all', label: 'All' },
                  { value: 'with-discount', label: 'With Discount' },
                  { value: 'no-discount', label: 'No Discount' },
                ],
                discountFilter,
                handleDiscountSelect
              )}
            </PopoverContent>
          </Popover>

          {/* Payment Filter - Only visible if user can view finance */}
          {canViewFinance && (
            <Popover
              open={openFilter === 'payment'}
              onOpenChange={(open) => setOpenFilter(open ? 'payment' : null)}
            >
              <PopoverTrigger asChild>
                <Button className={filterButtonClass} variant="outline">
                  Payment
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 bg-[#0d1026]/95 border-white/10 text-white p-2 shadow-xl">
                {renderOptions(
                  [
                    { value: 'all', label: 'All' },
                    { value: 'has-obligations', label: 'Has Obligations' },
                    { value: 'no-obligations', label: 'No Obligations' },
                  ],
                  paymentFilter,
                  handlePaymentSelect
                )}
              </PopoverContent>
            </Popover>
          )}
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

export default StudentFilters;
