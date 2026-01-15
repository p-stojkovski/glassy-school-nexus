import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/dialogs';
import { useClasses } from '@/domains/classes/_shared/hooks/useClasses';
import { ClassBasicInfoResponse } from '@/types/api/class';

interface EnableClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassBasicInfoResponse;
  onSuccess?: () => void;
}

export const EnableClassDialog: React.FC<EnableClassDialogProps> = ({
  open,
  onOpenChange,
  classData,
  onSuccess,
}) => {
  const { enable } = useClasses();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleConfirm = async () => {
    setIsEnabling(true);
    try {
      await enable(classData.id, classData.name);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is already handled by the hook (toast shown)
      console.error('Failed to enable class:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="success"
      size="md"
      icon={Play}
      title="Enable Class"
      description={`Are you sure you want to enable ${classData.name}?`}
      confirmText="Enable Class"
      onConfirm={handleConfirm}
      isLoading={isEnabling}
      infoContent={
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-white/80">
                <p className="font-medium text-blue-400 mb-1">After enabling:</p>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  <li>Add new schedule slots to generate lessons</li>
                  <li>Enroll students to the class</li>
                  <li>Past lessons and attendance data are preserved</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/60">
            Note: Previous schedule slots remain archived. You'll need to create new schedules for this class.
          </p>
        </div>
      }
    />
  );
};
