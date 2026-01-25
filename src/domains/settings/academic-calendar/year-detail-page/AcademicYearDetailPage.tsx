import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppBreadcrumb } from '@/components/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { buildAcademicYearBreadcrumbs } from './utils/breadcrumbs';
import { AcademicYearPageHeader } from './layout';
import { SemestersTab, TeachingBreaksTab } from './tabs';
import { useAcademicYearPage } from './useAcademicYearPage';
import { useAcademicYearTab } from './hooks';

export const AcademicYearDetailPage: React.FC = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const navigate = useNavigate();

  const {
    academicYear,
    semesters,
    teachingBreaks,
    loading,
    semestersLoading,
    breaksLoading,
    error,
    refetch,
  } = useAcademicYearPage(yearId);

  const { activeTab, setActiveTab } = useAcademicYearTab();

  const handleBackToList = () => {
    navigate('/settings?tab=academic-calendar');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-5">
        <AppBreadcrumb
          items={buildAcademicYearBreadcrumbs({ pageType: 'details' })}
        />
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  // Error state or year not found
  if (error || !academicYear) {
    return (
      <div className="space-y-5">
        <AppBreadcrumb
          items={buildAcademicYearBreadcrumbs({ pageType: 'details' })}
        />
        <GlassCard className="p-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-red-400">
              {error || 'Academic year not found'}
            </div>
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Academic Calendar
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AcademicYearPageHeader yearData={academicYear} onUpdate={refetch} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'semesters' | 'teaching-breaks')}
        className="space-y-6"
      >
        <TabsList className="bg-transparent border-b border-white/[0.08] rounded-none p-0 h-auto gap-1">
          <TabsTrigger
            value="semesters"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Semesters
          </TabsTrigger>
          <TabsTrigger
            value="teaching-breaks"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white/80 data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white/90 rounded-none px-4 py-2 font-medium transition-colors"
          >
            Teaching Breaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semesters">
          <SemestersTab
            yearId={yearId!}
            semesters={semesters}
            loading={semestersLoading}
            onMutation={refetch}
          />
        </TabsContent>

        <TabsContent value="teaching-breaks">
          <TeachingBreaksTab
            yearId={yearId!}
            breaks={teachingBreaks}
            loading={breaksLoading}
            onMutation={refetch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicYearDetailPage;
