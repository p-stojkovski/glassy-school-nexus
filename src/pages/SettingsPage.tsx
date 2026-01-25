import React, { useState } from 'react';
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
import { SubjectSettingsTab } from '@/domains/settings/subjects';
import { DiscountTypeSettingsTab } from '@/domains/settings/discount-types';
import { LessonStatusSettingsTab } from '@/domains/settings/lesson-statuses';
import { AcademicCalendarSettingsTab } from '@/domains/settings/academic-calendar';

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
          <TabsList className="bg-transparent border-b border-white/[0.08] rounded-none p-0 h-auto gap-1">
            <TabsTrigger
              value="classrooms"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Classrooms
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Subjects
            </TabsTrigger>
            <TabsTrigger
              value="academic-calendar"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Academic Calendar
            </TabsTrigger>
            <TabsTrigger
              value="discount-types"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
              Discount Types
            </TabsTrigger>
            <TabsTrigger
              value="lesson-statuses"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
            >
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

