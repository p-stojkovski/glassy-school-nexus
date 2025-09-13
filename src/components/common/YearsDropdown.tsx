import React from 'react';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';

export interface YearsDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
  disabled?: boolean;
  showActiveIndicator?: boolean;
  onLoaded?: (years: AcademicYear[]) => void;
}

const YearsDropdown: React.FC<YearsDropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select Academic Year',
  showIcon = false,
  includeAllOption = false,
  allOptionLabel = 'All Years',
  className = '',
  disabled = false,
  showActiveIndicator = true,
  onLoaded,
}) => {
  const { years, isLoading, error } = useAcademicYears();

  // Sort years with active year first, then by start date descending
  const sortedYears = React.useMemo(
    () => [...years].sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }),
    [years]
  );

  const triggerClasses = `bg-white/5 border-white/10 text-white ${className}`;

  // Notify parent when data is ready (cache or API). Emit once per mount.
  const [emitted, setEmitted] = React.useState(false);
  React.useEffect(() => {
    if (!emitted && years && years.length > 0) {
      onLoaded?.(years);
      setEmitted(true);
    }
  }, [years, emitted, onLoaded]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={triggerClasses}>
        {showIcon && <Calendar className="w-4 h-4 mr-2" />}
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading years...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading years</span>
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
            Failed to load academic years
          </SelectItem>
        ) : (
          sortedYears.map((year) => (
            <SelectItem key={year.id} value={year.id}>
              <div className="flex items-center gap-2">
                <span>{year.name}</span>
                {showActiveIndicator && year.isActive && (
                  <span className="text-green-400 text-xs px-1.5 py-0.5 bg-green-400/20 rounded">
                    Active
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

export default YearsDropdown;

