import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, X } from 'lucide-react';
import { LessonResponse } from '@/types/api/lesson';
import { LessonStudentResponse, HomeworkCompletionSummaryResponse } from '@/types/api/lesson-students';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import { homeworkApiService } from '@/services/homeworkApiService';
import LessonOverviewSection from './lesson-detail/LessonOverviewSection';
import AttendanceSummarySection from './lesson-detail/AttendanceSummarySection';
import HomeworkSummarySection from './lesson-detail/HomeworkSummarySection';
import LessonNotesSection from './lesson-detail/LessonNotesSection';

interface TeacherLessonDetailModalProps {
  lesson: LessonResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LessonDetailData {
  students: LessonStudentResponse[];
  homeworkSummary: HomeworkCompletionSummaryResponse | null;
}

const TeacherLessonDetailModal: React.FC<TeacherLessonDetailModalProps> = ({
  lesson,
  open,
  onOpenChange
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<LessonDetailData | null>(null);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onOpenChange]);

  // Fetch lesson detail data when modal opens
  useEffect(() => {
    if (!lesson?.id || !open) {
      setDetailData(null);
      setError(null);
      return;
    }

    const fetchLessonDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch attendance and homework data concurrently
        const [students, homeworkSummary] = await Promise.all([
          lessonStudentApiService.getLessonStudents(lesson.id),
          homeworkApiService.getHomeworkCompletionSummary(lesson.id).catch(() => null) // Allow homework to fail gracefully
        ]);

        setDetailData({ students, homeworkSummary });
      } catch (err: any) {
        console.error('Failed to fetch lesson details:', err);
        setError(err.message || 'Failed to load lesson details');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [lesson?.id, open]);

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-4xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <span className="text-xl">Lesson Summary</span>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-400/10">
              Conducted
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-white/70">Loading lesson details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Details</h3>
            <p className="text-white/70 mb-4">{error}</p>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <LessonOverviewSection lesson={lesson} />
            <AttendanceSummarySection students={detailData?.students || []} />
            <HomeworkSummarySection 
              homeworkSummary={detailData?.homeworkSummary} 
              students={detailData?.students || []}
            />
            <LessonNotesSection notes={lesson.notes} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-white/70 hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherLessonDetailModal;
