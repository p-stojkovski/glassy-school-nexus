import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SalaryCalculationStatus } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationsHeaderProps {
  statusFilter: SalaryCalculationStatus | 'all';
  onStatusFilterChange: (value: SalaryCalculationStatus | 'all') => void;
  onGenerate: () => void;
}

export function SalaryCalculationsHeader({
  statusFilter,
  onStatusFilterChange,
  onGenerate,
}: SalaryCalculationsHeaderProps) {
  return (
    <div className="flex items-end justify-between p-3 border-b border-white/10">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 font-medium">Status:</span>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as SalaryCalculationStatus | 'all')}
        >
          <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20">
            <SelectItem value="all" className="text-white focus:bg-white/10">All</SelectItem>
            <SelectItem value="pending" className="text-white focus:bg-white/10">Pending</SelectItem>
            <SelectItem value="approved" className="text-white focus:bg-white/10">Approved</SelectItem>
            <SelectItem value="reopened" className="text-white focus:bg-white/10">Reopened</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onGenerate}
        size="sm"
        variant="outline"
        className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Generate Salary
      </Button>
    </div>
  );
}
