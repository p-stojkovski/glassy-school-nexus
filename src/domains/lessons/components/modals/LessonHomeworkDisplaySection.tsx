import React from 'react';
import { BookOpen } from 'lucide-react';
import { useLessonHomeworkDisplay } from '../../hooks/useLessonHomeworkDisplay';

interface LessonHomeworkDisplaySectionProps {
  lessonId: string;
}

const LessonHomeworkDisplaySection: React.FC<LessonHomeworkDisplaySectionProps> = ({ lessonId }) => {
  const { homework, loading } = useLessonHomeworkDisplay(lessonId);

  if (loading) {
    return (
      <div className="p-3 rounded-lg border border-white/5 bg-white/[0.04]">
        <div className="h-4 w-28 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-12 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-white/5 bg-white/[0.04] h-full">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-white">Homework</h3>
      </div>
      {homework?.hasHomework ? (
        <div className="space-y-1">
          {homework.assignedDate && (
            <div className="text-[11px] text-white/60">
              Assigned: {new Date(homework.assignedDate).toLocaleDateString()}
            </div>
          )}
          <p className="text-white/80 whitespace-pre-wrap break-words text-sm leading-relaxed">
            {homework.description || 'No description provided'}
          </p>
        </div>
      ) : (
        <p className="text-white/50 text-xs">No homework assigned.</p>
      )}
    </div>
  );
};

export default LessonHomeworkDisplaySection;
