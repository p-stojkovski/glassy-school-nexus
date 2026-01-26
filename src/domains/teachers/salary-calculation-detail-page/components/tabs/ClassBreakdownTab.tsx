/**
 * ClassBreakdownTab
 * Displays salary calculation items grouped by class with multi-tier support
 */
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SalaryCalculationItem } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface ClassBreakdownTabProps {
  items: SalaryCalculationItem[];
  baseSalaryAmount: number;
}

export function ClassBreakdownTab({ items, baseSalaryAmount }: ClassBreakdownTabProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-white/50 text-sm">
        No class items for this period
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalLessons = items.reduce((sum, item) => sum + item.lessonsCount, 0);
  const hasBaseSalary = baseSalaryAmount > 0;

  // Group by class for multi-tier display
  const byClass = items.reduce((acc, item) => {
    if (!acc[item.classId]) {
      acc[item.classId] = { className: item.className, tiers: [] };
    }
    acc[item.classId].tiers.push(item);
    return acc;
  }, {} as Record<string, { className: string; tiers: SalaryCalculationItem[] }>);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-white/50 text-xs font-medium h-8">CLASS</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-center h-8">STUDENTS</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-center h-8">LESSONS</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-right h-8">RATE</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-right h-8">AMOUNT</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(byClass).map(([classId, classData]) => (
          <React.Fragment key={classId}>
            {classData.tiers.map((tier, idx) => (
              <TableRow key={`${classId}-${idx}`} className="border-white/5 hover:bg-white/[0.02]">
                {idx === 0 ? (
                  <TableCell
                    className="text-white font-medium py-2 text-sm"
                    rowSpan={classData.tiers.length}
                  >
                    {classData.className}
                  </TableCell>
                ) : null}
                <TableCell className="text-white/70 text-center py-2 text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        {tier.studentCountAtLesson ?? '—'}
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1f2e] border-white/20 text-xs">
                        {tier.studentCountAtLesson !== null ? (
                          <p>Student count at lesson time</p>
                        ) : (
                          <p>Legacy: count not captured</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-white/70 text-center py-2 text-sm">
                  {tier.lessonsCount}
                </TableCell>
                <TableCell className="text-white/70 text-right py-2 text-sm tabular-nums">
                  {tier.rateApplied.toLocaleString()}
                </TableCell>
                <TableCell className="text-white text-right py-2 text-sm font-medium tabular-nums">
                  {tier.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
      <TableFooter className="bg-white/[0.03]">
        {hasBaseSalary && (
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableCell className="text-white/50 font-medium py-1.5 text-xs">Base Salary (Full Time)</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell className="text-white/70 text-right py-1.5 text-sm tabular-nums">
              {baseSalaryAmount.toLocaleString()} MKD
            </TableCell>
          </TableRow>
        )}
        <TableRow className="border-white/5 hover:bg-transparent">
          <TableCell className="text-white/70 font-medium py-1.5 text-sm">
            {hasBaseSalary ? 'Variable Pay (from classes)' : 'Total'}
          </TableCell>
          <TableCell />
          <TableCell className="text-white/70 text-center py-1.5 text-sm font-medium">
            {totalLessons}
          </TableCell>
          <TableCell />
          <TableCell className="text-white text-right py-1.5 text-sm tabular-nums">
            {totalAmount.toLocaleString()} MKD
          </TableCell>
        </TableRow>
        {hasBaseSalary && (
          <>
            <TableRow className="border-t border-white/20 hover:bg-transparent">
              <TableCell colSpan={5} className="py-1" />
            </TableRow>
            <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.05]">
              <TableCell className="text-white font-semibold py-2 text-sm">Total</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell className="text-white text-right py-2 text-sm font-bold tabular-nums">
                {(baseSalaryAmount + totalAmount).toLocaleString()} MKD
              </TableCell>
            </TableRow>
          </>
        )}
      </TableFooter>
    </Table>
  );
}
