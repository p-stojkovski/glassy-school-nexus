import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Calendar, 
  ArrowLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { classApiService } from '@/services/classApiService';
import { ClassResponse } from '@/types/api/class';
import { LessonSummary } from '@/types/api/lesson';
import { useLessonsForClass } from '@/domains/lessons/hooks/useLessons';
import ClassOverviewTab from '@/domains/classes/components/detail/ClassOverviewTab';
import ClassLessonsTab from '@/domains/classes/components/detail/ClassLessonsTab';
type ClassDetailTab = 'overview' | 'lessons';

const ClassDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ClassDetailTab>('overview');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { summary: lessonSummary } = useLessonsForClass(id || '');

  useEffect(() => {
    const loadClassData = async () => {
      if (!id) {
        setError('Class ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await classApiService.getClassById(id);
        setClassData(data);
        
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [id]);

  // Navigation handlers
  const handleBack = () => navigate('/classes');
  
  const handleViewLessons = () => {
    setActiveTab('lessons');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="text-white/80">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Class</h2>
          <p className="text-white/60 mb-6">{error || 'Class not found'}</p>
          <Button onClick={handleBack} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            Return to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Class Details
          </h1>
          <p className="text-white/70">
            {classData.name}
          </p>
        </div>
      </div>


      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ClassDetailTab)}>
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-white/20 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Lessons
            {lessonSummary?.totalLessons && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-white text-xs"
              >
                {lessonSummary.totalLessons}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ClassOverviewTab
            classData={classData}
            lessonSummary={lessonSummary}
            onViewLessons={handleViewLessons}
          />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <ClassLessonsTab
            classData={classData}
          />
        </TabsContent>



      </Tabs>
    </div>
  );
};

export default ClassDetail;
