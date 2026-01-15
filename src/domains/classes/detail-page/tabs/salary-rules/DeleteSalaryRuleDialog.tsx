import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/dialogs';
import { Amount } from '@/components/ui/amount';
import { ClassSalaryRule } from '@/domains/classes/_shared/types/salaryRule.types';

interface DeleteSalaryRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: ClassSalaryRule | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteSalaryRuleDialog({
  open,
  onOpenChange,
  rule,
  onConfirm,
  isDeleting = false,
}: DeleteSalaryRuleDialogProps) {
  if (!rule) return null;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="danger"
      size="md"
      icon={Trash2}
      title="Delete Salary Rule"
      description="Are you sure you want to delete this salary rule? This action cannot be undone."
      confirmText="Delete Rule"
      onConfirm={onConfirm}
      isLoading={isDeleting}
      infoContent={
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-white/60">Min Students:</div>
              <div className="text-white font-medium">{rule.minStudents}</div>

              <div className="text-white/60">Rate per Lesson:</div>
              <div className="text-white font-medium">
                <Amount value={rule.ratePerLesson} weight="medium" className="text-white" />
              </div>

              <div className="text-white/60">Effective From:</div>
              <div className="text-white font-medium">{formatDate(rule.effectiveFrom)}</div>

              <div className="text-white/60">Effective To:</div>
              <div className="text-white font-medium">{formatDate(rule.effectiveTo)}</div>

              <div className="text-white/60">Status:</div>
              <div className="text-white font-medium">{rule.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>

          {rule.isApplied && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm text-white/80">
                  <p className="font-medium text-yellow-400 mb-1">Warning</p>
                  <p className="text-white/70">
                    This rule is currently applied to active enrollments. Deleting it may affect salary calculations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
