import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  BookOpen, 
  MapPin, 
  Users,
  ClipboardList,
  StickyNote,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { formatTimeRange } from './utils/timeUtils';

// Import modal components (will be created in next tasks)
import AttendanceModal from './AttendanceModal';
import HomeworkModal from './HomeworkModal';
import QuickNotesModal from './QuickNotesModal';
import EndLessonModal from './EndLessonModal';

interface LessonManagementPanelProps {
  lesson: LessonResponse;
  currentTime: string;
  onEndLesson?: () => void;
  isLoading?: boolean;
}

const LessonManagementPanel: React.FC<LessonManagementPanelProps> = ({
  lesson,
  currentTime,
  onEndLesson,
  isLoading = false
}) => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEndLessonModal, setShowEndLessonModal] = useState(false);

  const timeRange = formatTimeRange(lesson.startTime, lesson.endTime);
  const roomName = lesson.classroomNameSnapshot || lesson.classroomName || 'Classroom TBD';

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-lg border-blue-500/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-3 py-1">
                  🔵 LESSON IN PROGRESS
                </Badge>
              </div>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {lesson.className} - Lesson Management
              </CardTitle>
              <CardDescription className="text-white/80">
                Use the tools below to manage your active lesson
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lesson Info Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-white/60">Time</div>
                <div className="font-medium">{timeRange}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-white/60">Room</div>
                <div className="font-medium">{roomName}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-white/60">Subject</div>
                <div className="font-medium">{lesson.subjectNameSnapshot || lesson.subjectName}</div>
              </div>
            </div>
          </div>

          {/* Management Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Attendance Management */}
            <Card 
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setShowAttendanceModal(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-white font-medium mb-2">ATTENDANCE</div>
                <div className="text-sm text-white/60 mb-3">Mark student presence</div>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-300">
                  <AlertCircle className="w-3 h-3" />
                  Not taken yet
                </div>
              </CardContent>
            </Card>

            {/* Homework Management */}
            <Card 
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setShowHomeworkModal(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-white font-medium mb-2">HOMEWORK</div>
                <div className="text-sm text-white/60 mb-3">Check assignments</div>
                <div className="flex items-center justify-center gap-1 text-xs text-yellow-300">
                  <AlertCircle className="w-3 h-3" />
                  Check needed
                </div>
              </CardContent>
            </Card>

            {/* Lesson Notes */}
            <Card 
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setShowNotesModal(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <StickyNote className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-white font-medium mb-2">LESSON NOTES</div>
                <div className="text-sm text-white/60 mb-3">Add observations</div>
                <div className="flex items-center justify-center gap-1 text-xs text-blue-300">
                  <StickyNote className="w-3 h-3" />
                  Quick notes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            <div className="flex-1">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                disabled={isLoading}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Students
              </Button>
            </div>
            
            <div className="flex-1">
              <Button
                onClick={() => setShowEndLessonModal(true)}
                className="w-full bg-red-600/80 hover:bg-red-700 text-white font-semibold"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                End Lesson
              </Button>
            </div>
            
            <div className="flex-1">
              <Button
                variant="outline"
                className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10"
                disabled={isLoading}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Emergency Contact
              </Button>
            </div>
          </div>

          {/* Active Status Indicator */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 text-blue-300 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Lesson management active - use tools above
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals - Will be implemented in next tasks */}
      <AttendanceModal 
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        lesson={lesson}
      />
      
      <HomeworkModal 
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        lesson={lesson}
      />
      
      <QuickNotesModal 
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        lesson={lesson}
      />
      
      <EndLessonModal 
        isOpen={showEndLessonModal}
        onClose={() => setShowEndLessonModal(false)}
        lesson={lesson}
        onConfirmEnd={onEndLesson}
      />
    </>
  );
};

export default LessonManagementPanel;