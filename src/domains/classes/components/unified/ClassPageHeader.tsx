import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassResponse } from '@/types/api/class';

interface ClassPageHeaderProps {
  classData: ClassResponse | null;
  mode?: 'view' | 'edit';
  hasUnsavedChanges?: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const ClassPageHeader: React.FC<ClassPageHeaderProps> = ({
  classData,
  mode,
  hasUnsavedChanges,
  onBack,
  onEdit,
  onSave,
  onCancel,
}) => {
  if (!classData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Classes
          </Button>
        </div>
        
        {/* Edit controls moved to individual tabs */}
        {mode === 'view' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/5"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClassPageHeader;
