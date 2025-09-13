import React from 'react';
import { Filter, Percent, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GlassCard from '@/components/common/GlassCard';
import { DiscountTypeDto } from '@/types/api/student';
import { StudentViewMode } from '@/domains/students/hooks/useStudentManagement';
import ClearFiltersButton from '@/components/common/ClearFiltersButton';
import SearchInput from '@/components/common/SearchInput';

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
  discountStatusFilter: 'all' | 'with-discount' | 'no-discount';
  setDiscountStatusFilter: (filter: 'all' | 'with-discount' | 'no-discount') => void;
  discountTypeFilter: 'all' | string;
  setDiscountTypeFilter: (filter: 'all' | string) => void;
  clearFilters: () => void;
  discountTypes: DiscountTypeDto[];
  hasActiveFilters?: boolean;
  viewMode?: StudentViewMode;
  setViewMode?: (mode: StudentViewMode) => void;
  isSearchMode?: boolean;
  loading?: boolean;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  discountStatusFilter,
  setDiscountStatusFilter,
  discountTypeFilter,
  setDiscountTypeFilter,
  clearFilters,
  discountTypes,
  hasActiveFilters = false,
  viewMode = 'grid',
  setViewMode,
  isSearchMode = false,
  loading = false,
}) => {
  return (
    <GlassCard className="p-6">     
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search students by name or email..."
              isSearching={loading}
              disabled={loading}
            />
          </div>
          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'active' | 'inactive') =>
                setStatusFilter(value)
              }
              disabled={loading}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Discount Status Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={discountStatusFilter}
              onValueChange={(value: 'all' | 'with-discount' | 'no-discount') =>
                setDiscountStatusFilter(value)
              }
              disabled={loading}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Percent className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Discounts</SelectItem>
                <SelectItem value="with-discount">With Discount</SelectItem>
                <SelectItem value="no-discount">No Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Discount Type Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={discountTypeFilter}
              onValueChange={(value: string) => setDiscountTypeFilter(value)}
              disabled={loading || discountTypes.length === 0}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Percent className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {discountTypes.length > 0 ? (
                  discountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading discount types...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* View Mode Toggle and Actions */}
        <div className="flex gap-2 lg:flex-shrink-0">
          {/* View Mode Toggle */}
          {setViewMode && (
            <div className="flex border border-white/20 rounded-lg overflow-hidden">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-2 border-0 rounded-none ${
                  viewMode === 'grid'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-2 border-0 rounded-none ${
                  viewMode === 'table'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        <ClearFiltersButton onClick={clearFilters} />
        </div>
      </div>
    </GlassCard>
  );
};

export default StudentFilters;

