import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { UpdateTeacherRequest } from '@/types/api/teacher';
import teacherApiService from '@/services/teacherApiService';
import { TeacherPersonalInfoFormData, TeacherBioFormData } from '@/utils/validation/teacherValidators';
import { useSectionEdit, SectionType } from './hooks/useSectionEdit';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  PersonalInfoSection,
  BioSection,
  UnsavedChangesDialog,
} from './sections';

// Section identifiers for deep linking
export type TeacherDetailSection = 'personal-info' | 'bio';

interface TeacherDetailsTabProps {
  teacher: Teacher;
  onUpdate: (updatedTeacher: Teacher) => void;
  focusSection?: TeacherDetailSection | null;
  onFocusSectionHandled?: () => void;
}

/**
 * Map from TeacherDetailSection to SectionType
 */
const sectionTypeMap: Record<TeacherDetailSection, SectionType> = {
  'personal-info': 'personal',
  'bio': 'bio',
};

/**
 * Map from SectionType to display name
 */
const sectionNameMap: Record<SectionType, string> = {
  personal: 'Teacher Information',
  bio: 'About',
};

type SectionSaveHandle = {
  save: () => Promise<boolean>;
};

type NavigationTransition = {
  retry: () => void;
};

type NavigatorWithBlock = {
  block?: (blocker: (tx: NavigationTransition) => void) => () => void;
};

/**
 * TeacherDetailsTab - Main editable details component for teacher profile
 *
 * Uses section-based editing: each section (Teacher Info, About)
 * has its own Edit button and can be edited independently. Only one section can be
 * in edit mode at a time.
 */
