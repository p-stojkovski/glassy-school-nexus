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
import { useAppSelector } from '@/store/hooks';
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
import GlassCard from '@/components/common/GlassCard';
import { EmptyState } from '@/components/common/EmptyState';
import { formatPeriod, formatRelativeTime } from '@/utils/formatters';
import { Amount } from '@/components/ui/amount';
import {
  SalaryCalculationStatus,
  type SalaryCalculation,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { useTeacherSalaryCalculations } from '../../hooks/useTeacherSalaryCalculations';
import { useTeacherSalaryPreview } from '../../hooks/useTeacherSalaryPreview';
import SalaryPreviewCard from './SalaryPreviewCard';
import { GenerateSalaryDialog } from './dialogs';
import { EmploymentTypeBadge } from './components/EmploymentTypeBadge';

interface SalaryCalculationsTabProps {
  academicYearId: string | null;
  yearName: string;
  isActive: boolean;
}

const SalaryCalculationsTab: React.FC<SalaryCalculationsTabProps> = ({ academicYearId, yearName, isActive }) => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  // Get teacher from Redux state for employment type
  const selectedTeacher = useAppSelector((state) => state.teachers.selectedTeacher);
  const employmentType = selectedTeacher?.employmentType || 'contract';

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
    <div className="space-y-4">
      {/* Salary Calculations List */}
      {calculations.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No Salary Calculations"
          description={`No salary calculations found for this teacher${filters.status !== 'all' ? ` with status "${filters.status}"` : ''}${yearName ? ` in ${yearName}` : ''}.`}
          action={{
            label: 'Generate First Calculation',
            onClick: handleGenerate,
            icon: <Plus className="w-4 h-4" />,
          }}
        />
      ) : (
        <GlassCard className="overflow-hidden">
          {/* Header with filters and Generate button */}
          <div className="flex items-end justify-between p-3 border-b border-white/10">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50 font-medium">Status:</span>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value as SalaryCalculationStatus | 'all' }))
                }
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
                  onClick={() => handleViewDetails(calc)}
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
        </GlassCard>
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
