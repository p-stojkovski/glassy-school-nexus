import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, BookOpen, Tag } from 'lucide-react';
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

type SettingsTabType = 'classrooms' | 'subjects' | 'discount-types';

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

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-white/70">
              Manage system configuration and master data
            </p>
          </div>
        </div>
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
              value="discount-types"
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Tag className="w-4 h-4 mr-2" />
              Discount Types
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classrooms">
            <ClassroomSettingsTab />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectSettingsTab />
          </TabsContent>

          <TabsContent value="discount-types">
            <DiscountTypeSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
