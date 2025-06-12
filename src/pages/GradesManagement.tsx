import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { setSelectedClass } from '@/store/slices/gradesSlice';
// Import the components using @/ path
import GradesHeader from '@/components/grades/GradesHeader';
import GradesFilters from '@/components/grades/GradesFilters';
import CreateAssessment from '@/components/grades/CreateAssessment';
import GradeEntry from '@/components/grades/GradeEntry';
import Gradebook from '@/components/grades/Gradebook';
import DemoModeNotification from '@/components/grades/DemoModeNotification';

type ActiveTab = 'create' | 'grades' | 'gradebook';

const GradesManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const { selectedClassId } = useAppSelector((state: RootState) => state.grades);
    return (
    <div className="space-y-6">
      <DemoModeNotification />
      
      <GradesHeader 
        activeTab={activeTab}
        onTabChange={(tab: ActiveTab) => setActiveTab(tab)}
      />
      
      <GradesFilters
        selectedClassId={selectedClassId || ''}
        onClassChange={(classId) => dispatch(setSelectedClass(classId === 'all-classes' ? null : classId))}
      />
      
      {activeTab === 'create' && (
        <CreateAssessment classId={selectedClassId || ''} />
      )}
      
      {activeTab === 'grades' && (
        <GradeEntry classId={selectedClassId || ''} />
      )}
      
      {activeTab === 'gradebook' && (
        <Gradebook classId={selectedClassId || ''} />
      )}
    </div>
  );
};

export default GradesManagement;
