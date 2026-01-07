import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ContributionBreakdown, TaxBreakdown, GrossSalaryInfo, SalarySummaryResponse } from '@/types/api/teacherSalary';

interface SalaryBreakdownTableProps {
  grossSalary: GrossSalaryInfo;
  contributions: ContributionBreakdown[];
  incomeTax: TaxBreakdown;
  summary: SalarySummaryResponse;
}

export default function SalaryBreakdownTable({
  grossSalary,
  contributions,
  incomeTax,
  summary,
}: SalaryBreakdownTableProps) {
  const formatMKD = (amount: number) => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalDeductions = totalContributions + incomeTax.amount;
  const netSalary = grossSalary.amount - totalDeductions;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/90">Description</TableHead>
              <TableHead className="text-white/90 text-right">Rate</TableHead>
              <TableHead className="text-white/90 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Gross Salary Row */}
            <TableRow className="border-white/10 bg-blue-500/10">
              <TableCell className="font-semibold text-white">
                <div>Gross Salary</div>
                <div className="text-xs text-white/50">Бруто плата</div>
              </TableCell>
              <TableCell className="text-right text-white/60">-</TableCell>
              <TableCell className="text-right font-bold text-white">
                {formatMKD(grossSalary.amount)}
              </TableCell>
            </TableRow>

            {/* Contributions Section Header */}
            <TableRow className="border-white/10 bg-white/5">
              <TableCell colSpan={3} className="font-semibold text-white/80 text-sm">
                Mandatory Contributions (Придонеси)
              </TableCell>
            </TableRow>

            {/* Contribution Rows */}
            {contributions.map((contribution) => (
              <TableRow key={contribution.code} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white/90 pl-6">
                  <div>{contribution.name}</div>
                  <div className="text-xs text-white/50">{contribution.nameMk}</div>
                </TableCell>
                <TableCell className="text-right text-orange-400">
                  {formatPercent(contribution.rate)}
                </TableCell>
                <TableCell className="text-right text-orange-400">
                  -{formatMKD(contribution.amount)}
                </TableCell>
              </TableRow>
            ))}

            {/* Contributions Subtotal */}
            <TableRow className="border-white/10 bg-orange-500/10">
              <TableCell className="font-semibold text-white">
                <div>Total Contributions</div>
                <div className="text-xs text-white/50">Вкупно придонеси</div>
              </TableCell>
              <TableCell className="text-right text-white/60">
                {formatPercent(contributions.reduce((sum, c) => sum + c.rate, 0))}
              </TableCell>
              <TableCell className="text-right font-bold text-orange-400">
                -{formatMKD(totalContributions)}
              </TableCell>
            </TableRow>

            {/* Taxable Income Row */}
            <TableRow className="border-white/10 bg-white/5">
              <TableCell className="font-semibold text-white">
                <div>Taxable Income</div>
                <div className="text-xs text-white/50">Даночна основа</div>
              </TableCell>
              <TableCell className="text-right text-white/60">-</TableCell>
              <TableCell className="text-right font-semibold text-white">
                {formatMKD(summary.taxableIncome)}
              </TableCell>
            </TableRow>

            {/* Income Tax Row */}
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableCell className="text-white/90">
                <div>{incomeTax.name}</div>
                <div className="text-xs text-white/50">Данок на личен доход</div>
              </TableCell>
              <TableCell className="text-right text-red-400">
                {formatPercent(incomeTax.rate)}
              </TableCell>
              <TableCell className="text-right text-red-400">
                -{formatMKD(incomeTax.amount)}
              </TableCell>
            </TableRow>

            {/* Total Deductions */}
            <TableRow className="border-white/10 bg-red-500/10">
              <TableCell className="font-semibold text-white">
                <div>Total Deductions</div>
                <div className="text-xs text-white/50">Вкупно придонеси и данок</div>
              </TableCell>
              <TableCell className="text-right text-white/60">-</TableCell>
              <TableCell className="text-right font-bold text-red-400">
                -{formatMKD(totalDeductions)}
              </TableCell>
            </TableRow>

            {/* Net Salary */}
            <TableRow className="border-t-2 border-white/20 bg-green-500/10">
              <TableCell className="font-bold text-white text-lg">
                <div>Net Salary</div>
                <div className="text-xs text-white/50 font-normal">Нето плата</div>
              </TableCell>
              <TableCell className="text-right text-white/60">-</TableCell>
              <TableCell className="text-right font-bold text-green-400 text-lg">
                {formatMKD(netSalary)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
