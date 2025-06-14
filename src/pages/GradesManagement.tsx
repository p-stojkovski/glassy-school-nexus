import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { setSelectedClass } from '@/domains/grades/gradesSlice';
import GradesHeader from '@/domains/grades/components/GradesHeader';
import GradesFilters from '@/domains/grades/components/GradesFilters';
import CreateAssessment from '@/domains/grades/components/CreateAssessment';
import GradeEntry from '@/domains/grades/components/GradeEntry';
import Gradebook from '@/domains/grades/components/Gradebook';
import DemoModeNotification from '@/domains/grades/components/DemoModeNotification';

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
