import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Amount } from '@/components/ui/amount';
import { formatPeriod, formatRelativeTime } from '@/utils/formatters';
import {
  SalaryCalculationStatus,
  type SalaryCalculation,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';

interface SalaryCalculationsTableProps {
  calculations: SalaryCalculation[];
  employmentType: 'full_time' | 'contract';
  onRowClick: (calculation: SalaryCalculation) => void;
}

function getStatusBadge(status: SalaryCalculationStatus) {
  const styles = {
    pending: {
      variant: 'secondary' as const,
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      label: 'Pending',
    },
    approved: {
      variant: 'default' as const,
      className: 'bg-green-500/20 text-green-300 border-green-500/30',
      label: 'Approved',
    },
    reopened: {
      variant: 'secondary' as const,
      className: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      label: 'Reopened',
    },
  };

  const style = styles[status];
  return (
    <Badge variant={style.variant} className={style.className}>
      {style.label}
    </Badge>
  );
}

export function SalaryCalculationsTable({
  calculations,
  employmentType,
  onRowClick,
}: SalaryCalculationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-white/90 font-semibold">Period</TableHead>
          {employmentType === 'full_time' && (
            <TableHead className="text-white/90 font-semibold text-right">Base Salary</TableHead>
          )}
          <TableHead className="text-white/90 font-semibold text-right">Calculated Amount</TableHead>
          <TableHead className="text-white/90 font-semibold text-right">Approved Amount</TableHead>
          <TableHead className="text-white/90 font-semibold">Status</TableHead>
          <TableHead className="text-white/90 font-semibold">Created</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calculations.map((calc) => (
          <TableRow
            key={calc.id}
            onClick={() => onRowClick(calc)}
            className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
          >
            <TableCell className="text-white font-medium">
              <div className="flex items-center gap-2">
                {formatPeriod(calc.periodStart, calc.periodEnd)}
                <EmploymentTypeBadge
                  calculationEmploymentType={calc.employmentType}
                  currentEmploymentType={employmentType}
                />
              </div>
            </TableCell>
            {employmentType === 'full_time' && (
              <TableCell className="text-right">
                <Amount value={calc.baseSalaryAmount} size="sm" className="text-white/80" />
              </TableCell>
            )}
            <TableCell className="text-right">
              <Amount value={calc.calculatedAmount} size="sm" weight="medium" className="text-white" />
            </TableCell>
            <TableCell className="text-right">
              {calc.approvedAmount !== null ? (
                <Amount value={calc.approvedAmount} size="sm" className="text-white/80" />
              ) : '-'}
            </TableCell>
            <TableCell>{getStatusBadge(calc.status)}</TableCell>
            <TableCell className="text-white/60 text-sm">
              {formatRelativeTime(calc.createdAt)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
