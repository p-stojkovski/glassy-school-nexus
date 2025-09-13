import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from '@/domains/students/studentsSlice';
import { cn } from '@/lib/utils';

interface StudentSelectionTriggerProps {
  students: Student[];
  selectedStudentIds: string[];
  onOpenPanel: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showCount?: boolean;
}

const StudentSelectionTrigger: React.FC<StudentSelectionTriggerProps> = ({
  students,
  selectedStudentIds,
  onOpenPanel,
  disabled = false,
  placeholder = 'Assign students...',
  className,
  showCount = true,
}) => {
  // We intentionally avoid deriving the count from the students array so the
  // number persists even when students are not yet loaded (e.g., after refresh).
  const selectedCount = selectedStudentIds?.length ?? 0;

  return (
    <div className={cn('space-y-3', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onOpenPanel}
        disabled={disabled}
        className="w-full h-auto min-h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start p-4"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-white/70">
              {selectedCount === 0
                ? placeholder
                : `${selectedCount} student${selectedCount !== 1 ? 's' : ''} selected`}
            </span>
          </div>
          <Plus className="w-4 h-4 text-white/70" />
        </div>
      </Button>
      {/* Name preview removed per requirements: only show numeric count */}
    </div>
  );
};

export default StudentSelectionTrigger;

