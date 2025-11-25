import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface TabEditControlsProps {
  mode: 'view' | 'edit';
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  validationErrors?: any[];
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Tab-level edit controls component
 * Displays Edit button in view mode, Save/Cancel in edit mode
 */
const TabEditControls: React.FC<TabEditControlsProps> = ({
  mode,
  hasUnsavedChanges,
  isSaving,
  validationErrors = [],
  onEdit,
  onSave,
  onCancel,
}) => {
  if (mode === 'view') {
    return (
      <div>
        <Button
          onClick={onEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          Edit
        </Button>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="flex items-center gap-2">
      {/* Unsaved indicator */}
      {hasUnsavedChanges && !isSaving && (
        <span className="flex items-center gap-1 px-3 py-2 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium">
          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
          Unsaved
        </span>
      )}

      {/* Validation error indicator */}
      {validationErrors.length > 0 && !isSaving && (
        <span className="flex items-center gap-1 px-3 py-2 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
        </span>
      )}

      {/* Cancel button */}
      <Button
        onClick={onCancel}
        disabled={isSaving}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/5 disabled:opacity-50"
      >
        Cancel
      </Button>

      {/* Save button */}
      <Button
        onClick={onSave}
        disabled={isSaving || validationErrors.length > 0}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
};

export default TabEditControls;
