/**
 * Salary Calculation Detail Page
 * Standalone page for viewing detailed breakdown of a salary calculation
 * Converted from SalaryCalculationDetailDialog to match Class/Student page patterns
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useTeacherSalaryCalculationDetail } from './hooks/useTeacherSalaryCalculationDetailPage';
import { SalaryCalculationHeader } from './components/SalaryCalculationHeader';
import { SalaryCalculationBreakdown } from './components/SalaryCalculationBreakdown';
import { SalaryCalculationAuditLog } from './components/SalaryCalculationAuditLog';
import { ApproveSalaryDialog, ReopenSalaryDialog } from '../detail-page/tabs/salary-calculations/dialogs';
import type { SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

/**
 * Breadcrumb Navigation Component
 * Pattern: Teachers → [Teacher Name] → Salary Calculations → [Period Display]
 */
const SalaryCalculationBreadcrumbs: React.FC<{
  teacherName: string;
  periodDisplay: string;
}> = ({ teacherName, periodDisplay }) => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  return (
    <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
      <button
        onClick={() => navigate('/teachers')}
        className="hover:text-white transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
        Teachers
      </button>
      <ChevronRight className="w-4 h-4" />
      <button
        onClick={() => navigate(`/teachers/${teacherId}`)}
        className="hover:text-white transition-colors"
      >
        {teacherName}
      </button>
      <ChevronRight className="w-4 h-4" />
      <button
        onClick={() => navigate(`/teachers/${teacherId}?tab=salary-calculations`)}
        className="hover:text-white transition-colors"
      >
        Salary Calculations
      </button>
      <ChevronRight className="w-4 h-4" />
      <span className="text-white/90">{periodDisplay}</span>
    </div>
  );
};

export const SalaryCalculationDetailPage: React.FC = () => {
  const { teacherId, calculationId } = useParams<{ teacherId: string; calculationId: string }>();
  const navigate = useNavigate();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);

  const { detail, loading, error, refetch, teacherName, periodDisplay } = 
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

  // Loading state
  if (loading && !detail) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Home className="w-4 h-4" />
          <span>Loading...</span>
        </div>
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
          onClick={() => navigate(`/teachers/${teacherId}?tab=salary-calculations`)}
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
      {/* Breadcrumbs */}
      <SalaryCalculationBreadcrumbs
        teacherName={teacherName}
        periodDisplay={periodDisplay}
      />

      {/* Page Header with Actions and Summary */}
      <SalaryCalculationHeader
        detail={detail}
        onApprove={handleApprove}
        onReopen={handleReopen}
      />

      {/* Class Breakdown */}
      <SalaryCalculationBreakdown items={detail.items} />

      {/* Audit Log - Collapsible with Lazy Loading */}
      <SalaryCalculationAuditLog />

      {/* Action Dialogs */}
      <ApproveSalaryDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        calculation={detail as any}
        onSuccess={handleDialogSuccess}
      />

      <ReopenSalaryDialog
        open={reopenDialogOpen}
        onOpenChange={setReopenDialogOpen}
        calculation={detail as any}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default SalaryCalculationDetailPage;
