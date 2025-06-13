
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import GlassCard from '../common/GlassCard';

interface ClassFiltersProps {
  searchTerm: string;
  subjectFilter: string;
  statusFilter: string;
  showOnlyWithAvailableSlots: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (type: string, value: string) => void;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchTerm,
  subjectFilter,
  statusFilter,
  showOnlyWithAvailableSlots,
  onSearchChange,
  onFilterChange,
}) => {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search classes by name or teacher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:w-48">
          <Select value={subjectFilter} onValueChange={(value) => onFilterChange('subject', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </GlassCard>
  );
};

export default ClassFilters;
