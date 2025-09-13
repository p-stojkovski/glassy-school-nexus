import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PrivateLessonStatus } from '@/types/enums';

interface PrivateLessonFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: PrivateLessonStatus | 'all';
  setStatusFilter: (status: PrivateLessonStatus | 'all') => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  totalLessons: number;
  filteredCount: number;
}

const PrivateLessonFilters: React.FC<PrivateLessonFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  hasFilters,
  clearFilters,
  totalLessons,
  filteredCount,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <Input
              placeholder="Search by student, teacher, subject, or classroom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[200px]">
          <Select
            value={statusFilter}
            onValueChange={(value: PrivateLessonStatus | 'all') =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={PrivateLessonStatus.Scheduled}>
                Scheduled
              </SelectItem>
              <SelectItem value={PrivateLessonStatus.Completed}>
                Completed
              </SelectItem>
              <SelectItem value={PrivateLessonStatus.Cancelled}>
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="min-w-[180px]">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white/10 border-white/20 text-white focus:border-yellow-400"
            placeholder="Filter by date"
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count and Active Filters */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="text-sm text-white/70">
          Showing{' '}
          <span className="text-white font-medium">{filteredCount}</span> of{' '}
          <span className="text-white font-medium">{totalLessons}</span> lessons
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20"
            >
              Search: {searchTerm}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-white/60 hover:text-white"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {statusFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20"
            >
              Status: {statusFilter}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-white/60 hover:text-white"
                onClick={() => setStatusFilter('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {dateFilter && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20"
            >
              Date: {new Date(dateFilter).toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-white/60 hover:text-white"
                onClick={() => setDateFilter('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateLessonFilters;

