import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { refreshObligationStatuses, selectError } from '@/store/slices/financeSlice';
import FinancialDashboard from '@/components/finance/dashboard/FinancialDashboard';
import ObligationManagement from '@/components/finance/obligations/ObligationManagement';
import PaymentManagement from '@/components/finance/payments/PaymentManagement';
import FinancialHeader from '@/components/finance/common/FinancialHeader';
import DemoModeNotification from '@/components/finance/common/DemoModeNotification';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useToast } from '@/hooks/use-toast';

const FinancialManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const { toast } = useToast();

  // Refresh obligation statuses on page load to update any overdue items
  useEffect(() => {
    dispatch(refreshObligationStatuses());
  }, [dispatch]);

  // Show error toast if there's an error in the finance state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);  return (
    <div className="space-y-6">
      <DemoModeNotification />
      <FinancialHeader />        <Tabs defaultValue="dashboard" className="w-full">        <TabsList className="grid grid-cols-3 mb-8 bg-white/10 shadow-lg border border-white/10">
          <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Dashboard</TabsTrigger>
          <TabsTrigger value="obligations" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Payment Obligations</TabsTrigger>
          <TabsTrigger value="payments" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Payments</TabsTrigger>
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
