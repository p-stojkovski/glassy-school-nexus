import React from 'react';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubjects } from '@/hooks/useSubjects';

export interface SubjectsDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
  disabled?: boolean;
}

const SubjectsDropdown: React.FC<SubjectsDropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select Subject',
  showIcon = false,
  includeAllOption = false,
  allOptionLabel = 'All Subjects',
  className = '',
  disabled = false,
}) => {
  const { subjects, isLoading, error } = useSubjects();

  // Sort subjects by sortOrder
  const sortedSubjects = React.useMemo(
    () => [...subjects].sort((a, b) => a.sortOrder - b.sortOrder),
    [subjects]
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
            <span>Loading subjects...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading subjects</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">{allOptionLabel}</SelectItem>
        )}
        {error ? (
          <SelectItem value="__error__" disabled>
            Failed to load subjects
          </SelectItem>
        ) : (
          sortedSubjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default SubjectsDropdown;

