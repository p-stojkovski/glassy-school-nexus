import React from 'react';
import { ChevronDown, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Student } from '@/domains/students/studentsSlice';

interface SingleStudentSelectionTriggerProps {
  selectedStudent: Student | null;
  onOpen: () => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showObligationHint?: boolean;
}

const SingleStudentSelectionTrigger: React.FC<
  SingleStudentSelectionTriggerProps
> = ({
  selectedStudent,
  onOpen,
  onClear,
  placeholder = 'Select a student',
  disabled = false,
  className,
  showObligationHint = false,
}) => {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onOpen}
      disabled={disabled}
      className={cn(
        'w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/30 hover:text-white',
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1 text-left">
        <User className="w-4 h-4 text-white/60" />{' '}
        {selectedStudent ? (
          <div className="flex-1">
            <span className="font-medium">{selectedStudent.name}</span>
            <span className="text-white/70 text-sm ml-2">
              (ID: {selectedStudent.id})
            </span>
          </div>
        ) : (
          <span className="text-white/70">
            {placeholder}
            {showObligationHint && (
              <span className="text-blue-300 text-sm ml-1">
                (with ongoing obligations)
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {selectedStudent && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-1 text-white/60 hover:text-white hover:bg-white/20"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        <ChevronDown className="w-4 h-4 text-white/60" />
      </div>
    </Button>
  );
};

export default SingleStudentSelectionTrigger;
