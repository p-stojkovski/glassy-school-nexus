import React, { useState } from 'react';
import { LessonResponse } from '@/types/api/lesson';
import HomeworkSidebar from './sidebar/HomeworkSidebar';
import LessonStudentPanel from './student-management/LessonStudentPanel';
import './styles/LessonHomeworkLayout.css';

type HomeworkTab = 'check' | 'assign';

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
  const [homeworkActiveTab, setHomeworkActiveTab] = useState<HomeworkTab>('check');

  return (
    <div className="lesson-homework-layout w-full max-w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_400px] 2xl:gap-6 w-full">
        {/* Left Panel - Student Management */}
        <div className="lesson-student-panel order-2 2xl:order-1 min-h-0 w-full min-w-0">
          <LessonStudentPanel 
            lesson={lesson}
            currentTime={currentTime}
            onEndLesson={onEndLesson}
            isLoading={isLoading}
          />
        </div>

        {/* Right Panel - Homework Sidebar */}
        <div className="homework-sidebar order-1 2xl:order-2 2xl:sticky 2xl:top-4 2xl:self-start w-full 2xl:w-auto">
          <div className="2xl:h-[calc(100vh-8rem)] 2xl:overflow-hidden">
            <HomeworkSidebar
              lesson={lesson}
              activeTab={homeworkActiveTab}
              onTabChange={setHomeworkActiveTab}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonWithHomeworkSidebar;