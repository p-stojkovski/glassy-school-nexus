import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface AttendanceHeaderProps {
  activeTab: 'mark' | 'history';
  onTabChange: (tab: 'mark' | 'history') => void;
}

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Attendance Management</h1>
        <p className="text-white/70">Track and manage student attendance records</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'mark' | 'history')}>
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger 
            value="mark" 
            className={`data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 ${activeTab === 'mark' ? 'bg-white/20 text-white' : ''}`}
          >
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className={`data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 ${activeTab === 'history' ? 'bg-white/20 text-white' : ''}`}
          >
            Attendance History
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default AttendanceHeader;
