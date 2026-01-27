/**
 * ObligationsSidebar - Side panel for viewing student obligations and payment history.
 *
 * This component displays a sliding panel from the right side that shows:
 * - Student summary header with financial overview
 * - Two tabs: Overview (obligations list) and Payment History
 *
 * Uses ViewSheet pattern since this is primarily a read-only display panel
 * with action buttons handled within individual tabs.
 *
 * Data is fetched once at this level and passed down to children to avoid
 * duplicate API calls and N+1 query issues.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewSheet } from '@/components/common/sheets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentLessonSummary } from '@/types/api/class';
import { getStudentObligations } from '@/services/obligationsApiService';
import type { StudentObligationResponse } from '@/types/api/obligations';
import { StudentSummaryHeader } from './components/StudentSummaryHeader';
import { ObligationsOverviewTab } from './tabs/ObligationsOverviewTab';
import { PaymentHistoryTab } from './tabs/PaymentHistoryTab';

/** Tab identifier type for the sidebar tabs */
type ObligationTab = 'overview' | 'history';

export interface ObligationsSidebarProps {
  /** Student data to display obligations for */
  student: StudentLessonSummary;
  /** Class ID for context and API calls */
  classId: string;
  /** Controls sidebar open state */
  open: boolean;
  /** Callback when sidebar open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Summary of obligation amounts for the header.
 */
interface FinancialSummary {
  totalDue: number;
  totalPaid: number;
  outstanding: number;
}

/**
 * Calculates financial summary from obligations.
 * Only counts non-cancelled obligations in totals.
 */
function calculateFinancialSummary(obligations: StudentObligationResponse[]): FinancialSummary {
  return obligations.reduce(
    (acc, obl) => {
      // Only count non-cancelled obligations in totals
      if (obl.status !== 'cancelled') {
        acc.totalDue += obl.finalAmount;
        acc.totalPaid += obl.paidAmount;
        acc.outstanding += obl.remainingAmount;
      }
      return acc;
    },
    { totalDue: 0, totalPaid: 0, outstanding: 0 }
  );
}

export function ObligationsSidebar({
  student,
  classId,
  open,
  onOpenChange,
}: ObligationsSidebarProps) {
  const [activeTab, setActiveTab] = useState<ObligationTab>('overview');

  // Centralized obligations data - fetched once and passed to children
  const [obligations, setObligations] = useState<StudentObligationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches obligations from the API.
   */
  const fetchObligations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentObligations(student.studentId);
      setObligations(response.obligations);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load obligations';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [student.studentId]);

  // Fetch obligations when sidebar opens
  useEffect(() => {
    if (open) {
      fetchObligations();
    }
  }, [open, fetchObligations]);

  // Calculate financial summary for the header
  const financialSummary = calculateFinancialSummary(obligations);

  // Show loading state while fetching
  if (loading) {
    return (
      <ViewSheet
        open={open}
        onOpenChange={onOpenChange}
        size="lg"
        intent="primary"
        icon={Receipt}
        title={student.studentName}
        description="Obligations & Payments"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/40 mb-4" />
          <p className="text-white/60 text-sm">Loading obligations...</p>
        </div>
      </ViewSheet>
    );
  }

  // Show error state
  if (error) {
    return (
      <ViewSheet
        open={open}
        onOpenChange={onOpenChange}
        size="lg"
        intent="primary"
        icon={Receipt}
        title={student.studentName}
        description="Obligations & Payments"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-white/70 text-sm mb-2">Failed to load obligations</p>
          <p className="text-white/50 text-xs mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchObligations}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </ViewSheet>
    );
  }

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      intent="primary"
      icon={Receipt}
      title={student.studentName}
      description="Obligations & Payments"
    >
      {/* Student Summary Header - receives calculated summary */}
      <StudentSummaryHeader
        totalDue={financialSummary.totalDue}
        totalPaid={financialSummary.totalPaid}
        outstanding={financialSummary.outstanding}
      />

      {/* Tabbed Content */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ObligationTab)}
        className="mt-4"
      >
        <TabsList className="bg-white/5 border border-white/10 rounded-lg p-1 w-full">
          <TabsTrigger
            value="overview"
            className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-md transition-colors"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-md transition-colors"
          >
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ObligationsOverviewTab
            obligations={obligations}
            summary={{
              totalOwed: financialSummary.totalDue,
              totalPaid: financialSummary.totalPaid,
              totalRemaining: financialSummary.outstanding,
            }}
            onRefresh={fetchObligations}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <PaymentHistoryTab obligations={obligations} />
        </TabsContent>
      </Tabs>
    </ViewSheet>
  );
}

export default ObligationsSidebar;
