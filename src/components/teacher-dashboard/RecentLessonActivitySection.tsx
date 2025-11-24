import React, { useState } from 'react';
import { 
  ChevronDown, 
  BarChart3, 
  Users, 
  BookCheck, 
  Clock, 
  Calendar,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLoadingState from './states/DashboardLoadingState';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useRecentLessons } from './hooks/useRecentLessons';
import { formatTimeRange } from './utils/timeUtils';
import { LessonStudentResponse } from '@/types/api/lesson-students';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import LessonDetailInline from './LessonDetailInline';

interface RecentLessonActivitySectionProps {
  classId: string;
  className?: string;
}

/**
 * Collapsible Recent Lesson Activity section for the teacher dashboard
 * Implements lazy loading - API calls only triggered when section is expanded
 */
const RecentLessonActivitySection: React.FC<RecentLessonActivitySectionProps> = ({
  classId,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  
  // Accordion state for lesson details
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Record<string, LessonStudentResponse[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [detailErrors, setDetailErrors] = useState<Record<string, string | null>>({});
  
  // Only call the hook if the section has been opened at least once
  const { 
    recentLessons, 
    loading, 
    error,
    refreshRecentLessons 
  } = useRecentLessons(hasBeenOpened ? classId : '');

  // Handle opening - trigger API call on first expansion
  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  // Fetch detailed lesson data (attendance, homework, comments)
  const fetchLessonDetails = async (lessonId: string) => {
    if (lessonDetails[lessonId]) return; // Already cached
    
    setLoadingDetails(prev => ({ ...prev, [lessonId]: true }));
    setDetailErrors(prev => ({ ...prev, [lessonId]: null }));
    
    try {
      const students = await lessonStudentApiService.getLessonStudents(lessonId);
      setLessonDetails(prev => ({ ...prev, [lessonId]: students }));
    } catch (error: any) {
      console.error('Failed to fetch lesson details:', error);
      setDetailErrors(prev => ({ 
        ...prev, 
        [lessonId]: error?.message || 'Failed to load lesson details'
      }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  // Handle lesson expansion toggle
  const handleLessonToggle = (lessonId: string) => {
    if (expandedLessonId === lessonId) {
      // Collapse current lesson
      setExpandedLessonId(null);
    } else {
      // Expand new lesson and collapse previous
      setExpandedLessonId(lessonId);
      fetchLessonDetails(lessonId);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHomeworkColor = (rate: number) => {
    if (rate >= 85) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Render loading state
  const renderLoadingState = () => (
    <DashboardLoadingState
      wrapWithCard={false}
      showHeader={false}
      rows={3}
      className="py-4"
    />
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-white/70 text-sm mb-3">Unable to load recent lessons. Try again.</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshRecentLessons}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-white/70 text-sm">No recent lessons found.</p>
        <p className="text-white/50 text-xs mt-1">Complete some lessons to see activity here.</p>
      </div>
    </div>
  );

  // Render lesson content
  const renderLessonsContent = () => {
    if (!recentLessons || recentLessons.length === 0) {
      return renderEmptyState();
    }

    // Calculate overall stats
    const totalLessons = recentLessons.length;
    const avgAttendanceRate = recentLessons.reduce((sum, lesson) => sum + lesson.attendanceRate, 0) / totalLessons;
    const avgHomeworkRate = recentLessons.reduce((sum, lesson) => sum + lesson.homeworkRate, 0) / totalLessons;

    return (
      <div className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-white/60">Avg Attendance</div>
              <div className={`text-sm font-semibold ${getAttendanceColor(avgAttendanceRate)}`}>
                {avgAttendanceRate.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BookCheck className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-white/60">Avg Homework</div>
              <div className={`text-sm font-semibold ${getHomeworkColor(avgHomeworkRate)}`}>
                {avgHomeworkRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-2">
          {recentLessons.map((lessonSummary) => {
            const isExpanded = expandedLessonId === lessonSummary.lesson.id;
            const isLoadingDetail = loadingDetails[lessonSummary.lesson.id];
            
            return (
              <Collapsible
                key={lessonSummary.lesson.id}
                open={isExpanded}
                onOpenChange={() => handleLessonToggle(lessonSummary.lesson.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer",
                    isExpanded ? "bg-white/10" : "bg-white/5"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Date and Time */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/60">
                            {formatDate(lessonSummary.lesson.scheduledDate)}
                          </span>
                          <span className="text-xs text-white/40">•</span>
                          <Clock className="w-3 h-3 text-white/40" />
                          <span className="text-xs text-white/60">
                            {formatTimeRange(lessonSummary.lesson.startTime, lessonSummary.lesson.endTime)}
                          </span>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-3">
                          {/* Attendance */}
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-white/40" />
                            <span className={`text-xs ${getAttendanceColor(lessonSummary.attendanceRate)}`}>
                              {lessonSummary.attendanceCount}/{lessonSummary.totalStudents}
                            </span>
                          </div>
                          
                          {/* Homework */}
                          <div className="flex items-center gap-1">
                            <BookCheck className="w-3 h-3 text-white/40" />
                            <span className={`text-xs ${getHomeworkColor(lessonSummary.homeworkRate)}`}>
                              {lessonSummary.homeworkCompletedCount}/{lessonSummary.homeworkTotalCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Indicator */}
                      <div className="flex items-center gap-2">
                        {isLoadingDetail && (
                          <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                        )}
                        <ChevronDown className={cn(
                          "w-4 h-4 text-white/40 group-hover:text-white/60 transition-all duration-200 flex-shrink-0",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-3 pb-3">
                    <LessonDetailInline
                      lesson={lessonSummary.lesson}
                      students={lessonDetails[lessonSummary.lesson.id] || []}
                      loading={isLoadingDetail || false}
                      error={detailErrors[lessonSummary.lesson.id] || null}
                      onRetry={() => {
                        // Clear cached error and retry
                        setDetailErrors(prev => ({ ...prev, [lessonSummary.lesson.id]: null }));
                        // Clear cached data to force refetch
                        setLessonDetails(prev => {
                          const { [lessonSummary.lesson.id]: removed, ...rest } = prev;
                          return rest;
                        });
                        fetchLessonDetails(lessonSummary.lesson.id);
                      }}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("bg-white/10 backdrop-blur-lg border-white/20", className)}>
      <Collapsible
        open={isOpen}
        onOpenChange={handleToggle}
      >
        <CollapsibleTrigger className="w-full">
          <CardHeader className="hover:bg-white/5 transition-colors">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">
                    Recent Lesson Activity
                  </h3>
                  <p className="text-white/70 text-sm">
                    5 most recent lessons
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-white/60 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <CardContent className="pt-0">
            {loading ? renderLoadingState() : 
             error ? renderErrorState() : 
             renderLessonsContent()}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RecentLessonActivitySection;
