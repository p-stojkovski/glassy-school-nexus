import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setSelectedDate } from '../store/slices/attendanceSlice';
import AttendanceHeader from '../components/attendance/AttendanceHeader';
import AttendanceFilters from '@/components/attendance/AttendanceFilters';
import DemoModeNotification from '@/components/attendance/DemoModeNotification';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import AttendanceHistory from '@/components/attendance/AttendanceHistory';

const AttendanceManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((state: RootState) => state.attendance);
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
