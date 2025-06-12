
import React from 'react';
import { Search, Filter, CreditCard, GraduationCap, X } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import GlassCard from '../../common/GlassCard';
import { Class } from '../../../store/slices/classesSlice';

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
  paymentStatusFilter: 'all' | 'pending' | 'partial' | 'paid' | 'overdue';
  setPaymentStatusFilter: (filter: 'all' | 'pending' | 'partial' | 'paid' | 'overdue') => void;
  classFilter: 'all' | 'unassigned' | string;
  setClassFilter: (filter: 'all' | 'unassigned' | string) => void;
  clearFilters: () => void;
  classes: Class[];
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  classFilter,
  setClassFilter,
  clearFilters,
  classes,
}) => {return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        
        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
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
        
        {/* Payment Status Filter */}
        <div className="w-full lg:w-48">
          <Select value={paymentStatusFilter} onValueChange={(value: 'all' | 'pending' | 'partial' | 'paid' | 'overdue') => setPaymentStatusFilter(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>        {/* Class Filter */}
        <div className="w-full lg:w-48">
          <Select value={classFilter} onValueChange={(value: string) => setClassFilter(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <GraduationCap className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>        {/* Clear Filters Button */}
        <div className="w-full lg:w-auto">
          <Button
            onClick={clearFilters}
            variant="outline"
            className="w-full lg:w-auto bg-yellow-500/10 border-yellow-400/30 text-white hover:bg-yellow-500/20 hover:border-yellow-400/50 transition-all duration-200 font-medium backdrop-blur-sm hover:text-yellow-100"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default StudentFilters;
