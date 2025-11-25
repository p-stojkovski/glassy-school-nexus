import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface LessonActionButtonsProps {
  onCreateLesson: () => void;
  onGenerateLessons: () => void;
  disabled?: boolean;
}

const LessonActionButtons: React.FC<LessonActionButtonsProps> = ({
  onCreateLesson,
  onGenerateLessons,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onGenerateLessons}
        disabled={disabled}
        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Smart Generate
      </Button>
      <Button
        onClick={onCreateLesson}
        disabled={disabled}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Lesson
      </Button>
    </div>
  );
};

export default LessonActionButtons;
