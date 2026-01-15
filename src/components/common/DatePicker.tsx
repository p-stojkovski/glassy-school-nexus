import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse, isValid, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  /** The selected date as ISO string (YYYY-MM-DD) */
  value?: string;
  /** Callback when date changes, receives ISO string (YYYY-MM-DD) */
  onChange: (date: string) => void;
  /** Minimum selectable date as ISO string (YYYY-MM-DD) */
  min?: string;
  /** Maximum selectable date as ISO string (YYYY-MM-DD) */
  max?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether to prevent selecting past dates (uses start of day comparison) */
  disablePastDates?: boolean;
  /** Custom matcher function to disable specific dates (receives Date, returns true to disable) */
  disabledMatcher?: (date: Date) => boolean;
}

/**
 * DatePicker component following UX best practices:
 * - Uses a popover with full calendar for easy date selection
 * - Shows formatted date in a user-friendly format (e.g., "November 28, 2025")
 * - Keyboard accessible
 * - Supports min/max date constraints
 * - Visual feedback for today's date and selected date
 * - Supports disabling past dates
 * - Closes automatically on date selection
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Select a date',
  className,
  label,
  required = false,
  error,
  disabled = false,
  disablePastDates = false,
  disabledMatcher,
}) => {
  const [open, setOpen] = React.useState(false);

  // Parse the value string to a Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const date = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(date) ? date : undefined;
  }, [value]);

  // Parse min/max strings to Date objects
  const minDate = React.useMemo(() => {
    if (!min) return undefined;
    const date = parse(min, 'yyyy-MM-dd', new Date());
    return isValid(date) ? date : undefined;
  }, [min]);

  const maxDate = React.useMemo(() => {
    if (!max) return undefined;
    const date = parse(max, 'yyyy-MM-dd', new Date());
    return isValid(date) ? date : undefined;
  }, [max]);

  // Create disabled date matcher
  const disabledDays = React.useMemo(() => {
    const matchers: Array<Date | { before: Date } | { after: Date } | ((date: Date) => boolean)> = [];

    if (disablePastDates) {
      // Disable dates before today (start of day for accurate comparison)
      matchers.push({ before: startOfDay(new Date()) });
    } else if (minDate) {
      matchers.push({ before: minDate });
    }

    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    // Add custom matcher if provided
    if (disabledMatcher) {
      matchers.push(disabledMatcher);
    }

    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate, disablePastDates, disabledMatcher]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format as ISO string YYYY-MM-DD
      const isoDate = format(date, 'yyyy-MM-dd');
      onChange(isoDate);
      setOpen(false);
    }
  };

  // Format the display value
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return null;
    return format(selectedDate, 'MMMM d, yyyy');
  }, [selectedDate]);

  // Determine the default month to show in calendar
  const defaultMonth = React.useMemo(() => {
    if (selectedDate) return selectedDate;
    if (disablePastDates || minDate) {
      return startOfDay(new Date());
    }
    return new Date();
  }, [selectedDate, disablePastDates, minDate]);

  return (
    <div className="relative">
      {label && (
        <label className="block text-white text-sm font-medium mb-2">
          {label} {required && '*'}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label || 'Select date'}
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-10',
              'bg-white/10 border-white/20 text-white',
              'hover:bg-white/15 hover:border-yellow-400/50',
              'focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400',
              'transition-all duration-200',
              !displayValue && 'text-white/60',
              error && 'border-red-400 focus:ring-red-400/50',
              disabled && 'opacity-50 cursor-not-allowed hover:bg-white/10 hover:border-white/20',
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-yellow-400 shrink-0" />
            <span className="truncate">
              {displayValue || placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-gray-900/95 border-white/20 backdrop-blur-xl" 
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={disabledDays}
            defaultMonth={defaultMonth}
            initialFocus
            // Show today button for quick navigation
            showOutsideDays={true}
            // Fixed number of weeks for consistent UI
            fixedWeeks
          />
          {/* Quick action footer */}
          <div className="border-t border-white/10 p-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              disabled={disablePastDates && isBefore(new Date(), startOfDay(new Date()))}
              className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;
