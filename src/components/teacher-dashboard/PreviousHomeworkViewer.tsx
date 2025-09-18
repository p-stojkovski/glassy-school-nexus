import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PreviousHomeworkResponse, formatDueDate, getAssignmentTypeColor, isAssignmentOverdue } from '@/types/api/homework';
import { LessonResponse } from '@/types/api/lesson';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchHomeworkCompletionSummary, 
  selectCurrentCompletionSummary, 
  selectHomeworkLoadingStates 
} from '@/store/slices/homeworkSlice';

interface PreviousHomeworkViewerProps {
  previousHomework: PreviousHomeworkResponse | null;
  lesson: LessonResponse;
  onViewStudentCompletion?: () => void;
  className?: string;
}

const PreviousHomeworkViewer: React.FC<PreviousHomeworkViewerProps> = ({
  previousHomework,
  lesson,
  onViewStudentCompletion,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const completionSummary = useAppSelector(selectCurrentCompletionSummary);
  const loadingStates = useAppSelector(selectHomeworkLoadingStates);

  // Fetch completion summary when homework is detected
  useEffect(() => {
    if (previousHomework?.hasHomework && previousHomework.previousLessonId) {
      dispatch(fetchHomeworkCompletionSummary(previousHomework.previousLessonId));
    }
  }, [previousHomework?.hasHomework, previousHomework?.previousLessonId, dispatch]);
  // If no previous homework data yet, show loading state
  if (!previousHomework) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-white/10 h-4 w-4"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No previous homework case
  if (!previousHomework.hasHomework) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-4 ${className}`}
      >
        <Card className="bg-gray-500/10 border-gray-500/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Previous Homework</h3>
            <p className="text-white/70 text-center max-w-md">
              There was no homework assigned for the previous lesson in this class.
            </p>
            {previousHomework.previousLessonId && (
              <div className="mt-4 text-sm text-white/60">
                <p>
                  Previous lesson: {previousHomework.previousLessonDate ? 
                    new Date(previousHomework.previousLessonDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    }) : 'Unknown date'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const assignment = previousHomework.assignment!;
  const isOverdue = isAssignmentOverdue(assignment.dueDate);
  const assignmentTypeColor = getAssignmentTypeColor(assignment.assignmentType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Assignment Overview Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300">Previous Homework Assignment</span>
            </div>
            <Badge 
              className={`bg-${assignmentTypeColor}-500/20 text-${assignmentTypeColor}-300 border-${assignmentTypeColor}-500/30`}
            >
              {assignment.assignmentType.charAt(0).toUpperCase() + assignment.assignmentType.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assignment Title */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{assignment.title}</h3>
            {assignment.description && (
              <p className="text-white/80 leading-relaxed">{assignment.description}</p>
            )}
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">Assigned:</span>
                <span className="text-white">
                  {new Date(assignment.assignedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              {assignment.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-white/70">Due:</span>
                  <span className={`${isOverdue ? 'text-red-300' : 'text-white'}`}>
                    {formatDueDate(assignment.dueDate)}
                  </span>
                  {isOverdue && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">From:</span>
                <span className="text-white">
                  {previousHomework.previousLessonDate ? 
                    new Date(previousHomework.previousLessonDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) + ' lesson' : 'Previous lesson'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-medium text-white/90 mb-2">Instructions:</h4>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {assignment.instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Completion Status Card */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-green-300">Student Completion Status</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewStudentCompletion}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Student completion statistics */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              {loadingStates.fetchingCompletionSummary ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-white/70">Loading completion statistics...</p>
                </div>
              ) : completionSummary ? (
                <div>
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-medium">Complete</span>
                      <span className="text-white bg-green-500/20 px-2 py-1 rounded text-sm">
                        {completionSummary.completionStats.complete}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Partial</span>
                      <span className="text-white bg-yellow-500/20 px-2 py-1 rounded text-sm">
                        {completionSummary.completionStats.partial}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300 font-medium">Missing</span>
                      <span className="text-white bg-red-500/20 px-2 py-1 rounded text-sm">
                        {completionSummary.completionStats.missing}
                      </span>
                    </div>
                    {completionSummary.completionStats.notChecked > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300 font-medium">Not Checked</span>
                        <span className="text-white bg-gray-500/20 px-2 py-1 rounded text-sm">
                          {completionSummary.completionStats.notChecked}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-white/70 text-center">
                    <p className="mb-2">
                      <strong>Overall completion:</strong> {completionSummary.completionRate}% 
                      ({completionSummary.completionStats.complete + completionSummary.completionStats.partial} of {completionSummary.totalStudents} students)
                    </p>
                    <p className="text-xs text-white/60">
                      {completionSummary.fullCompletionRate}% fully completed • 
                      Click "View Details" for individual student status
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-medium">Complete</span>
                      <span className="text-white bg-green-500/20 px-2 py-1 rounded text-sm">--</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Partial</span>
                      <span className="text-white bg-yellow-500/20 px-2 py-1 rounded text-sm">--</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300 font-medium">Missing</span>
                      <span className="text-white bg-red-500/20 px-2 py-1 rounded text-sm">--</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/70">
                    <p className="text-xs text-white/60">
                      Completion data not available. Click "View Details" to see student status.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewStudentCompletion}
                className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30 hover:border-blue-500/50"
              >
                Check Individual Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment History Context */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300">Assignment Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/80 space-y-2">
            <p>
              <strong>Assignment ID:</strong> <code className="bg-white/10 px-1 py-0.5 rounded text-xs">{assignment.id}</code>
            </p>
            <p>
              <strong>Created:</strong> {new Date(assignment.createdAt).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
            {previousHomework.previousLessonId && (
              <p>
                <strong>Previous Lesson ID:</strong>{' '}
                <code className="bg-white/10 px-1 py-0.5 rounded text-xs">
                  {previousHomework.previousLessonId}
                </code>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PreviousHomeworkViewer;