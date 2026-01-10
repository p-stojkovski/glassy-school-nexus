import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ClassSalaryPreview } from '@/domains/classes/_shared/types/salaryRule.types';

interface ClassSalaryPreviewCardProps {
  preview: ClassSalaryPreview | null;
  loading: boolean;
  error: string | null;
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRetry: () => void;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const ClassSalaryPreviewCard: React.FC<ClassSalaryPreviewCardProps> = ({
  preview,
  loading,
  error,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onRetry,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  const getMonthName = (month: number): string => {
    return MONTHS.find((m) => m.value === month)?.label || '';
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (error) {
    return (
      <Card className="border-white/10 bg-white/[0.02] mb-4">
        <CardContent className="p-6">
          <ErrorMessage
            title="Error Loading Salary Preview"
            message={error}
            onRetry={onRetry}
            showRetry
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.02] mb-4">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-medium text-white">
            Salary Preview - {getMonthName(selectedMonth)} {selectedYear}
          </span>
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
            {preview.hasPendingEnrollmentChanges && (
              <Alert className="border-amber-500/30 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300 text-sm">
                  {preview.pendingEnrollments > 0 && preview.pendingWithdrawals > 0
                    ? `${preview.pendingEnrollments} pending enrollment(s) and ${preview.pendingWithdrawals} pending withdrawal(s) may affect this calculation`
                    : preview.pendingEnrollments > 0
                    ? `${preview.pendingEnrollments} pending enrollment(s) may affect this calculation`
                    : `${preview.pendingWithdrawals} pending withdrawal(s) may affect this calculation`}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Scheduled Lessons:</span>
                <span className="font-semibold text-white">{preview.scheduledLessons}</span>
              </div>

              <div className="h-4 w-px bg-white/20" />

              <div className="flex items-center gap-2">
                <span className="text-white/60">Active Students:</span>
                <span className="font-semibold text-white">{preview.activeStudents}</span>
              </div>

              <div className="h-4 w-px bg-white/20" />

              <div className="flex items-center gap-2">
                <span className="text-white/60">Rate:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(preview.rateApplied)}
                </span>
                <span className="text-white/50">({preview.rateTierDescription})</span>
              </div>

              <div className="h-4 w-px bg-white/20" />

              <div className="flex items-center gap-2">
                <span className="text-blue-300 font-medium">Estimated:</span>
                <span className="font-bold text-blue-200">
                  {formatCurrency(preview.estimatedAmount)}
                </span>
              </div>
            </div>
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

export default ClassSalaryPreviewCard;
