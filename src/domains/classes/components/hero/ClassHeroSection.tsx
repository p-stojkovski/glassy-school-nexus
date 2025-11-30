import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  PlayCircle, 
  BookOpen, 
  CalendarPlus,
  Clock,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClassBasicInfoResponse, ClassResponse } from '@/types/api/class';
import { UseClassLessonContextResult, ClassLessonState } from '@/domains/classes/hooks/useClassLessonContext';
import { cn } from '@/lib/utils';

interface ClassHeroSectionProps {
  classData: ClassBasicInfoResponse | ClassResponse;
  lessonContext: UseClassLessonContextResult;
  onNavigateToSchedule?: () => void;
}

/**
 * Compact lesson action bar for ClassPage
 * Shows lesson status, progress, and primary CTA
 */
const ClassHeroSection: React.FC<ClassHeroSectionProps> = ({
  classData,
  lessonContext,
  onNavigateToSchedule
}) => {
  const navigate = useNavigate();
  const { currentLesson, nextLesson, lessonState, isLoading } = lessonContext;

  // Calculate progress percentage
  const { lessonSummary } = classData;
  const totalLessons = lessonSummary?.totalLessons || 0;
  const conductedLessons = lessonSummary?.conductedLessons || 0;
  const completionPercentage = totalLessons > 0 
    ? Math.round((conductedLessons / totalLessons) * 100) 
    : 0;

  // Get CTA configuration based on lesson state
  const getCTAConfig = (): {
    label: string;
    icon: React.ReactNode;
    className: string;
    action: () => void;
    disabled: boolean;
  } => {
    if (isLoading) {
      return {
        label: 'Loading...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        className: 'bg-white/10 text-white/60 cursor-wait',
        action: () => {},
        disabled: true
      };
    }

    switch (lessonState) {
      case 'active':
        return {
          label: 'Continue Lesson',
          icon: <PlayCircle className="w-4 h-4" />,
          className: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:text-emerald-200',
          action: () => {
            if (currentLesson) {
              navigate(`/classes/${classData.id}/teach/${currentLesson.id}`);
            }
          },
          disabled: !currentLesson
        };
      
      case 'upcoming_today':
        return {
          label: 'Start Lesson',
          icon: <Play className="w-4 h-4" />,
          className: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200',
          action: () => {
            if (nextLesson) {
              navigate(`/classes/${classData.id}/teach/${nextLesson.id}`);
            }
          },
          disabled: !nextLesson
        };
      
      case 'upcoming_future':
        return {
          label: 'View Schedule',
          icon: <Calendar className="w-4 h-4" />,
          className: 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200',
          action: () => onNavigateToSchedule?.(),
          disabled: false
        };
      
      case 'completed':
        return {
          label: 'Review Lessons',
          icon: <BookOpen className="w-4 h-4" />,
          className: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200',
          action: () => onNavigateToSchedule?.(),
          disabled: false
        };
      
      case 'none':
      default:
        return {
          label: 'Schedule Lessons',
          icon: <CalendarPlus className="w-4 h-4" />,
          className: 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20',
          action: () => onNavigateToSchedule?.(),
          disabled: false
        };
    }
  };

  const ctaConfig = getCTAConfig();
  const lesson = currentLesson || nextLesson;

  // Format lesson time
  const formatLessonTime = () => {
    if (!lesson) return null;
    return `${lesson.startTime} - ${lesson.endTime}`;
  };

  // Get status indicator config
  const getStatusConfig = () => {
    switch (lessonState) {
      case 'active':
        return {
          dot: 'bg-green-500 animate-pulse',
          text: 'In Progress',
          textColor: 'text-green-400'
        };
      case 'upcoming_today':
        return {
          dot: 'bg-blue-500',
          text: 'Today',
          textColor: 'text-blue-400'
        };
      case 'upcoming_future':
        return {
          dot: 'bg-indigo-500',
          text: 'Scheduled',
          textColor: 'text-indigo-400'
        };
      case 'completed':
        return {
          dot: 'bg-purple-500',
          text: 'Complete',
          textColor: 'text-purple-400'
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Left: Progress & Status */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Progress Circle/Badge */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/10"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${completionPercentage * 1.256} 125.6`}
                    strokeLinecap="round"
                    className="text-green-500 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{completionPercentage}%</span>
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="text-sm text-white/60">
                  {conductedLessons} / {totalLessons} lessons
                </div>
                {totalLessons === 0 && (
                  <div className="text-xs text-white/40">No lessons scheduled</div>
                )}
              </div>
            </div>

            {/* Divider */}
            {lesson && <div className="hidden sm:block h-8 w-px bg-white/10" />}

            {/* Current/Next Lesson Info */}
            {lesson && (
              <div className="flex items-center gap-3 min-w-0">
                {statusConfig && (
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', statusConfig.dot)} />
                    <span className={cn('text-xs font-medium uppercase tracking-wide', statusConfig.textColor)}>
                      {statusConfig.text}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium">{formatLessonTime()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={ctaConfig.action}
              disabled={ctaConfig.disabled}
              className={cn(
                'gap-2 font-medium transition-all',
                ctaConfig.className
              )}
            >
              {ctaConfig.icon}
              {ctaConfig.label}
              {!ctaConfig.disabled && (lessonState === 'active' || lessonState === 'upcoming_today') && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHeroSection;

