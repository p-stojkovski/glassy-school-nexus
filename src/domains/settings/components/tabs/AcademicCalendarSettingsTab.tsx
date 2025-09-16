import React, { useState } from 'react';
import { Calendar, GraduationCap, Coffee, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AcademicYearsManagement from '../academicCalendar/AcademicYearsManagement';
import SemestersManagement from '../academicCalendar/SemestersManagement';
import TeachingBreaksManagement from '../academicCalendar/TeachingBreaksManagement';
// PublicHolidaysManagement removed

type AcademicCalendarTabType = 'academic-years' | 'semesters' | 'teaching-breaks';

const AcademicCalendarSettingsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AcademicCalendarTabType>('academic-years');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-7 h-7" />
          Academic Calendar Management
        </h2>
        <p className="text-white/70">
          Configure academic years, semesters, and teaching breaks to manage your school's calendar
        </p>
      </div>

      {/* Sub-tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AcademicCalendarTabType)}
        className="space-y-6"
      >
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger
            value="academic-years"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger
            value="semesters"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Semesters
          </TabsTrigger>
          <TabsTrigger
            value="teaching-breaks"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Coffee className="w-4 h-4 mr-2" />
            Teaching Breaks
          </TabsTrigger>
          {/* Public Holidays tab removed */}
        </TabsList>

        <TabsContent value="academic-years">
          <AcademicYearsManagement />
        </TabsContent>

        <TabsContent value="semesters">
          <SemestersManagement />
        </TabsContent>

        <TabsContent value="teaching-breaks">
          <TeachingBreaksManagement />
        </TabsContent>

        {/* Public Holidays content removed */}
      </Tabs>
    </div>
  );
};

export default AcademicCalendarSettingsTab;