const TeacherDetailsTab: React.FC<TeacherDetailsTabProps> = ({
  teacher,
  onUpdate,
  focusSection,
  onFocusSectionHandled,
}) => {
  // Section refs for scrolling
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  // Section refs for imperative save (used by unsaved-changes prompt)
  const personalInfoSectionRef = useRef<SectionSaveHandle | null>(null);
  const bioSectionRef = useRef<SectionSaveHandle | null>(null);

  // Section editing state
  const {
    activeSection,
    hasUnsavedChanges,
    showPrompt,
    setHasUnsavedChanges,
    requestEditSection,
    handlePromptSave: onPromptSave,
    handlePromptDiscard: onPromptDiscard,
    handlePromptCancel,
    cancelEdit,
    completeEdit,
    isEditing,
  } = useSectionEdit();

  const [isSavingDuringPrompt, setIsSavingDuringPrompt] = useState(false);
  const [promptSourceSection, setPromptSourceSection] = useState<SectionType | null>(null);

  // Section expanded state
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(true);

  // Router navigation warning dialog (in-app route changes)
  const { dialogState, showConfirmation, closeDialog, handleConfirm } = useConfirmationDialog();
  const navigationContext = useContext(UNSAFE_NavigationContext);
  const navigator = navigationContext?.navigator as unknown as NavigatorWithBlock;

  // Warn before browser refresh/close if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Block in-app route navigation when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (!navigator?.block) return;

    const unblock = navigator.block((tx: NavigationTransition) => {
      showConfirmation({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes that will be lost if you leave this page.',
        confirmText: 'Leave Without Saving',
        cancelText: 'Stay',
        variant: 'warning',
        showSaveOption: false,
        onConfirm: () => {
          unblock();
          tx.retry();
        },
      });
    });

    return unblock;
  }, [hasUnsavedChanges, navigator, showConfirmation]);

  // Handle focus section (deep linking)
  useEffect(() => {
    if (focusSection) {
      const refMap: Record<TeacherDetailSection, React.RefObject<HTMLDivElement>> = {
        'personal-info': personalInfoRef,
        'bio': bioRef,
      };

      const ref = refMap[focusSection];
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Auto-enter edit mode for the focused section
        const sectionType = sectionTypeMap[focusSection];
        requestEditSection(sectionType);
      }

      onFocusSectionHandled?.();
    }
  }, [focusSection, onFocusSectionHandled, requestEditSection]);

  useEffect(() => {
    if (showPrompt) {
      setPromptSourceSection(activeSection);
    } else {
      setPromptSourceSection(null);
    }
  }, [showPrompt, activeSection]);

  /**
   * Generic save handler that merges section data with existing teacher data
   */
  const createSaveHandler = useCallback(
    <T extends TeacherPersonalInfoFormData | TeacherBioFormData>(
      section: SectionType
    ) => {
      return async (sectionData: T): Promise<boolean> => {
        try {
          // Merge section data with current teacher data
          const request: UpdateTeacherRequest = {
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || undefined,
            subjectId: teacher.subjectId,
            notes: teacher.notes || undefined,
            // Override with section-specific data
            ...sectionData,
          };

          const updatedTeacher = await teacherApiService.updateTeacher(teacher.id, request);
          onUpdate(updatedTeacher);
          completeEdit();
          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
          console.error(`Save error for ${section}:`, errorMessage);
          return false;
        }
      };
    },
    [teacher, onUpdate, completeEdit]
  );

  // Section-specific save handlers
  const handleSavePersonal = useCallback(
    (data: TeacherPersonalInfoFormData) => createSaveHandler<TeacherPersonalInfoFormData>('personal')(data),
    [createSaveHandler]
  );

  const handleSaveBio = useCallback(
    (data: TeacherBioFormData) => createSaveHandler<TeacherBioFormData>('bio')(data),
    [createSaveHandler]
  );

  // Handle cancel for each section
  const handleCancelSection = useCallback(() => {
    cancelEdit();
  }, [cancelEdit]);

  // Handle unsaved changes prompt - Save
  const handlePromptSave = useCallback(async () => {
    const getActiveHandle = (): SectionSaveHandle | null => {
      switch (activeSection) {
        case 'personal':
          return personalInfoSectionRef.current;
        case 'bio':
          return bioSectionRef.current;
        default:
          return null;
      }
    };

    const handle = getActiveHandle();
    if (!handle) {
      onPromptSave();
      return;
    }

    setIsSavingDuringPrompt(true);
    const success = await handle.save();
    setIsSavingDuringPrompt(false);
    if (success) {
      onPromptSave();
    }
  }, [activeSection, onPromptSave]);

  // Handle unsaved changes prompt - Discard
  const handlePromptDiscard = useCallback(() => {
    onPromptDiscard();
  }, [onPromptDiscard]);

  return (
    <>
      {/* Sections Grid - 2 column layout: Personal on left, Bio on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column: Teacher Information */}
        <div ref={personalInfoRef} className="flex flex-col">
          <PersonalInfoSection
            ref={personalInfoSectionRef}
            teacher={teacher}
            isEditing={isEditing('personal')}
            onEdit={() => requestEditSection('personal')}
            onSave={handleSavePersonal}
            onCancel={handleCancelSection}
            onFormChange={setHasUnsavedChanges}
            isExpanded={personalExpanded}
            onExpandedChange={setPersonalExpanded}
          />
        </div>

        {/* Right Column: About/Bio */}
        <div ref={bioRef} className="flex flex-col">
          <BioSection
            ref={bioSectionRef}
            teacher={teacher}
            isEditing={isEditing('bio')}
            onEdit={() => requestEditSection('bio')}
            onSave={handleSaveBio}
            onCancel={handleCancelSection}
            onFormChange={setHasUnsavedChanges}
            isExpanded={bioExpanded}
            onExpandedChange={setBioExpanded}
          />
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showPrompt}
        sectionName={promptSourceSection ? sectionNameMap[promptSourceSection] : ''}
        onSave={handlePromptSave}
        onDiscard={handlePromptDiscard}
        onCancel={handlePromptCancel}
        isSaving={isSavingDuringPrompt}
      />

      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        showSaveOption={false}
      />
    </>
  );
};

export default TeacherDetailsTab;
