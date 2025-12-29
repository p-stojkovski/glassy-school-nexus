import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Enable Class
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Re-enable this class to resume operations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-white/80">
            Are you sure you want to enable <strong className="text-white">{classData.name}</strong>?
          </p>

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

        <DialogFooter className="gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isEnabling}
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isEnabling}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {isEnabling ? 'Enabling...' : 'Enable Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
