/**
 * Salary Detail Tabs Component (Orchestrator)
 * Combines Class Breakdown, Adjustments, and Audit Log in a tabbed interface
 * Compact, single-card layout inspired by Linear/Stripe
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClassBreakdownTab, AdjustmentsTab, AuditLogTab } from './tabs';
import type {
  SalaryCalculationItem,
  SalaryAdjustment,
  SalaryCalculationStatus,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryDetailTabsProps {
  items: SalaryCalculationItem[];
  adjustments: SalaryAdjustment[];
  adjustmentsTotal: number;
  baseSalaryAmount: number;
  status: SalaryCalculationStatus;
  calculationId: string;
  onSuccess: () => void;
}

export function SalaryDetailTabs({
  items,
  adjustments,
  adjustmentsTotal,
  baseSalaryAmount,
  status,
  calculationId,
  onSuccess,
}: SalaryDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('breakdown');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const isApproved = status === 'approved';

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-white/[0.08] mx-4">
          <TabsList className="bg-transparent rounded-none p-0 h-auto gap-1">
            <TabsTrigger
              value="breakdown"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Classes ({items.length})
            </TabsTrigger>
            <TabsTrigger
              value="adjustments"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Adjustments ({adjustments.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              History
            </TabsTrigger>
          </TabsList>
          {activeTab === 'adjustments' && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              disabled={isApproved}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white gap-1.5 h-7 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <TabsContent value="breakdown" className="m-0">
            <ClassBreakdownTab items={items} baseSalaryAmount={baseSalaryAmount} />
          </TabsContent>

          <TabsContent value="adjustments" className="m-0">
            <AdjustmentsTab
              adjustments={adjustments}
              adjustmentsTotal={adjustmentsTotal}
              status={status}
              calculationId={calculationId}
              addDialogOpen={addDialogOpen}
              setAddDialogOpen={setAddDialogOpen}
              onSuccess={onSuccess}
            />
          </TabsContent>

          <TabsContent value="history" className="m-0">
            <AuditLogTab calculationId={calculationId} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
