import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSemesters } from '@/hooks/useSemesters';
import { Semester } from '@/domains/settings/types/academicCalendarTypes';

export interface SemestersDropdownProps {
  academicYearId: string | null | undefined;
  value: string;
  onValueChange: (semesterId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showDateRangeInfo?: boolean;
  onLoaded?: (semesters: Semester[]) => void;
  onError?: (message: string) => void;
}

const SemestersDropdown: React.FC<SemestersDropdownProps> = ({
  academicYearId,
  value,
  onValueChange,
  placeholder = 'Select semester',
  className = '',
  disabled = false,
  showDateRangeInfo = false,
  onLoaded,
  onError,
}) => {
  const { semesters, isLoading, error } = useSemesters(academicYearId);

  // Sort by semesterNumber asc; fallback to startDate asc
  const sorted = React.useMemo(() => {
    const copy = [...semesters];
    copy.sort((a, b) => {
      const aNum = a.semesterNumber;
      const bNum = b.semesterNumber;
      if (typeof aNum === 'number' && typeof bNum === 'number') {
        return aNum - bNum;
      }
      const aStart = new Date(a.startDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      return aStart - bStart;
    });
    return copy;
  }, [semesters]);

  const triggerClasses = `bg-white/5 border-white/10 text-white ${className}`;

  // Emit onLoaded once per academicYearId when data is available (from cache or API)
  const lastEmittedYearRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (academicYearId && sorted.length > 0) {
      if (lastEmittedYearRef.current !== academicYearId) {
        onLoaded?.(sorted);
        lastEmittedYearRef.current = academicYearId;
      }
    }
  }, [academicYearId, sorted, onLoaded]);

  // Notify on error changes
  React.useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const isSelectDisabled = disabled || isLoading || !academicYearId;

  // Date formatter for optional range info
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString.split('T')[0] + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isSelectDisabled}>
      <SelectTrigger className={triggerClasses}>
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading semesters...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading semesters</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <SelectItem value="__error__" disabled>
            Failed to load semesters
          </SelectItem>
        ) : sorted.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            No semesters available
          </SelectItem>
        ) : (
          sorted.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex items-center gap-2">
                <span>{s.name}</span>
                {showDateRangeInfo && (
                  <span className="text-xs text-white/60">({formatDate(s.startDate)} to {formatDate(s.endDate)})</span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default SemestersDropdown;