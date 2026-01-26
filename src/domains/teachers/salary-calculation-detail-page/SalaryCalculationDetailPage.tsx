/**
 * Salary Calculation Detail Page
 * Standalone page for viewing detailed breakdown of a salary calculation
 * Compact layout with prominent grand total and tabbed details
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import AppBreadcrumb from '@/components/navigation/AppBreadcrumb';
import { buildTeacherBreadcrumbs } from '../_shared/utils/teacherBreadcrumbs';
import { useTeacherSalaryCalculationDetail } from './hooks/useTeacherSalaryCalculationDetailPage';
import { SalaryTotalHero } from './components/SalaryTotalHero';
import { SalaryDetailTabs } from './components/SalaryDetailTabs';
import { ApproveSalaryDialog, ReopenSalaryDialog } from '../detail-page/tabs/salary-calculations/dialogs';

export const SalaryCalculationDetailPage: React.FC = () => {
  const { teacherId, calculationId } = useParams<{ teacherId: string; calculationId: string }>();
  const navigate = useNavigate();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);

  const { detail, loading, error, refetch, teacherName, periodDisplay, currentEmploymentType } =
    useTeacherSalaryCalculationDetail({
      teacherId: teacherId || null,
      calculationId: calculationId || null,
    });

  const handleDialogSuccess = () => {
    refetch();
  };

  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const handleReopen = () => {
    setReopenDialogOpen(true);
  };

  // Build breadcrumbs using centralized utility
  const breadcrumbItems = buildTeacherBreadcrumbs({
    teacherData: teacherId ? { id: teacherId, name: teacherName } : null,
    salaryData: { periodDisplay },
    pageType: 'salary-detail',
  });

  // Loading state
  if (loading && !detail) {
    return (
      <div className="space-y-4">
        <AppBreadcrumb items={breadcrumbItems} className="mb-4" />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-white/60">Loading salary calculation details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(`/teachers/${teacherId}?tab=salary`)}
          className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Salary Calculations
        </button>
        <ErrorMessage
          title="Error Loading Salary Calculation"
          message={error || 'Calculation not found'}
          onRetry={refetch}
          showRetry
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={breadcrumbItems} className="mb-4" />

      <SalaryTotalHero
        detail={detail}
        currentEmploymentType={currentEmploymentType}
        onApprove={handleApprove}
        onReopen={handleReopen}
      />

      <SalaryDetailTabs
        items={detail.items}
        adjustments={detail.adjustments}
        adjustmentsTotal={detail.adjustmentsTotal}
        baseSalaryAmount={detail.baseSalaryAmount}
        status={detail.status}
        calculationId={detail.calculationId}
        onSuccess={refetch}
      />

      <ApproveSalaryDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        calculation={detail}
        onSuccess={handleDialogSuccess}
      />

      <ReopenSalaryDialog
        open={reopenDialogOpen}
        onOpenChange={setReopenDialogOpen}
        calculation={detail}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default SalaryCalculationDetailPage;
