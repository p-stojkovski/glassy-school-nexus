import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedPeriod: string | null;
  onPeriodChange: (period: string) => void;
  periods: string[];
  selectedStudentId: string | null;
  onStudentChange: (studentId: string) => void;
  students: { id: string; name: string }[];
  onClear: () => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  search,
  onSearchChange,
  selectedPeriod,
  onPeriodChange,
  periods,
  selectedStudentId,
  onStudentChange,
  students,
  onClear,
}) => (
  <div className="flex flex-col md:flex-row gap-4 justify-between">
    <div className="flex-1">
      <Input
        placeholder="Search by student or reference..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60"
      />
    </div>

    <div className="flex flex-col md:flex-row gap-4">
      <Select
        value={selectedPeriod || 'all_periods'}
        onValueChange={onPeriodChange}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="All Periods" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 text-white border border-white/20 backdrop-blur-sm">
          <SelectItem
            value="all_periods"
            className="text-white hover:bg-gray-700 focus:bg-gray-700"
          >
            All Periods
          </SelectItem>
          {periods.map((period) => (
            <SelectItem
              key={period}
              value={period}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              {period}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedStudentId || 'all_students'}
        onValueChange={onStudentChange}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="All Students" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 text-white border border-white/20 backdrop-blur-sm">
          <SelectItem
            value="all_students"
            className="text-white hover:bg-gray-700 focus:bg-gray-700"
          >
            All Students
          </SelectItem>
          {students.map((student) => (
            <SelectItem
              key={student.id}
              value={student.id}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              {student.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onClear}
        className="bg-blue-500/30 backdrop-blur-sm border-blue-400 text-white font-medium hover:bg-blue-500/50 shadow-sm"
      >
        <svg
          className="mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l18 18"></path>
          <path d="M10.9 4a7.03 7.03 0 0 1 2.2 2.2"></path>
          <path d="M17.7 7.7a7.03 7.03 0 0 1 .8 3.3c0 1-.2 1.9-.6 2.8"></path>
          <path d="M4.6 11a7 7 0 0 1 7.1-7"></path>
          <path d="M4 17a7 7 0 0 0 11 0"></path>
        </svg>
        Clear Filters
      </Button>
    </div>
  </div>
);

export default PaymentFilters;

