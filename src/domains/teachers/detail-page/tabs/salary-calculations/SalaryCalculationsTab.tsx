/**
 * Salary Calculations Tab - Teacher Profile
 * Displays salary preview card and list of salary calculations with status filtering
 * Phase 7.2 & 7.3 & 7.4 implementation
 * Updated: Salary preview moved to bottom, collapsible, and lazy-loaded
 * Updated: Clickable table rows for navigation to salary detail page (matches Students list pattern)
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  SalaryCalculationStatus,
  type SalaryCalculation,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { useTeacherSalaryCalculations } from '../../hooks/useTeacherSalaryCalculations';
import { useTeacherSalaryPreview } from '../../hooks/useTeacherSalaryPreview';
import SalaryPreviewCard from './SalaryPreviewCard';
import { GenerateSalaryDialog } from './dialogs';

interface SalaryCalculationsTabProps {
  academicYearId: string | null;
  yearName: string;
  isActive: boolean;
}

const SalaryCalculationsTab: React.FC<SalaryCalculationsTabProps> = ({ academicYearId, yearName, isActive }) => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  // Dialog state management
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // Collapsible state for salary preview
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // Salary calculations list
  const {
    calculations,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  } = useTeacherSalaryCalculations({ academicYearId });

  // Salary preview (lazy loaded when expanded)
  const {
    preview,
    loading: previewLoading,
    error: previewError,
    selectedYear,
    selectedMonth,
    onYearChange,
    onMonthChange,
    refetch: refetchPreview,
  } = useTeacherSalaryPreview({ isExpanded: isPreviewExpanded });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  const formatPeriod = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startFormatted = startDate.toLocaleDateString('en-US', options);
    const endFormatted = endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' });

    return `${startFormatted} - ${endFormatted}`;
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} weeks ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} months ago`;
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: SalaryCalculationStatus) => {
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
  };

  const handleViewDetails = (calculation: SalaryCalculation) => {
    navigate(`/teachers/${teacherId}/salary-calculations/${calculation.id}`);
  };

  const handleGenerate = () => {
    setGenerateDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
    refetchPreview();
  };

  if (loading && calculations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-white/60">Loading salary calculations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="ml-4 border-red-500/30 hover:bg-red-500/20"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {calculations.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02]">
          <div className="flex flex-col items-center text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
              <AlertCircle className="w-6 h-6 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No Salary Calculations</h3>
            <p className="text-white/70 mb-4 max-w-md text-sm">
              No salary calculations found for this teacher
              {filters.status !== 'all' && ` with status "${filters.status}"`}
              {yearName && ` in ${yearName}`}.
            </p>
            <Button
              onClick={handleGenerate}
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate First Calculation
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg bg-white/[0.02]">
          {/* Header with filters and Generate button */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Status:</span>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value as SalaryCalculationStatus | 'all' }))
                }
              >
                <SelectTrigger className="h-8 w-[120px] bg-white/5 border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="reopened">Reopened</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Salary
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white/70">Period</TableHead>
                <TableHead className="text-white/70 text-right">Calculated Amount</TableHead>
                <TableHead className="text-white/70 text-right">Approved Amount</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-white/70">Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((calc) => (
                <TableRow
                  key={calc.id}
                  onClick={() => handleViewDetails(calc)}
                  className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  <TableCell className="text-white font-medium">
                    {formatPeriod(calc.periodStart, calc.periodEnd)}
                  </TableCell>
                  <TableCell className="text-white font-medium text-right">
                    {formatCurrency(calc.calculatedAmount)}
                  </TableCell>
                  <TableCell className="text-white/80 text-right">
                    {calc.approvedAmount !== null ? formatCurrency(calc.approvedAmount) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(calc.status)}</TableCell>
                  <TableCell className="text-white/70 text-sm">
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
        </div>
      )}

      {/* Collapsible Salary Preview Section - Moved to bottom */}
      <Collapsible
        open={isPreviewExpanded}
        onOpenChange={setIsPreviewExpanded}
        className="space-y-2"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium"
          >
            <ChevronDown
              className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                isPreviewExpanded ? 'rotate-180' : ''
              }`}
            />
            {isPreviewExpanded ? 'Hide' : 'Show'} Salary Preview
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <SalaryPreviewCard
            preview={preview}
            loading={previewLoading}
            error={previewError}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
            onRetry={refetchPreview}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Dialogs */}
      <GenerateSalaryDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default SalaryCalculationsTab;
