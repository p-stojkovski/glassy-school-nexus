import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export interface TabEditControlsProps {
  mode: 'view' | 'edit';
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isValidating?: boolean;
  validationErrors?: any; // Accept errors object directly
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
  isValidating = false,
  validationErrors = {},
  onEdit,
  onSave,
  onCancel,
}) => {
  const [showErrors, setShowErrors] = useState(false);

  // Count errors
  const errorCount = Object.keys(validationErrors || {}).length;

  // Extract meaningful error messages from validation errors
  const getErrorMessages = () => {
    const messages: string[] = [];
    
    // Debug: log the actual error structure
    if (errorCount > 0) {
      console.log('Validation Errors:', JSON.stringify(validationErrors, null, 2));
    }
    
    const extractMessage = (error: any, path: string = ''): void => {
      if (!error) return;
      
      // Direct message property
      if (error.message && typeof error.message === 'string') {
        messages.push(error.message);
        return;
      }
      
      // Check for root message (zod refine errors)
      if (error.root?.message && typeof error.root.message === 'string') {
        messages.push(error.root.message);
        return;
      }
      
      // String error
      if (typeof error === 'string') {
        messages.push(error);
        return;
      }
      
      // Nested errors (for arrays/objects)
      if (typeof error === 'object') {
        // Iterate through object properties
        Object.keys(error).forEach((key) => {
          if (key === 'message' || key === 'root' || key === 'type' || key === 'ref') return;
          const nestedError = error[key];
          extractMessage(nestedError, key);
        });
      }
    };
    
    // Extract from errors object
    if (validationErrors && typeof validationErrors === 'object') {
      Object.keys(validationErrors).forEach((key) => {
        extractMessage(validationErrors[key], key);
      });
    }
    
    // Remove duplicates and filter out empty messages
    const uniqueMessages = [...new Set(messages)].filter(msg => msg && msg.trim());
    
    return uniqueMessages.length > 0 ? uniqueMessages : ['Please check your form for errors'];
  };

  const errorMessages = getErrorMessages();
  if (mode === 'view') {
    return (
      <div className="w-full sm:w-auto">
        <Button
          onClick={onEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold w-full sm:w-auto"
        >
          Edit
        </Button>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="flex flex-col items-stretch gap-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Unsaved indicator */}
        {hasUnsavedChanges && !isSaving && !isValidating && (
          <span className="flex items-center gap-1 px-3 py-2 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            Unsaved
          </span>
        )}

        {/* Validation error indicator - clickable to show details */}
        {errorCount > 0 && !isSaving && !isValidating && (
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            {errorCount} error{errorCount !== 1 ? 's' : ''}
            {showErrors ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
        )}

        {/* Cancel button */}
        <Button
          onClick={onCancel}
          disabled={isSaving || isValidating}
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 w-full sm:w-auto"
        >
          Cancel
        </Button>

        {/* Save button */}
        <Button
          onClick={onSave}
          disabled={isSaving || isValidating || errorCount > 0}
          className="bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 w-full sm:w-auto"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Error details - expandable section */}
      {showErrors && errorCount > 0 && !isSaving && !isValidating && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
          <p className="text-red-400 text-xs font-semibold mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index} className="text-red-300 text-sm">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default TabEditControls;
