import React, { useState } from 'react';
import { Archive, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/dialogs';
import { useClasses } from '@/domains/classes/_shared/hooks/useClasses';
import { ClassBasicInfoResponse } from '@/types/api/class';

interface DisableClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassBasicInfoResponse;
  onSuccess?: () => void;
}

export const DisableClassDialog: React.FC<DisableClassDialogProps> = ({
  open,
  onOpenChange,
  classData,
  onSuccess,
}) => {
  const { disable } = useClasses();
  const [isDisabling, setIsDisabling] = useState(false);

  const handleConfirm = async () => {
    setIsDisabling(true);
    try {
      await disable(classData.id, classData.name);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is already handled by the hook (toast shown)
      console.error('Failed to disable class:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="warning"
      size="md"
      icon={Archive}
      title="Disable Class"
      description={`Are you sure you want to disable ${classData.name}?`}
      confirmText="Disable Class"
      onConfirm={handleConfirm}
      isLoading={isDisabling}
      infoContent={
        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-sm text-white/80">
                <p className="font-medium text-orange-400 mb-1">This will:</p>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  <li>Delete all future lessons</li>
                  <li>Mark all schedule slots as obsolete</li>
                  <li>Mark all student enrollments as inactive</li>
                  <li>Free up students for other classes</li>
                  <li>Preserve all past lessons and attendance data</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/60">
            You can re-enable this class later if needed. Disabled classes are hidden by default in the class list.
          </p>
        </div>
      }
    />
  );
};
