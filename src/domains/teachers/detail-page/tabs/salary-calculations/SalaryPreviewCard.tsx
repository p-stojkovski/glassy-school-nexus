/**
 * Salary Preview Card - Teacher Profile
 * Displays monthly salary projections with class breakdown
 * Phase 7.3 implementation
 */
import React from 'react';
import { AlertTriangle, Users, GraduationCap, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Amount } from '@/components/ui/amount';
import { TeacherSalaryPreview } from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { MONTHS } from '@/domains/teachers/_shared/constants';

interface SalaryPreviewCardProps {
  preview: TeacherSalaryPreview | null;
  loading: boolean;
  error: string | null;
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRetry: () => void;
}

const SalaryPreviewCard: React.FC<SalaryPreviewCardProps> = ({
  preview,
  loading,
  error,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onRetry,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (error) {
    return (
      <Card className="border-white/10 bg-white/[0.02]">
        <div className="px-4 py-3">
          <ErrorMessage
            title="Error Loading Salary Preview"
            message={error}
            onRetry={onRetry}
            showRetry
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/70">Salary Preview</span>
          <div className="flex gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => onMonthChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-[120px] bg-white/5 border-white/20 text-white text-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => onYearChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-[80px] bg-white/5 border-white/20 text-white text-sm">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : preview ? (
          <div className="space-y-3">
            {(preview.warnings.length > 0 || preview.pendingChangeWarnings.length > 0) && (
              <div className="space-y-2">
                {preview.warnings.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-300 text-sm">{preview.warnings.join(' • ')}</span>
                  </div>
                )}
                {preview.pendingChangeWarnings.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-500/30 bg-orange-500/10">
                    <Info className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span className="text-orange-300 text-sm">{preview.pendingChangeWarnings.join(' • ')}</span>
                  </div>
                )}
              </div>
            )}

            {preview.classBreakdown.length > 0 ? (
              <div className="border border-white/10 rounded-lg bg-white/[0.02]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white/70">Class</TableHead>
                      <TableHead className="text-white/70 text-center">Lessons</TableHead>
                      <TableHead className="text-white/70 text-center">Students</TableHead>
                      <TableHead className="text-white/70 text-right">Rate</TableHead>
                      <TableHead className="text-white/70 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.classBreakdown.map((classItem) => (
                      <TableRow key={classItem.classId}>
                        <TableCell className="text-white font-medium">
                          <div className="flex items-center gap-2">
                            {classItem.className}
                            {classItem.hasPendingEnrollmentChanges && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs"
                                    >
                                      <Info className="w-3 h-3 mr-1" />
                                      Pending
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {classItem.pendingEnrollments > 0 && `+${classItem.pendingEnrollments} enrollments`}
                                      {classItem.pendingEnrollments > 0 && classItem.pendingWithdrawals > 0 && ', '}
                                      {classItem.pendingWithdrawals > 0 && `-${classItem.pendingWithdrawals} withdrawals`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <GraduationCap className="w-4 h-4 text-white/40" />
                            {classItem.scheduledLessons}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-white/40" />
                            {classItem.activeStudents}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <Amount value={classItem.rateApplied} weight="medium" className="text-white/80" />
                            <div className="text-xs text-white/50">{classItem.rateTierDescription}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Amount value={classItem.estimatedAmount} weight="semibold" className="text-white" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    {preview.baseSalaryAmount !== undefined && preview.baseSalaryAmount > 0 && (
                      <TableRow className="bg-white/[0.03] border-t border-white/10">
                        <TableCell colSpan={4} className="text-white/70 font-medium text-right py-1.5 text-sm">
                          Base Salary (Full Time)
                        </TableCell>
                        <TableCell className="text-right py-1.5">
                          <Amount value={preview.baseSalaryAmount} weight="medium" className="text-white/70" />
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-white/[0.03] border-t border-white/10">
                      <TableCell colSpan={4} className="text-white/70 font-medium text-right py-1.5 text-sm">
                        {preview.baseSalaryAmount !== undefined && preview.baseSalaryAmount > 0
                          ? 'Variable Pay (from classes)'
                          : 'Total Estimated'}
                      </TableCell>
                      <TableCell className="text-right py-1.5">
                        <Amount value={preview.totalEstimated} weight="medium" className="text-white/70" />
                      </TableCell>
                    </TableRow>
                    {preview.baseSalaryAmount !== undefined && preview.baseSalaryAmount > 0 && (
                      <>
                        <TableRow className="border-t-2 border-blue-500/30">
                          <TableCell colSpan={5} className="py-0.5" />
                        </TableRow>
                        <TableRow className="bg-blue-500/10">
                          <TableCell colSpan={4} className="text-white font-semibold text-right py-2">
                            Grand Total
                          </TableCell>
                          <TableCell className="text-right py-2">
                            <Amount
                              value={preview.baseSalaryAmount + preview.totalEstimated}
                              weight="semibold"
                              className="text-blue-200"
                            />
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                    {!(preview.baseSalaryAmount !== undefined && preview.baseSalaryAmount > 0) && (
                      <TableRow className="bg-blue-500/10 border-t-2 border-blue-500/30">
                        <TableCell colSpan={4} className="text-white font-semibold text-right py-2">
                          Total Estimated
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Amount value={preview.totalEstimated} weight="semibold" className="text-blue-200" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableFooter>
                </Table>
              </div>
            ) : (
              <div className="py-4 text-center text-white/60">
                No classes scheduled for this period.
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-white/60">
            No preview data available for the selected period.
          </div>
        )}
        </div>
      </div>
    </Card>
  );
};

export default SalaryPreviewCard;
