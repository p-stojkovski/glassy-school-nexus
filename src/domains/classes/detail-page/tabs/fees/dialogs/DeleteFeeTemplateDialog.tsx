import React from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/dialogs';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import type { ClassFeeTemplate, FeeType } from '@/types/api/classFees';

interface DeleteFeeTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ClassFeeTemplate | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

// Fee type display configuration
const FEE_TYPE_LABELS: Record<FeeType, string> = {
  tuition: 'Tuition',
  material: 'Material',
  exam: 'Exam',
  activity: 'Activity',
  other: 'Other',
};

export function DeleteFeeTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirm,
  isDeleting = false,
}: DeleteFeeTemplateDialogProps) {
  if (!template) return null;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
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
      title="Delete Fee Template"
      description="Are you sure you want to delete this fee template? This action cannot be undone."
      confirmText="Delete Template"
      onConfirm={onConfirm}
      isLoading={isDeleting}
      infoContent={
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-white/60">Name:</div>
              <div className="text-white font-medium">{template.name}</div>

              <div className="text-white/60">Type:</div>
              <div className="text-white font-medium">{FEE_TYPE_LABELS[template.feeType]}</div>

              <div className="text-white/60">Amount:</div>
              <div className="text-white font-medium">
                <Amount value={template.amount} weight="medium" className="text-white" />
              </div>

              <div className="text-white/60">Recurring:</div>
              <div className="text-white font-medium">
                {template.isRecurring ? (
                  <Badge
                    variant="default"
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                  >
                    Monthly
                  </Badge>
                ) : (
                  'One-time'
                )}
              </div>

              <div className="text-white/60">Optional:</div>
              <div className="text-white font-medium">
                {template.isOptional ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-300 border-amber-500/30"
                  >
                    Optional
                  </Badge>
                ) : (
                  'Required'
                )}
              </div>

              <div className="text-white/60">Effective From:</div>
              <div className="text-white font-medium">{formatDate(template.effectiveFrom)}</div>
            </div>
          </div>
        </div>
      }
    />
  );
}
