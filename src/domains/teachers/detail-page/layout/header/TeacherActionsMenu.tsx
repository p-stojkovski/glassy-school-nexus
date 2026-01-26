import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, MoreVertical, Info, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/dialogs';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { deleteTeacher } from '@/services/teacherApiService';
import { toast } from '@/hooks/use-toast';

interface TeacherActionsMenuProps {
  teacher: Teacher;
  onEdit: () => void;
  onOpenEmploymentSettings?: () => void;
  canDelete: boolean;
  onDeleteSuccess?: () => void;
}

export function TeacherActionsMenu({
  teacher,
  onEdit,
  onOpenEmploymentSettings,
  canDelete,
  onDeleteSuccess,
}: TeacherActionsMenuProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTeacher(teacher.id);
      toast({
        title: 'Teacher deleted',
        description: `${teacher.name} has been deleted successfully.`,
      });
      setShowDeleteDialog(false);
      onDeleteSuccess?.();
      navigate('/teachers');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete teacher. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-1.5"
        >
          {/* Edit Option */}
          <DropdownMenuItem
            onClick={onEdit}
            className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
            <span className="font-medium">Edit Teacher</span>
          </DropdownMenuItem>

          {/* Employment Settings Option */}
          <DropdownMenuItem
            onClick={onOpenEmploymentSettings}
            className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
          >
            <Briefcase className="w-4 h-4" />
            <span className="font-medium">Employment Settings</span>
          </DropdownMenuItem>

          {/* Delete Option */}
          {canDelete ? (
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="gap-2.5 text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Delete Teacher</span>
            </DropdownMenuItem>
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenuItem disabled className="gap-2.5 rounded-lg px-3 py-2.5 text-white/40">
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete Teacher</span>
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  align="center"
                  className="z-[100] bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-xs shadow-2xl rounded-xl p-3"
                  sideOffset={8}
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-400 mb-1">Cannot delete this teacher</p>
                      <p className="text-white/80 text-sm">
                        Reassign their {teacher.classCount} class{teacher.classCount > 1 ? 'es' : ''} first.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(false)}
        intent="danger"
        icon={Trash2}
        title="Delete Teacher"
        description={`Are you sure you want to delete "${teacher.name}"? This action cannot be undone.`}
        confirmText="Delete Teacher"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

export default TeacherActionsMenu;
