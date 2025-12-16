import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { User, Users, DollarSign } from 'lucide-react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import { Student } from '@/domains/students/studentsSlice';
import { UpdateStudentRequest } from '@/types/api/student';
import { studentApiService } from '@/services/studentApiService';
import { PersonalInfoFormData } from '@/utils/validation/studentValidators';
import { GuardianInfoFormData } from '@/utils/validation/studentValidators';
import { FinancialInfoFormData } from '@/utils/validation/studentValidators';
import { useSectionEdit, SectionType } from './hooks/useSectionEdit';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  StudentInfoSection,
  GuardianInfoSection,
  FinancialInfoSection,
  UnsavedChangesDialog,
} from './sections';

// Section identifiers for deep linking
export type StudentDetailSection = 'student-info' | 'guardian-info' | 'financial-info';

interface StudentDetailsTabProps {
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
  focusSection?: StudentDetailSection | null;
  onFocusSectionHandled?: () => void;
}

/**
 * Map from StudentDetailSection to SectionType
 */
const sectionTypeMap: Record<StudentDetailSection, SectionType> = {
  'student-info': 'personal',
  'guardian-info': 'guardian',
  'financial-info': 'financial',
};

/**
 * Map from SectionType to display name
 */
const sectionNameMap: Record<SectionType, string> = {
  personal: 'Student Information',
  guardian: 'Parent/Guardian Information',
  financial: 'Financial Information',
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
 * StudentDetailsTab - Main editable details component for student profile
 * 
 * Uses section-based editing: each section (Student Info, Guardian Info, Financial Info)
 * has its own Edit button and can be edited independently. Only one section can be
 * in edit mode at a time.
 */
const StudentDetailsTab: React.FC<StudentDetailsTabProps> = ({
  student,
  onUpdate,
  focusSection,
  onFocusSectionHandled,
}) => {
  // Section refs for scrolling
  const studentInfoRef = useRef<HTMLDivElement>(null);
  const guardianInfoRef = useRef<HTMLDivElement>(null);
  const financialInfoRef = useRef<HTMLDivElement>(null);

  // Section refs for imperative save (used by unsaved-changes prompt)
  const studentInfoSectionRef = useRef<SectionSaveHandle | null>(null);
  const guardianInfoSectionRef = useRef<SectionSaveHandle | null>(null);
  const financialInfoSectionRef = useRef<SectionSaveHandle | null>(null);

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
  const [guardianExpanded, setGuardianExpanded] = useState(true);
  const [financialExpanded, setFinancialExpanded] = useState(true);

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
      const refMap: Record<StudentDetailSection, React.RefObject<HTMLDivElement>> = {
        'student-info': studentInfoRef,
        'guardian-info': guardianInfoRef,
        'financial-info': financialInfoRef,
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
   * Generic save handler that merges section data with existing student data
   */
  const createSaveHandler = useCallback(
    <T extends PersonalInfoFormData | GuardianInfoFormData | FinancialInfoFormData>(
      section: SectionType
    ) => {
      return async (sectionData: T): Promise<boolean> => {
        try {
          // Merge section data with current student data
          const request: UpdateStudentRequest = {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone || undefined,
            dateOfBirth: student.dateOfBirth || undefined,
            enrollmentDate: student.enrollmentDate,
            isActive: student.isActive,
            parentContact: student.parentContact || undefined,
            parentEmail: student.parentEmail || undefined,
            placeOfBirth: student.placeOfBirth || undefined,
            notes: student.notes || undefined,
            hasDiscount: student.hasDiscount,
            discountTypeId: student.hasDiscount ? student.discountTypeId : undefined,
            discountAmount: student.discountAmount || 0,
            // Override with section-specific data
            ...sectionData,
          };

          // Handle discount type clearing when hasDiscount is false
          if ('hasDiscount' in sectionData && !sectionData.hasDiscount) {
            request.discountTypeId = undefined;
            request.discountAmount = 0;
          }

          const updatedStudent = await studentApiService.updateStudent(student.id, request);
          onUpdate(updatedStudent);
          completeEdit();
          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
          console.error(`Save error for ${section}:`, errorMessage);
          return false;
        }
      };
    },
    [student, onUpdate, completeEdit]
  );

  // Section-specific save handlers
  const handleSavePersonal = useCallback(
    (data: PersonalInfoFormData) => createSaveHandler<PersonalInfoFormData>('personal')(data),
    [createSaveHandler]
  );

  const handleSaveGuardian = useCallback(
    (data: GuardianInfoFormData) => createSaveHandler<GuardianInfoFormData>('guardian')(data),
    [createSaveHandler]
  );

  const handleSaveFinancial = useCallback(
    (data: FinancialInfoFormData) => createSaveHandler<FinancialInfoFormData>('financial')(data),
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
          return studentInfoSectionRef.current;
        case 'guardian':
          return guardianInfoSectionRef.current;
        case 'financial':
          return financialInfoSectionRef.current;
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
      {/* Sections Grid - 2 column layout: Student on left, Guardian + Financial on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column: Student Information (full height) */}
        <div ref={studentInfoRef} className="flex flex-col">
          <StudentInfoSection
            ref={studentInfoSectionRef}
            student={student}
            isEditing={isEditing('personal')}
            onEdit={() => requestEditSection('personal')}
            onSave={handleSavePersonal}
            onCancel={handleCancelSection}
            onFormChange={setHasUnsavedChanges}
            isExpanded={personalExpanded}
            onExpandedChange={setPersonalExpanded}
          />
        </div>

        {/* Right Column: Guardian + Financial stacked */}
        <div className="flex flex-col gap-3">
          {/* Guardian Information (top) */}
          <div ref={guardianInfoRef}>
            <GuardianInfoSection
              ref={guardianInfoSectionRef}
              student={student}
              isEditing={isEditing('guardian')}
              onEdit={() => requestEditSection('guardian')}
              onSave={handleSaveGuardian}
              onCancel={handleCancelSection}
              onFormChange={setHasUnsavedChanges}
              isExpanded={guardianExpanded}
              onExpandedChange={setGuardianExpanded}
            />
          </div>

          {/* Financial Information (below) */}
          <div ref={financialInfoRef}>
            <FinancialInfoSection
              ref={financialInfoSectionRef}
              student={student}
              isEditing={isEditing('financial')}
              onEdit={() => requestEditSection('financial')}
              onSave={handleSaveFinancial}
              onCancel={handleCancelSection}
              onFormChange={setHasUnsavedChanges}
              isExpanded={financialExpanded}
              onExpandedChange={setFinancialExpanded}
            />
          </div>
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

export default StudentDetailsTab;
