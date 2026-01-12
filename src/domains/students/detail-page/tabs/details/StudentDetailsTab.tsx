import React, { useState } from 'react';
import { Student } from '@/domains/students/studentsSlice';
import {
  StudentInfoSection,
  GuardianInfoSection,
  FinancialInfoSection,
} from './sections';

// Section identifiers for deep linking
export type StudentDetailSection = 'student-info' | 'guardian-info' | 'financial-info';

interface StudentDetailsTabProps {
  student: Student;
  onUpdate?: (updatedStudent: Student) => void;
  focusSection?: StudentDetailSection | null;
  onFocusSectionHandled?: () => void;
}

/**
 * StudentDetailsTab - Read-only display of student details
 *
 * Shows three sections: Student Information, Guardian Information, Financial Information
 * Editing is now done via the sidebar (EditStudentSheet) accessed from the header kebab menu.
 */
const StudentDetailsTab: React.FC<StudentDetailsTabProps> = ({
  student,
}) => {
  // Section expanded state
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [guardianExpanded, setGuardianExpanded] = useState(true);
  const [financialExpanded, setFinancialExpanded] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Left Column: Student Information (full height) */}
      <div className="flex flex-col">
        <StudentInfoSection
          student={student}
          readOnly
          isExpanded={personalExpanded}
          onExpandedChange={setPersonalExpanded}
        />
      </div>

      {/* Right Column: Guardian + Financial stacked */}
      <div className="flex flex-col gap-3">
        {/* Guardian Information (top) */}
        <GuardianInfoSection
          student={student}
          readOnly
          isExpanded={guardianExpanded}
          onExpandedChange={setGuardianExpanded}
        />

        {/* Financial Information (below) */}
        <FinancialInfoSection
          student={student}
          readOnly
          isExpanded={financialExpanded}
          onExpandedChange={setFinancialExpanded}
        />
      </div>
    </div>
  );
};

export default StudentDetailsTab;
