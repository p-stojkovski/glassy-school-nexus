/**
 * Adjustments Tab Component
 * Extracted from SalaryDetailTabs.tsx
 * Displays salary adjustments (bonuses/deductions) with add/delete functionality
 */
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
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
import { Amount } from '@/components/ui/amount';
import { formatRelativeTime } from '@/utils/formatters';
import { AddAdjustmentDialog } from '../../dialogs/AddAdjustmentDialog';
import { DeleteAdjustmentDialog } from '../../dialogs/DeleteAdjustmentDialog';
import type {
  SalaryAdjustment,
  SalaryCalculationStatus,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface AdjustmentsTabProps {
  adjustments: SalaryAdjustment[];
  adjustmentsTotal: number;
  status: SalaryCalculationStatus;
  calculationId: string;
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdjustmentsTab({
  adjustments,
  adjustmentsTotal,
  status,
  calculationId,
  addDialogOpen,
  setAddDialogOpen,
  onSuccess,
}: AdjustmentsTabProps) {
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
}
