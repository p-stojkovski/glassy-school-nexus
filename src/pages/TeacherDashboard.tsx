import React, { useState, useEffect } from 'react';
import TeacherClassSelector from '@/components/teacher-dashboard/TeacherClassSelector';
import TeacherDashboardMain from '@/components/teacher-dashboard/TeacherDashboardMain';
import { useTeacherClassSelection } from '@/components/teacher-dashboard/hooks/useTeacherClassSelection';

const TeacherDashboard: React.FC = () => {
  const selection = useTeacherClassSelection();
  const { hasValidSelection, selectedTeacher, selectedClass } = selection;
  const [showDashboard, setShowDashboard] = useState(false);

  // Update showDashboard when we have valid selections
  useEffect(() => {
    setShowDashboard(hasValidSelection());
  }, [hasValidSelection, selectedTeacher, selectedClass]);

  // Handle selection completion from the selector
  const handleSelectionComplete = () => {
    // The selection state is shared; simply re-check validity
    setShowDashboard(hasValidSelection());
  };

  // Show selection screen if no valid selection exists
  if (!showDashboard) {
    return <TeacherClassSelector selection={selection} onSelectionComplete={handleSelectionComplete} />;
  }

  // Show the actual dashboard with the selected teacher and class
  return (
    <TeacherDashboardMain 
      teacher={selectedTeacher!}
      classItem={selectedClass!}
      onChangeSelection={() => {
        selection.clearSelection();
        setShowDashboard(false);
      }}
    />
  );
};

export default TeacherDashboard;
