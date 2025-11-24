import React from 'react';
import { LessonResponse } from '@/types/api/lesson';
import LessonStudentPanel from './student-management/LessonStudentPanel';

interface LessonWithHomeworkSidebarProps {
  lesson: LessonResponse;
  currentTime: string;
  onEndLesson: () => void;
  isLoading?: boolean;
}

const LessonWithHomeworkSidebar: React.FC<LessonWithHomeworkSidebarProps> = ({
  lesson,
  currentTime,
  onEndLesson,
  isLoading = false
}) => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <LessonStudentPanel 
        lesson={lesson}
        currentTime={currentTime}
        onEndLesson={onEndLesson}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LessonWithHomeworkSidebar;
