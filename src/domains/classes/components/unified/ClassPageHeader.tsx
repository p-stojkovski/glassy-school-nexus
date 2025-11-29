import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, User, MapPin, Users, Home, GraduationCap, Edit2, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { EditClassInfoDialog } from '@/domains/classes/components/dialogs/EditClassInfoDialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAppDispatch } from '@/store/hooks';
import { deleteClass } from '@/domains/classes/classesSlice';
import { toast } from '@/hooks/use-toast';

interface ClassPageHeaderProps {
  classData: ClassBasicInfoResponse | null;
  onBack: () => void;
  onUpdate?: () => void;
}

const ClassPageHeader: React.FC<ClassPageHeaderProps> = ({
  classData,
  onBack,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!classData) {
    return null;
  }

  // Check if delete is allowed (no lessons and no students)
  const hasLessons = classData.lessonSummary?.totalLessons > 0;
  const hasStudents = classData.enrolledCount > 0;
  const canDelete = !hasLessons && !hasStudents;

  // Build the reason why delete is disabled
  const getDeleteDisabledReason = (): string | null => {
    if (canDelete) return null;
    const reasons: string[] = [];
    if (hasLessons) {
      reasons.push(`${classData.lessonSummary.totalLessons} lesson${classData.lessonSummary.totalLessons > 1 ? 's' : ''}`);
    }
    if (hasStudents) {
      reasons.push(`${classData.enrolledCount} student${classData.enrolledCount > 1 ? 's' : ''}`);
    }
    return `Cannot delete: class has ${reasons.join(' and ')}`;
  };

  const handleEditSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      dispatch(deleteClass(classData.id));
      toast({
        title: 'Class Deleted',
        description: `${classData.name} has been successfully deleted.`,
        variant: 'default',
      });
      setShowDeleteDialog(false);
      navigate('/classes');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete class. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-white/40 mx-1" />
              <Link
                to="/classes"
                className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Classes</span>
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-white/40 mx-1" />
              <span className="text-white font-medium truncate max-w-[200px]">
                {classData.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Class Metadata Bar - Always visible */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Class Name */}
            <h1 className="text-xl font-bold text-white truncate">
              {classData.name}
            </h1>
            
            {/* Metadata Items */}
            <div className="flex flex-wrap items-center gap-4 text-sm flex-1">
              {/* Subject */}
              <div className="flex items-center gap-1.5 text-white/70">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{classData.subjectName}</span>
              </div>
              
              {/* Teacher */}
              <div className="flex items-center gap-1.5 text-white/70">
                <User className="w-4 h-4 text-green-400" />
                <span>{classData.teacherName}</span>
              </div>
              
              {/* Classroom */}
              <div className="flex items-center gap-1.5 text-white/70">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{classData.classroomName}</span>
              </div>
              
              {/* Capacity */}
              <div className="flex items-center gap-1.5 text-white/70">
                <Users className="w-4 h-4 text-orange-400" />
                <span>
                  {classData.enrolledCount}/{classData.classroomCapacity}
                  {classData.availableSlots > 0 && (
                    <span className="text-white/50 ml-1">
                      ({classData.availableSlots} available)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              
              {canDelete ? (
                <Button
                  size="sm"
                  onClick={handleDeleteClick}
                  className="gap-2 font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button
                          size="sm"
                          disabled
                          className="gap-2 font-medium bg-white/5 text-white/30 border border-white/10 cursor-not-allowed pointer-events-none"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      className="bg-gray-900 border-white/20 text-white max-w-xs"
                    >
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-400 mb-1">Cannot delete this class</p>
                          <p className="text-white/80 text-sm">
                            {hasLessons && hasStudents ? (
                              <>Remove all {classData.lessonSummary.totalLessons} lesson{classData.lessonSummary.totalLessons > 1 ? 's' : ''} and unenroll all {classData.enrolledCount} student{classData.enrolledCount > 1 ? 's' : ''} first.</>
                            ) : hasLessons ? (
                              <>Remove all {classData.lessonSummary.totalLessons} lesson{classData.lessonSummary.totalLessons > 1 ? 's' : ''} first.</>
                            ) : (
                              <>Unenroll all {classData.enrolledCount} student{classData.enrolledCount > 1 ? 's' : ''} first.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Class Info Dialog */}
      <EditClassInfoDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classData={classData}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class"
        description={`Are you sure you want to delete "${classData.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Class'}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ClassPageHeader;
