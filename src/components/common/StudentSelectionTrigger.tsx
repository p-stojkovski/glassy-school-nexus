import React, { useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  // Filter selected students efficiently
  const selectedStudents = React.useMemo(() => {
    return students.filter((student) =>
      selectedStudentIds.includes(student.id)
    );
  }, [students, selectedStudentIds]);

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
              {selectedStudents.length === 0
                ? placeholder
                : `${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''} selected`}
            </span>
          </div>
          <Plus className="w-4 h-4 text-white/70" />
        </div>
      </Button>

      {/* Selected Students Preview */}
      {selectedStudents.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {selectedStudents.slice(0, 6).map((student) => (
              <Badge
                key={student.id}
                variant="secondary"
                className="bg-blue-500/20 text-white border border-blue-400/30 text-xs px-2 py-1"
              >
                {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email}
              </Badge>
            ))}
            {selectedStudents.length > 6 && (
              <Badge
                variant="outline"
                className="text-white/70 border-white/30 text-xs px-2 py-1"
              >
                +{selectedStudents.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSelectionTrigger;
