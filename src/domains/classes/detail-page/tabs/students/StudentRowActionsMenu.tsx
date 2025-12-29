import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ArrowRightLeft, Trash2 } from 'lucide-react';

interface StudentRowActionsMenuProps {
  studentId: string;
  studentName: string;
  hasAttendance: boolean;
  onTransfer?: (studentId: string, studentName: string) => void;
  onRemove?: (studentId: string, studentName: string, hasAttendance: boolean) => void;
}

/**
 * Dropdown menu for student row actions (Transfer, Remove).
 * Replaces individual icon buttons with a single menu.
 */
const StudentRowActionsMenu: React.FC<StudentRowActionsMenuProps> = ({
  studentId,
  studentName,
  hasAttendance,
  onTransfer,
  onRemove,
}) => {
  const canRemove = !hasAttendance;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/10"
          aria-label="Student actions"
        >
          <MoreVertical className="h-4 w-4 text-white/70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onTransfer && (
          <DropdownMenuItem
            onClick={() => onTransfer(studentId, studentName)}
            className="cursor-pointer"
          >
            <ArrowRightLeft className="mr-2 h-4 w-4 text-blue-400" />
            Transfer to another class
          </DropdownMenuItem>
        )}
        {onRemove && (
          <DropdownMenuItem
            onClick={() => canRemove && onRemove(studentId, studentName, hasAttendance)}
            disabled={!canRemove}
            className={canRemove ? 'cursor-pointer text-red-400' : 'opacity-50 cursor-not-allowed'}
            title={!canRemove ? 'Cannot remove student with lesson attendance' : 'Remove student from class'}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from class
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default React.memo(StudentRowActionsMenu);
