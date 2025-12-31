import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, BookOpen, Calendar, Users, Pencil, FileText } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { TeacherProfileHeader, TeacherBasicInfo } from './layout';
import { useTeacherProfile } from './useTeacherProfile';
import { EditTeacherSheet } from './dialogs';
import { TeacherOverview } from './tabs/overview';
import { TeacherDetailsTab } from './tabs/details';
import { TeacherClassesTab } from './tabs/classes';
import { TeacherScheduleTab } from './tabs/schedule';
import { TeacherStudentsTab } from './tabs/students';

const TeacherProfilePage: React.FC = () => {
  const {
    teacher,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    overviewData,
    overviewLoading,
    isEditSheetOpen,
    handleOpenEditSheet,
    handleCloseEditSheet,
    handleEditSuccess,
    handleTeacherUpdate,
    handleBack,
  } = useTeacherProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TeacherProfileHeader onBack={handleBack} />
        <GlassCard className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-white/70">Loading teacher...</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <TeacherProfileHeader onBack={handleBack} />
        <GlassCard className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-400">{error}</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TeacherProfileHeader onBack={handleBack} />
        <Button
          onClick={handleOpenEditSheet}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          variant="outline"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit Teacher
        </Button>
      </div>

      <TeacherBasicInfo teacher={teacher} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TeacherOverview
            overviewData={overviewData}
            overviewLoading={overviewLoading}
            onNavigateToTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="details">
          <TeacherDetailsTab
            teacher={teacher}
            onUpdate={handleTeacherUpdate}
          />
        </TabsContent>

        <TabsContent value="classes">
          <TeacherClassesTab teacherId={teacher.id} />
        </TabsContent>

        <TabsContent value="schedule">
          <GlassCard className="p-6">
            <TeacherScheduleTab teacherId={teacher.id} />
          </GlassCard>
        </TabsContent>

        <TabsContent value="students">
          <GlassCard className="p-6">
            <TeacherStudentsTab teacherId={teacher.id} />
          </GlassCard>
        </TabsContent>
      </Tabs>

      <EditTeacherSheet
        isOpen={isEditSheetOpen}
        onClose={handleCloseEditSheet}
        onSuccess={handleEditSuccess}
        teacher={teacher}
      />
    </div>
  );
};

export default TeacherProfilePage;
