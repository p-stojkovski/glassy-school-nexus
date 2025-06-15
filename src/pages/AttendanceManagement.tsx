import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '../store';
import { setSelectedDate } from '@/domains/attendance/attendanceSlice';
import AttendanceHeader from '@/domains/attendance/components/AttendanceHeader';
import AttendanceFilters from '@/domains/attendance/components/AttendanceFilters';
import DemoModeNotification from '@/domains/attendance/components/DemoModeNotification';
import AttendanceMarker from '@/domains/attendance/components/AttendanceMarker';
import AttendanceHistory from '@/domains/attendance/components/AttendanceHistory';

const AttendanceManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate } = useAppSelector((state: RootState) => state.attendance);
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');  const [selectedClassId, setSelectedClassId] = useState<string>('all-classes');
  
  // Set today's date on component mount if not already set
  useEffect(() => {
    if (!selectedDate) {
      dispatch(setSelectedDate(new Date().toISOString().split('T')[0]));
    }
  }, [dispatch, selectedDate]);
  
  // Handle class change
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
  };
  
  return (
    <div className="space-y-6">
      <DemoModeNotification />
      
      <AttendanceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
        <AttendanceFilters
        selectedDate={selectedDate}
        onDateChange={(date) => dispatch(setSelectedDate(date))}
        selectedClassId={selectedClassId}
        onClassChange={handleClassChange}
      />
      
      <div className="space-y-4">
        {activeTab === 'mark' ? (
          <AttendanceMarker
            classId={selectedClassId}
            date={selectedDate}
          />
        ) : (
          <AttendanceHistory 
            classId={selectedClassId}
            date={selectedDate}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
