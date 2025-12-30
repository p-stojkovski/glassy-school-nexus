import { useState, useCallback } from 'react';

/**
 * Section types for the Student Details tab
 */
export type SectionType = 'personal' | 'guardian' | 'financial';

/**
 * Hook return type
 */
export interface UseSectionEditReturn {
  /** Currently active section in edit mode, or null if none */
  activeSection: SectionType | null;
  /** Whether the current section has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether to show the unsaved changes prompt dialog */
  showPrompt: boolean;
  /** The section user wants to switch to (pending confirmation) */
  pendingSwitchTo: SectionType | null;
  /** Set the unsaved changes flag */
  setHasUnsavedChanges: (value: boolean) => void;
  /** Request to enter edit mode for a section (may trigger prompt if unsaved changes) */
  requestEditSection: (section: SectionType) => void;
  /** Handle "Save" option in the unsaved changes prompt */
  handlePromptSave: () => void;
  /** Handle "Discard" option in the unsaved changes prompt */
  handlePromptDiscard: () => void;
  /** Handle "Cancel" option in the unsaved changes prompt (stay in current edit) */
  handlePromptCancel: () => void;
  /** Cancel editing the current section */
  cancelEdit: () => void;
  /** Complete editing (after successful save) */
  completeEdit: () => void;
  /** Check if a specific section is in edit mode */
  isEditing: (section: SectionType) => boolean;
}

/**
 * useSectionEdit - Manages single-section editing state
 *
 * Enforces the constraint that only one section can be in edit mode at a time.
 * When switching sections with unsaved changes, prompts the user to save/discard.
 *
 * @example
 * ```tsx
 * const {
 *   activeSection,
 *   requestEditSection,
 *   isEditing,
 *   ...
 * } = useSectionEdit();
 *
 * <StudentInfoSection
 *   isEditing={isEditing('personal')}
 *   onEdit={() => requestEditSection('personal')}
 *   ...
 * />
 * ```
 */
export const useSectionEdit = (): UseSectionEditReturn => {
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingSwitchTo, setPendingSwitchTo] = useState<SectionType | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  /**
   * Request to enter edit mode for a section.
   * If another section is being edited with unsaved changes, shows a prompt.
   */
  const requestEditSection = useCallback((section: SectionType) => {
    // If clicking the same section that's already editing, do nothing
    if (activeSection === section) {
      return;
    }

    // If there's an active section with unsaved changes, show prompt
    if (activeSection && hasUnsavedChanges) {
      setPendingSwitchTo(section);
      setShowPrompt(true);
      return;
    }

    // Otherwise, switch directly
    setActiveSection(section);
    setHasUnsavedChanges(false);
  }, [activeSection, hasUnsavedChanges]);

  /**
   * Handle "Save" in the unsaved changes prompt.
   * The parent component should call this after successfully saving.
   * This will switch to the pending section.
   */
  const handlePromptSave = useCallback(() => {
    setActiveSection(pendingSwitchTo);
    setPendingSwitchTo(null);
    setShowPrompt(false);
    setHasUnsavedChanges(false);
  }, [pendingSwitchTo]);

  /**
   * Handle "Discard" in the unsaved changes prompt.
   * Discards current changes and switches to the pending section.
   */
  const handlePromptDiscard = useCallback(() => {
    setActiveSection(pendingSwitchTo);
    setPendingSwitchTo(null);
    setShowPrompt(false);
    setHasUnsavedChanges(false);
  }, [pendingSwitchTo]);

  /**
   * Handle "Cancel" in the unsaved changes prompt.
   * Closes the prompt and stays in the current edit mode.
   */
  const handlePromptCancel = useCallback(() => {
    setPendingSwitchTo(null);
    setShowPrompt(false);
  }, []);

  /**
   * Cancel editing the current section (user clicked Cancel button).
   * Should be called after resetting the form.
   */
  const cancelEdit = useCallback(() => {
    setActiveSection(null);
    setHasUnsavedChanges(false);
  }, []);

  /**
   * Complete editing (after successful save).
   * Exits edit mode for the current section.
   */
  const completeEdit = useCallback(() => {
    setActiveSection(null);
    setHasUnsavedChanges(false);
  }, []);

  /**
   * Check if a specific section is currently in edit mode.
   */
  const isEditing = useCallback((section: SectionType): boolean => {
    return activeSection === section;
  }, [activeSection]);

  return {
    activeSection,
    hasUnsavedChanges,
    showPrompt,
    pendingSwitchTo,
    setHasUnsavedChanges,
    requestEditSection,
    handlePromptSave,
    handlePromptDiscard,
    handlePromptCancel,
    cancelEdit,
    completeEdit,
    isEditing,
  };
};

export default useSectionEdit;
