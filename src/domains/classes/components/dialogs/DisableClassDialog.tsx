import React, { useState } from 'react';
import { Archive, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClassesApi } from '@/domains/classesApi/hooks/useClassesApi';
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
  const { disable } = useClassesApi();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-orange-400" />
            Disable Class
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Temporarily disable this class from active operations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-white/80">
            Are you sure you want to disable <strong className="text-white">{classData.name}</strong>?
          </p>

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

        <DialogFooter className="gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDisabling}
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDisabling}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            {isDisabling ? 'Disabling...' : 'Disable Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
