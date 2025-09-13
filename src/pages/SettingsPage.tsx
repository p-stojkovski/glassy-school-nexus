import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, BookOpen, Tag, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';
import ClassroomSettingsTab from '@/domains/settings/components/tabs/ClassroomSettingsTab';
import SubjectSettingsTab from '@/domains/settings/components/tabs/SubjectSettingsTab';
import DiscountTypeSettingsTab from '@/domains/settings/components/tabs/DiscountTypeSettingsTab';
import LessonStatusSettingsTab from '@/domains/settings/components/tabs/LessonStatusSettingsTab';
import AcademicCalendarSettingsTab from '@/domains/settings/components/tabs/AcademicCalendarSettingsTab';

type SettingsTabType = 'classrooms' | 'subjects' | 'academic-calendar' | 'discount-types' | 'lesson-statuses';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('classrooms');

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList className="text-white/70">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">
                Settings
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Tabbed Content */}
      <div className="w-full">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SettingsTabType)}
          className="space-y-6"
        >
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger
              value="classrooms"
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Building className="w-4 h-4 mr-2" />
              Classrooms
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="data-[state=active]:bg-white/20 text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Subjects
            </TabsTrigger>
            <TabsTrigger
              value="academic-calendar"
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Academic Calendar
            </TabsTrigger>
            <TabsTrigger
              value="discount-types"
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Tag className="w-4 h-4 mr-2" />
              Discount Types
            </TabsTrigger>
            <TabsTrigger
              value="lesson-statuses"
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Lesson Statuses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classrooms">
            <ClassroomSettingsTab />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectSettingsTab />
          </TabsContent>

          <TabsContent value="academic-calendar">
            <AcademicCalendarSettingsTab />
          </TabsContent>

          <TabsContent value="discount-types">
            <DiscountTypeSettingsTab />
          </TabsContent>

          <TabsContent value="lesson-statuses">
            <LessonStatusSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;

