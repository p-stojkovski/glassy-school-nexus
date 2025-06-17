import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { Mail, Phone, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { Teacher, deleteTeacher } from '../teachersSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import GlassCard from '@/components/common/GlassCard';
import { toast } from 'sonner';

interface TeacherCardProps {
  teacher: Teacher;
  onEdit: () => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onEdit }) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const handleDeleteTeacher = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    // Check if teacher has active classes
    if (teacherToDelete.classIds.length > 0) {
      toast.error('Cannot Delete Teacher', {
        description: `${teacherToDelete.name} is assigned to ${teacherToDelete.classIds.length} class(es). Please reassign or remove these classes first.`,
      });
      setTeacherToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(deleteTeacher(teacherToDelete.id));
      toast.success('Teacher Deleted', {
        description: `${teacherToDelete.name} has been successfully removed.`,
      });
      setTeacherToDelete(null);
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to delete teacher. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {teacher.name}
              </h3>
            </div>
          </div>{' '}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Edit
            </Button>{' '}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              disabled={isDeleting}
              onClick={() => handleDeleteTeacher(teacher)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Teacher Details */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <Mail className="w-4 h-4" />
            <span className="truncate">{teacher.email}</span>
          </div>

          {teacher.phone && (
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Phone className="w-4 h-4" />
              <span>{teacher.phone}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-white/70">
            <BookOpen className="w-4 h-4" />
            <span className="truncate">{teacher.subject}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-white/70">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(teacher.joinDate)}</span>
          </div>
        </div>

        {/* Footer with Class Count */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Active Classes</span>
            <Badge variant="outline" className="text-white/70 border-white/20">
              {teacher.classIds.length}
            </Badge>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!teacherToDelete}
        onOpenChange={() => setTeacherToDelete(null)}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${teacherToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteTeacher}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        customContent={
          teacherToDelete?.classIds.length &&
          teacherToDelete.classIds.length > 0 ? (
            <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300">
                This teacher is assigned to {teacherToDelete.classIds.length}{' '}
                class(es).
              </span>
            </div>
          ) : undefined
        }
      />
    </GlassCard>
  );
};

export default TeacherCard;
