import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getClassForStudent, getClassDisplayName } from '@/utils/studentClassUtils';

interface ClassNameCellProps {
  studentId: string;
  classes: any[];
  students?: any[];
  onNavigate?: (classId: string) => void;
  loading?: boolean;
}

const ClassNameCell: React.FC<ClassNameCellProps> = ({
  studentId,
  classes,
  students,
  onNavigate,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="h-3 w-16 bg-white/10" />
      </div>
    );
  }

  const studentClass = getClassForStudent(studentId, classes, students);

  if (!studentClass) {
    return (
      <div className="flex items-center gap-2 text-white/50">
        <BookOpen className="w-4 h-4" />
        <Badge variant="outline" className="border-white/20 text-white/60">
          No Class
        </Badge>
      </div>
    );
  }

  const displayName = getClassDisplayName(studentClass);
  const canNavigate = !!onNavigate;

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-white/60" />
        {canNavigate ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent hover:text-blue-300 text-left justify-start"
            onClick={() => onNavigate(studentClass.id)}
          >
            <span className="text-white/90 hover:underline">
              {studentClass.name}
            </span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        ) : (
          <span className="text-white/90 font-medium">
            {studentClass.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        {studentClass.level && (
          <Badge
            variant="secondary"
            className="text-xs bg-white/10 text-white/80 border-white/20"
          >
            {studentClass.level}
          </Badge>
        )}
        {studentClass.subject && (
          <span className="text-xs text-white/60">
            {studentClass.subject}
          </span>
        )}
      </div>
    </div>
  );
};

export default ClassNameCell;
