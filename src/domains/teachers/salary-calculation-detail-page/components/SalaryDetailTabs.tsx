/**
 * Salary Detail Tabs Component
 * Combines Class Breakdown, Adjustments, and Audit Log in a tabbed interface
 * Compact, single-card layout inspired by Linear/Stripe
 */
import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Trash2, Info, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Amount } from '@/components/ui/amount';
import { formatRelativeTime } from '@/utils/formatters';
import { AddAdjustmentDialog } from '../dialogs/AddAdjustmentDialog';
import { DeleteAdjustmentDialog } from '../dialogs/DeleteAdjustmentDialog';
import { useSalaryCalculationAuditLog } from '../hooks';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type {
  SalaryCalculationItem,
  SalaryAdjustment,
  SalaryCalculationStatus,
  SalaryAuditLog,
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

// ============================================================================
// Class Breakdown Tab Content
// ============================================================================
const ClassBreakdownContent: React.FC<{
  items: SalaryCalculationItem[];
  baseSalaryAmount: number;
}> = ({ items, baseSalaryAmount }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-white/50 text-sm">
        No class items for this period
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalLessons = items.reduce((sum, item) => sum + item.lessonsCount, 0);
  const hasBaseSalary = baseSalaryAmount > 0;

  // Group by class for multi-tier display
  const byClass = items.reduce((acc, item) => {
    if (!acc[item.classId]) {
      acc[item.classId] = { className: item.className, tiers: [] };
    }
    acc[item.classId].tiers.push(item);
    return acc;
  }, {} as Record<string, { className: string; tiers: SalaryCalculationItem[] }>);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-white/50 text-xs font-medium h-8">CLASS</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-center h-8">STUDENTS</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-center h-8">LESSONS</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-right h-8">RATE</TableHead>
          <TableHead className="text-white/50 text-xs font-medium text-right h-8">AMOUNT</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(byClass).map(([classId, classData]) => (
          <React.Fragment key={classId}>
            {classData.tiers.map((tier, idx) => (
              <TableRow key={`${classId}-${idx}`} className="border-white/5 hover:bg-white/[0.02]">
                {idx === 0 ? (
                  <TableCell
                    className="text-white font-medium py-2 text-sm"
                    rowSpan={classData.tiers.length}
                  >
                    {classData.className}
                  </TableCell>
                ) : null}
                <TableCell className="text-white/70 text-center py-2 text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        {tier.studentCountAtLesson ?? '—'}
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1f2e] border-white/20 text-xs">
                        {tier.studentCountAtLesson !== null ? (
                          <p>Student count at lesson time</p>
                        ) : (
                          <p>Legacy: count not captured</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-white/70 text-center py-2 text-sm">
                  {tier.lessonsCount}
                </TableCell>
                <TableCell className="text-white/70 text-right py-2 text-sm tabular-nums">
                  {tier.rateApplied.toLocaleString()}
                </TableCell>
                <TableCell className="text-white text-right py-2 text-sm font-medium tabular-nums">
                  {tier.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
      <TableFooter className="bg-white/[0.03]">
        {hasBaseSalary && (
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableCell className="text-white/50 font-medium py-1.5 text-xs">Base Salary (Full Time)</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell className="text-white/70 text-right py-1.5 text-sm tabular-nums">
              {baseSalaryAmount.toLocaleString()} MKD
            </TableCell>
          </TableRow>
        )}
        <TableRow className="border-white/5 hover:bg-transparent">
          <TableCell className="text-white/70 font-medium py-1.5 text-sm">
            {hasBaseSalary ? 'Variable Pay (from classes)' : 'Total'}
          </TableCell>
          <TableCell />
          <TableCell className="text-white/70 text-center py-1.5 text-sm font-medium">
            {totalLessons}
          </TableCell>
          <TableCell />
          <TableCell className="text-white text-right py-1.5 text-sm tabular-nums">
            {totalAmount.toLocaleString()} MKD
          </TableCell>
        </TableRow>
        {hasBaseSalary && (
          <>
            <TableRow className="border-t border-white/20 hover:bg-transparent">
              <TableCell colSpan={5} className="py-1" />
            </TableRow>
            <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.05]">
              <TableCell className="text-white font-semibold py-2 text-sm">Total</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell className="text-white text-right py-2 text-sm font-bold tabular-nums">
                {(baseSalaryAmount + totalAmount).toLocaleString()} MKD
              </TableCell>
            </TableRow>
          </>
        )}
      </TableFooter>
    </Table>
  );
};

// ============================================================================
// Adjustments Tab Content
// ============================================================================
const AdjustmentsContent: React.FC<{
  adjustments: SalaryAdjustment[];
  adjustmentsTotal: number;
  status: SalaryCalculationStatus;
  calculationId: string;
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  onSuccess: () => void;
}> = ({ adjustments, adjustmentsTotal, status, calculationId, addDialogOpen, setAddDialogOpen, onSuccess }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState<SalaryAdjustment | null>(null);

  const isApproved = status === 'approved';

  const handleDelete = (adj: SalaryAdjustment) => {
    setAdjustmentToDelete(adj);
    setDeleteDialogOpen(true);
  };

  if (adjustments.length === 0) {
    return (
      <>
        <div className="text-center py-8">
          <p className="text-white/50 text-sm mb-3">No adjustments added</p>
          <p className="text-white/40 text-xs">
            {isApproved ? 'Reopen to add adjustments' : 'Click "+ Add" above to add an adjustment'}
          </p>
        </div>
        <AddAdjustmentDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          calculationId={calculationId}
          onSuccess={() => { setAddDialogOpen(false); onSuccess(); }}
        />
      </>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/50 text-xs font-medium h-8">TYPE</TableHead>
            <TableHead className="text-white/50 text-xs font-medium h-8">DESCRIPTION</TableHead>
            <TableHead className="text-white/50 text-xs font-medium text-right h-8">AMOUNT</TableHead>
            <TableHead className="text-white/50 text-xs font-medium h-8 w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adj) => (
            <TableRow key={adj.id} className="border-white/5 hover:bg-white/[0.02] group">
              <TableCell className="py-2">
                <div className="flex items-center gap-1.5">
                  {adj.adjustmentType === 'addition' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className={`text-xs ${adj.adjustmentType === 'addition' ? 'text-green-400' : 'text-red-400'}`}>
                    {adj.adjustmentType === 'addition' ? 'Bonus' : 'Deduction'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div>
                  <span className="text-white/80 text-sm">{adj.description}</span>
                  <div className="text-white/40 text-xs">
                    {formatRelativeTime(adj.createdAt)}
                    {adj.createdByName && ` by ${adj.createdByName}`}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <Amount
                  value={adj.adjustmentType === 'addition' ? adj.amount : -adj.amount}
                  size="sm"
                  showSign
                  colorBySign
                />
              </TableCell>
              <TableCell className="py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(adj)}
                  disabled={isApproved}
                  className="opacity-0 group-hover:opacity-100 text-red-400/70 hover:text-red-400 hover:bg-transparent h-6 w-6 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-white/[0.03]">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableCell colSpan={2} className="text-white/70 font-medium py-2 text-sm">
              Total Adjustments
            </TableCell>
            <TableCell className="text-right py-2">
              <Amount value={adjustmentsTotal} size="sm" weight="semibold" showSign colorBySign />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>

      <AddAdjustmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        calculationId={calculationId}
        onSuccess={() => { setAddDialogOpen(false); onSuccess(); }}
      />
      <DeleteAdjustmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        adjustment={adjustmentToDelete}
        calculationId={calculationId}
        onSuccess={() => { setDeleteDialogOpen(false); setAdjustmentToDelete(null); onSuccess(); }}
      />
    </>
  );
};

// ============================================================================
// History Tab Content
// ============================================================================
const HistoryContent: React.FC = () => {
  const { auditLogs, loading, error } = useSalaryCalculationAuditLog({ isExpanded: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error || auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-white/50 text-sm">
        {error || 'No history available'}
      </div>
    );
  }

  const sorted = [...auditLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const actionLabels: Record<string, string> = {
    created: 'Generated',
    approved: 'Approved',
    adjusted: 'Adjusted',
    reopened: 'Reopened',
    recalculated: 'Recalculated',
    adjustment_added: 'Adjustment Added',
    adjustment_removed: 'Adjustment Removed',
  };

  return (
    <div className="space-y-2 py-2">
      {sorted.map((entry, idx) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 text-sm"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium">
                {actionLabels[entry.action] || entry.action}
              </span>
              <span className="text-white/40 text-xs">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </div>
            {entry.previousAmount !== null && entry.newAmount !== null && (
              <div className="text-white/50 text-xs mt-0.5">
                {entry.previousAmount.toLocaleString()} → {entry.newAmount.toLocaleString()} MKD
              </div>
            )}
            {entry.reason && (
              <div className="text-white/40 text-xs mt-1 bg-white/5 rounded px-2 py-1">
                {entry.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Main Tabbed Component
// ============================================================================
export const SalaryDetailTabs: React.FC<SalaryDetailTabsProps> = ({
  items,
  adjustments,
  adjustmentsTotal,
  baseSalaryAmount,
  status,
  calculationId,
  onSuccess,
}) => {
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
            <ClassBreakdownContent items={items} baseSalaryAmount={baseSalaryAmount} />
          </TabsContent>

          <TabsContent value="adjustments" className="m-0">
            <AdjustmentsContent
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
            <HistoryContent />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
