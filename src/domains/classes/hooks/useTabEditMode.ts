import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface UseTabEditModeProps<T> {
  initialData: T;
  onSave: (data: T) => Promise<void>;
  validate?: (data: T) => ValidationResult;
  tabId: string;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

export interface UseTabEditModeReturn<T> {
  mode: 'view' | 'edit';
  editData: T | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  validationErrors: ValidationError[];

  // Actions
  enterEditMode: () => void;
  cancelEdit: (force?: boolean) => void;
  saveChanges: () => Promise<void>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
}

/**
 * Hook for managing tab-level edit state independently.
 * Each editable tab uses this hook to manage its own edit mode, validation, and saves.
 */
export const useTabEditMode = <T extends Record<string, any>>({
  initialData,
  onSave,
  validate,
  tabId,
  onUnsavedChangesChange,
}: UseTabEditModeProps<T>): UseTabEditModeReturn<T> => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editData, setEditData] = useState<T | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Track original data for comparison
  const originalDataRef = useRef(initialData);

  // Update original data when initialData changes
  useEffect(() => {
    originalDataRef.current = initialData;
  }, [initialData]);

  // Notify parent of unsaved changes
  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  // Deep equality check for unsaved changes detection
  const isDataEqual = useCallback((data1: T, data2: T): boolean => {
    return JSON.stringify(data1) === JSON.stringify(data2);
  }, []);

  const enterEditMode = useCallback(() => {
    setMode('edit');
    setEditData(JSON.parse(JSON.stringify(initialData))); // Deep copy
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  }, [initialData]);

  const cancelEdit = useCallback((force = false) => {
    if (hasUnsavedChanges && !force) {
      // Caller should handle confirmation
      return;
    }
    setMode('view');
    setEditData(null);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  }, [hasUnsavedChanges]);

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setEditData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [field]: value };
        
        // Check if data has changed from original
        const hasChanges = !isDataEqual(updated, originalDataRef.current);
        setHasUnsavedChanges(hasChanges);
        
        return updated;
      });
    },
    [isDataEqual]
  );

  const saveChanges = useCallback(async () => {
    if (!editData) return;

    // Validate
    if (validate) {
      const result = validate(editData);
      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error('Please fix validation errors before saving');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(editData);
      
      // Update original data to new saved data
      originalDataRef.current = JSON.parse(JSON.stringify(editData));
      
      setMode('view');
      setEditData(null);
      setHasUnsavedChanges(false);
      setValidationErrors([]);
      
      toast.success('Changes saved successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save changes');
      // Stay in edit mode on error
    } finally {
      setIsSaving(false);
    }
  }, [editData, validate, onSave]);

  return {
    mode,
    editData,
    hasUnsavedChanges,
    isSaving,
    validationErrors,
    enterEditMode,
    cancelEdit,
    saveChanges,
    updateField,
  };
};

export type UseTabEditModeReturn_Type = typeof useTabEditMode;
