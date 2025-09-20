import React, { useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
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

interface CompactPreviousHomeworkViewerProps {
  previousHomework: PreviousHomeworkResponse | null;
  lesson: LessonResponse;
  onViewStudentCompletion?: () => void;
  className?: string;
}

const CompactPreviousHomeworkViewer: React.FC<CompactPreviousHomeworkViewerProps> = ({
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

  // Loading state
  if (!previousHomework) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse flex space-x-3">
          <div className="rounded-full bg-white/10 h-4 w-4"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // No previous homework case
  if (!previousHomework.hasHomework) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Card className="bg-gray-500/10 border-gray-500/30">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">No Previous Homework</h3>
            <p className="text-xs text-white/70">
              No homework was assigned for the previous lesson.
            </p>
            {previousHomework.previousLessonDate && (
              <div className="mt-2 text-xs text-white/60">
                <p>
                  Previous lesson: {new Date(previousHomework.previousLessonDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignment = previousHomework.assignment!;
  const isOverdue = isAssignmentOverdue(assignment.dueDate);
  const assignmentTypeColor = getAssignmentTypeColor(assignment.assignmentType);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Assignment Overview */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader className="p-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300">Previous Assignment</span>
            </div>
            <Badge className={`bg-${assignmentTypeColor}-500/20 text-${assignmentTypeColor}-300 border-${assignmentTypeColor}-500/30 text-xs`}>
              {assignment.assignmentType.charAt(0).toUpperCase() + assignment.assignmentType.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* Assignment Title */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">{assignment.title}</h3>
            {assignment.description && (
              <p className="text-xs text-white/80 line-clamp-2">{assignment.description}</p>
            )}
          </div>

          {/* Assignment Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span className="text-white/70">Assigned:</span>
              <span className="text-white">
                {new Date(assignment.assignedDate).toLocaleDateString('en-US', {
                  month: 'short', 
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {assignment.dueDate && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-blue-400" />
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

            <div className="flex items-center gap-2 text-xs">
              <Info className="w-3 h-3 text-blue-400" />
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

          {/* Instructions */}
          {assignment.instructions && (
            <div className="p-2 bg-white/5 rounded border border-white/10">
              <h4 className="text-xs font-medium text-white/90 mb-1">Instructions:</h4>
              <p className="text-xs text-white/80 line-clamp-3">
                {assignment.instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Completion Status */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader className="p-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Completion Status</span>
            </div>
            {onViewStudentCompletion && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewStudentCompletion}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 h-6 px-2 text-xs"
              >
                Details
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="p-2 bg-white/5 rounded border border-white/10">
            {loadingStates.fetchingCompletionSummary ? (
              <div className="text-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-400 mx-auto mb-1" />
                <p className="text-xs text-white/70">Loading stats...</p>
              </div>
            ) : completionSummary ? (
              <div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-300">Complete</span>
                    <span className="text-xs text-white bg-green-500/20 px-1 rounded">
                      {completionSummary.completionStats.complete}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-300">Partial</span>
                    <span className="text-xs text-white bg-yellow-500/20 px-1 rounded">
                      {completionSummary.completionStats.partial}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-300">Missing</span>
                    <span className="text-xs text-white bg-red-500/20 px-1 rounded">
                      {completionSummary.completionStats.missing}
                    </span>
                  </div>
                  {completionSummary.completionStats.notChecked > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-300">Not Checked</span>
                      <span className="text-xs text-white bg-gray-500/20 px-1 rounded">
                        {completionSummary.completionStats.notChecked}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-white/70 text-center">
                  <p>
                    <strong>Overall:</strong> {completionSummary.completionRate}% 
                    ({completionSummary.completionStats.complete + completionSummary.completionStats.partial} of {completionSummary.totalStudents})
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-300">Complete</span>
                    <span className="text-xs text-white bg-green-500/20 px-1 rounded">--</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-300">Missing</span>
                    <span className="text-xs text-white bg-red-500/20 px-1 rounded">--</span>
                  </div>
                </div>
                
                <div className="text-xs text-white/70">
                  <p>Completion data not available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactPreviousHomeworkViewer;