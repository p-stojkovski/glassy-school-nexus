/**
 * Salary Calculations Tab - Teacher Profile
 * Displays salary preview card and list of salary calculations with status filtering
 * Refactored: Components extracted for maintainability
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedTeacher } from '@/domains/teachers/teachersSlice';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GlassCard from '@/components/common/GlassCard';
import { SalaryCalculationStatus, type SalaryCalculation } from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { useTeacherSalaryCalculations } from '../../hooks/useTeacherSalaryCalculations';
import { useTeacherSalaryPreview } from '../../hooks/useTeacherSalaryPreview';
import { GenerateSalaryDialog } from './dialogs';
import {
  SalaryCalculationsHeader,
  SalaryCalculationsTable,
  SalaryCalculationsEmptyState,
  SalaryPreviewCollapsible,
} from './components';

interface SalaryCalculationsTabProps {
  academicYearId: string | null;
  yearName: string;
  isActive: boolean;
}

const SalaryCalculationsTab: React.FC<SalaryCalculationsTabProps> = ({ academicYearId, yearName }) => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  // Get teacher from Redux state for employment type
  const selectedTeacher = useAppSelector(selectSelectedTeacher);
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

  const handleViewDetails = (calculation: SalaryCalculation) => {
    navigate(`/teachers/${teacherId}/salary-calculations/${calculation.id}`);
  };

  const handleGenerate = () => {
    setGenerateDialogOpen(true);
  };

  const handleStatusFilterChange = (value: SalaryCalculationStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status: value }));
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
        <SalaryCalculationsEmptyState
          statusFilter={filters.status}
          yearName={yearName}
          onGenerate={handleGenerate}
        />
      ) : (
        <GlassCard className="overflow-hidden">
          <SalaryCalculationsHeader
            statusFilter={filters.status}
            onStatusFilterChange={handleStatusFilterChange}
            onGenerate={handleGenerate}
          />
          <SalaryCalculationsTable
            calculations={calculations}
            employmentType={employmentType}
            onRowClick={handleViewDetails}
          />
        </GlassCard>
      )}

      {/* Collapsible Salary Preview Section */}
      <SalaryPreviewCollapsible
        isExpanded={isPreviewExpanded}
        onExpandedChange={setIsPreviewExpanded}
        preview={preview}
        loading={previewLoading}
        error={previewError}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onRetry={refetchPreview}
      />

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
