/**
 * DeleteAdjustmentDialog - Confirmation dialog to delete a salary adjustment
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/dialogs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  setLoadingState,
  setError,
  removeSalaryAdjustment,
} from '@/domains/teachers/teachersSlice';
import { deleteSalaryAdjustment } from '@/services/teacherApiService';
import { Amount } from '@/components/ui/amount';
import type { SalaryAdjustment } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface DeleteAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustment: SalaryAdjustment | null;
  calculationId: string;
  onSuccess?: () => void;
}

export const DeleteAdjustmentDialog: React.FC<DeleteAdjustmentDialogProps> = ({
  open,
  onOpenChange,
  adjustment,
  calculationId,
  onSuccess,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(
    (state) => state.teachers.loading.deletingSalaryAdjustment
  );

  const handleDelete = async () => {
    if (!teacherId || !adjustment) return;

    try {
      dispatch(
        setLoadingState({ operation: 'deletingSalaryAdjustment', loading: true })
      );
      dispatch(
        setError({ operation: 'deleteSalaryAdjustment', error: null })
      );

      await deleteSalaryAdjustment(teacherId, calculationId, adjustment.id);

      // Update Redux state
      dispatch(removeSalaryAdjustment(adjustment.id));

      toast({
        title: 'Adjustment deleted',
        description: 'Successfully removed the adjustment from this calculation',
        variant: 'default',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete salary adjustment';
      dispatch(
        setError({ operation: 'deleteSalaryAdjustment', error: errorMessage })
      );
      toast({
        title: 'Failed to delete adjustment',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch(
        setLoadingState({ operation: 'deletingSalaryAdjustment', loading: false })
      );
    }
  };

  if (!adjustment) return null;

  const infoContent = (
    <>
      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <AlertTriangle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-200 text-sm">
          Deleting this adjustment will recalculate the total salary amount.
        </AlertDescription>
      </Alert>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">Type:</span>
          <span className="text-sm text-white font-medium capitalize">
            {adjustment.adjustmentType === 'addition' ? 'Bonus' : 'Deduction'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">Description:</span>
          <span className="text-sm text-white font-medium text-right max-w-xs truncate">
            {adjustment.description}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">Amount:</span>
          <Amount
            value={adjustment.adjustmentType === 'addition' ? adjustment.amount : -adjustment.amount}
            size="sm"
            weight="medium"
            showSign
            colorBySign
          />
        </div>
      </div>
    </>
  );

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="danger"
      size="sm"
      icon={Trash2}
      title="Delete Adjustment"
      description="Are you sure you want to delete this adjustment? This action cannot be undone."
      confirmText="Delete Adjustment"
      onConfirm={handleDelete}
      isLoading={loading}
      infoContent={infoContent}
    />
  );
};
