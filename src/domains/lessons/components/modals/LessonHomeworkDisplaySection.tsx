import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useLessonHomeworkDisplay } from '../../hooks/useLessonHomeworkDisplay';

interface LessonHomeworkDisplaySectionProps {
  lessonId: string;
}

const LessonHomeworkDisplaySection: React.FC<LessonHomeworkDisplaySectionProps> = ({ lessonId }) => {
  const { homework, loading } = useLessonHomeworkDisplay(lessonId);

  if (loading) {
    return (
      <GlassCard className="p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-12 bg-white/10 rounded animate-pulse" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <h3 className="text-sm font-medium text-white">Homework Assignment</h3>
      </div>
      {homework?.hasHomework ? (
        <div className="space-y-1">
          {homework.assignedDate && (
            <div className="text-xs text-white/60">
              Assigned: {new Date(homework.assignedDate).toLocaleDateString()}
            </div>
          )}
          <p className="text-white/80 whitespace-pre-wrap break-words text-sm line-clamp-5">
            {homework.description || 'No description provided'}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
          <AlertCircle className="w-3 h-3 text-white/50 flex-shrink-0" />
          <p className="text-white/50 text-xs">No homework assigned for this lesson</p>
        </div>
      )}
    </GlassCard>
  );
};

export default LessonHomeworkDisplaySection;
