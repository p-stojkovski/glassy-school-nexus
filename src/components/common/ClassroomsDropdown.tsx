import React from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClassrooms } from '@/hooks/useClassrooms';

export interface ClassroomsDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  className?: string;
  disabled?: boolean;
  includeCapacityInfo?: boolean;
  includeLocationInfo?: boolean;
}

const ClassroomsDropdown: React.FC<ClassroomsDropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select Classroom',
  showIcon = false,
  className = '',
  disabled = false,
  includeCapacityInfo = true,
  includeLocationInfo = false,
}) => {
  const { classrooms, isLoading, error } = useClassrooms();

  // Sort classrooms by name
  const sortedClassrooms = React.useMemo(
    () => [...classrooms].sort((a, b) => a.name.localeCompare(b.name)),
    [classrooms]
  );

  const triggerClasses = `bg-white/5 border-white/10 text-white ${className}`;

  const formatClassroomInfo = (classroom: any) => {
    const infoParts = [];
    
    if (includeLocationInfo && classroom.location) {
      infoParts.push(classroom.location);
    }
    
    if (includeCapacityInfo && classroom.capacity) {
      infoParts.push(`Capacity: ${classroom.capacity}`);
    }
    
    return infoParts.length > 0 ? ` (${infoParts.join(', ')})` : '';
  };

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={triggerClasses}>
        {showIcon && <MapPin className="w-4 h-4 mr-2" />}
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading classrooms...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading classrooms</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <SelectItem value="__error__" disabled>
            Failed to load classrooms
          </SelectItem>
        ) : sortedClassrooms.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            No classrooms available
          </SelectItem>
        ) : (
          sortedClassrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id}>
              {classroom.name}
              {(includeCapacityInfo || includeLocationInfo) && (
                <span className="text-sm text-white/60 ml-2">
                  {formatClassroomInfo(classroom)}
                </span>
              )}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default ClassroomsDropdown;
