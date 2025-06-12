
import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { Mail, Phone, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { Teacher, deleteTeacher } from '../../store/slices/teachersSlice';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import GlassCard from '../common/GlassCard';
import { toast } from '../ui/use-toast';

interface TeacherCardProps {
  teacher: Teacher;
  onEdit: () => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onEdit }) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Check if teacher has active classes
    if (teacher.classIds.length > 0) {
      toast({
        title: "Cannot Delete Teacher",
        description: `${teacher.name} is assigned to ${teacher.classIds.length} class(es). Please reassign or remove these classes first.`,
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch(deleteTeacher(teacher.id));
      toast({
        title: "Teacher Deleted",
        description: `${teacher.name} has been successfully removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{teacher.name}</h3>
              <Badge 
                variant={teacher.status === 'active' ? 'default' : 'secondary'}
                className={teacher.status === 'active' 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-300 border-gray-500/30'}
              >
                {teacher.status}
              </Badge>
            </div>
          </div>          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Edit
            </Button>            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Teacher</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    Are you sure you want to delete {teacher.name}? This action cannot be undone.
                    {teacher.classIds.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300">
                          This teacher is assigned to {teacher.classIds.length} class(es).
                        </span>
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={teacher.classIds.length > 0 || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
    </GlassCard>
  );
};

export default TeacherCard;
