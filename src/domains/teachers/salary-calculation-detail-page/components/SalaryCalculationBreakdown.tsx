/**
 * Salary Calculation Class Breakdown
 * Shows per-class/tier breakdown with lesson counts and amounts
 */
import React from 'react';
import { Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/utils/formatters';
import type { SalaryCalculationItem } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationBreakdownProps {
  items: SalaryCalculationItem[];
}

export const SalaryCalculationBreakdown: React.FC<SalaryCalculationBreakdownProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <Alert className="bg-white/5 border-white/10">
        <Info className="h-4 w-4 text-white/60" />
        <AlertDescription className="text-white/70">
          No class items found for this calculation period.
        </AlertDescription>
      </Alert>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalLessons = items.reduce((sum, item) => sum + item.lessonsCount, 0);

  const byClass = items.reduce((acc, item) => {
    const key = item.classId;
    if (!acc[key]) {
      acc[key] = { className: item.className, tiers: [] };
    }
    acc[key].tiers.push(item);
    return acc;
  }, {} as Record<string, { className: string; tiers: SalaryCalculationItem[] }>);

  const hasPerLessonTracking = items.some(item => item.studentCountAtLesson !== null);

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Class Breakdown</CardTitle>
        <CardDescription className="text-white/60">
          {hasPerLessonTracking
            ? 'Per-tier breakdown based on student count at lesson time'
            : 'Breakdown by class with applied rate tiers'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/70 h-10">Class</TableHead>
              <TableHead className="text-white/70 text-center h-10">Students</TableHead>
              <TableHead className="text-white/70 text-center h-10">Lessons</TableHead>
              <TableHead className="text-white/70 text-right h-10">Rate</TableHead>
              <TableHead className="text-white/70 text-right h-10">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(byClass).map(([classId, classData]) => (
              <React.Fragment key={classId}>
                {classData.tiers.map((tier, idx) => (
                  <TableRow key={`${classId}-${idx}`} className="border-white/10">
                    {idx === 0 ? (
                      <TableCell className="text-white font-medium align-top py-2" rowSpan={classData.tiers.length}>
                        {classData.className}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-white/80 text-center py-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help inline-flex items-center gap-1">
                              {tier.studentCountAtLesson !== null ? (
                                <Badge variant="outline" className="border-white/20 text-white/80 text-xs">
                                  {tier.studentCountAtLesson}
                                </Badge>
                              ) : (
                                <span className="text-white/40 text-sm flex items-center gap-1">
                                  N/A
                                  <Info className="w-3 h-3" />
                                </span>
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a1f2e] border-white/20">
                            <div className="text-xs space-y-1">
                              {tier.studentCountAtLesson !== null ? (
                                <>
                                  <p className="text-white font-medium">Student count at lesson time</p>
                                  <p className="text-white/70">Rate Tier: {tier.ruleSnapshot.minStudents}+ students</p>
                                  <p className="text-white/70">
                                    Effective: {new Date(tier.ruleSnapshot.effectiveFrom).toLocaleDateString()}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-white font-medium">Legacy lesson</p>
                                  <p className="text-white/70">Student count not captured</p>
                                  <p className="text-white/70">Using current count: {tier.activeStudents}</p>
                                </>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-white/80 text-center py-2">{tier.lessonsCount}</TableCell>
                    <TableCell className="text-white/80 text-right py-2">{formatCurrency(tier.rateApplied)}</TableCell>
                    <TableCell className="text-white font-medium text-right py-2">{formatCurrency(tier.amount)}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter className="bg-white/5">
            <TableRow className="border-white/10">
              <TableCell className="text-white font-semibold py-2">Total</TableCell>
              <TableCell className="py-2" />
              <TableCell className="text-white/80 text-center font-medium py-2">{totalLessons}</TableCell>
              <TableCell className="py-2" />
              <TableCell className="text-white font-semibold text-right py-2">{formatCurrency(totalAmount)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};
