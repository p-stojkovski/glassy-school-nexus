import { AlertCircle, Plus } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { SalaryCalculationStatus } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationsEmptyStateProps {
  statusFilter: SalaryCalculationStatus | 'all';
  yearName: string;
  onGenerate: () => void;
}

export function SalaryCalculationsEmptyState({
  statusFilter,
  yearName,
  onGenerate,
}: SalaryCalculationsEmptyStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No Salary Calculations"
      description={`No salary calculations found for this teacher${statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}${yearName ? ` in ${yearName}` : ''}.`}
      action={{
        label: 'Generate First Calculation',
        onClick: onGenerate,
        icon: <Plus className="w-4 h-4" />,
      }}
    />
  );
}
