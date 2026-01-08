import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  refreshObligationStatuses,
  selectError,
} from '@/domains/finance/financeSlice';
import FinancialDashboard from '@/domains/finance/components/dashboard/FinancialDashboard';
import ObligationManagement from '@/domains/finance/components/obligations/ObligationManagement';
import PaymentManagement from '@/domains/finance/components/payments/PaymentManagement';
import FinancialHeader from '@/domains/finance/components/common/FinancialHeader';
import { DemoManager } from '@/data/components/DemoManager';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { toast } from 'sonner';
import { useFinancialData } from '@/data/hooks/useFinancialData';
import { useStudentsData } from '@/data/hooks/useStudentsData';

const FinancialManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);

  // Load financial data and dependencies when needed
  const financialHook = useFinancialData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });

  // Load students data (required for financial data relationships)
  const studentsHook = useStudentsData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });

  // Refresh obligation statuses on page load to update any overdue items
  useEffect(() => {
    dispatch(refreshObligationStatuses());
  }, [dispatch]);
  // Show error toast if there's an error in the finance state
  useEffect(() => {
    if (error) {
      toast.error('Error', {
        description: error,
      });
    }
  }, [error]);
  return (
    <div className="space-y-6">
      <DemoManager
        showFullControls={true}
        title="Financial Management Demo"
        description="Manage payments, obligations, and financial records. All data is stored locally and persists between sessions."
      />
      <FinancialHeader />{' '}
      <Tabs defaultValue="dashboard" className="w-full">
        {' '}
        <TabsList className="bg-transparent border-b border-white/[0.08] rounded-none p-0 h-auto gap-1 mb-8">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="obligations"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Payment Obligations
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Payments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-4">
          <FinancialDashboard />
        </TabsContent>
        <TabsContent value="obligations" className="space-y-4">
          <ErrorBoundary>
            <ObligationManagement />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <ErrorBoundary>
            <PaymentManagement />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;

