import React from 'react';
import { BookOpen, Loader2, AlertCircle, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClassResponse } from '@/types/api/class';

export interface ClassDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  classes: ClassResponse[];
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  showIcon?: boolean;
  className?: string;
  disabled?: boolean;
  showEnrollmentInfo?: boolean;
}

const ClassDropdown: React.FC<ClassDropdownProps> = ({
  value,
  onValueChange,
  classes,
  isLoading = false,
  error = null,
  placeholder = 'Select Class',
  showIcon = false,
  className = '',
  disabled = false,
  showEnrollmentInfo = true,
}) => {
  // Sort classes by name
  const sortedClasses = React.useMemo(
    () => [...classes].sort((a, b) => a.name.localeCompare(b.name)),
    [classes]
  );

  const triggerClasses = `bg-white/5 border-white/10 text-white ${className}`;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={triggerClasses}>
        {showIcon && <BookOpen className="w-4 h-4 mr-2" />}
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading classes...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading classes</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <SelectItem value="__error__" disabled>
            Failed to load classes
          </SelectItem>
        ) : sortedClasses.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            No classes available for this teacher
          </SelectItem>
        ) : (
          sortedClasses.map((classItem) => (
            <SelectItem key={classItem.id} value={classItem.id}>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-medium">{classItem.name}</span>
                  {showEnrollmentInfo && (
                    <div className="flex items-center ml-2 text-xs text-white/60">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{classItem.enrolledCount}/{classItem.classroomCapacity}</span>
                    </div>
                  )}
                </div>
                {classItem.subjectName && (
                  <span className="text-xs text-white/50 mt-0.5">
                    {classItem.subjectName}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default ClassDropdown;