import React from 'react';
import { User, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeachers } from '@/hooks/useTeachers';

export interface TeachersDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  className?: string;
  disabled?: boolean;
  includeSubjectInfo?: boolean;
}

const TeachersDropdown: React.FC<TeachersDropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select Teacher',
  showIcon = false,
  className = '',
  disabled = false,
  includeSubjectInfo = true,
}) => {
  const { teachers, isLoading, error } = useTeachers();

  // Sort teachers by name
  const sortedTeachers = React.useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name)),
    [teachers]
  );

  const triggerClasses = `bg-white/5 border-white/10 text-white ${className}`;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={triggerClasses}>
        {showIcon && <User className="w-4 h-4 mr-2" />}
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading teachers...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading teachers</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <SelectItem value="__error__" disabled>
            Failed to load teachers
          </SelectItem>
        ) : sortedTeachers.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            No teachers available
          </SelectItem>
        ) : (
          sortedTeachers.map((teacher) => (
            <SelectItem key={teacher.id} value={teacher.id}>
              {teacher.name}
              {includeSubjectInfo && teacher.subjectName && (
                <span className="text-sm text-white/60 ml-2">
                  ({teacher.subjectName})
                </span>
              )}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default TeachersDropdown;

