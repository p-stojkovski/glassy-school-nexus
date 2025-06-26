import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivateLessonHeaderProps {
  onAddLesson: () => void;
}

const PrivateLessonHeader: React.FC<PrivateLessonHeaderProps> = ({
  onAddLesson,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Private Lessons</h1>
        <p className="text-white/70">
          Manage and schedule personalized one-on-one lessons for students
        </p>
      </div>

      <Button
        onClick={onAddLesson}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        Schedule Lesson
      </Button>
    </div>
  );
};

export default PrivateLessonHeader;
