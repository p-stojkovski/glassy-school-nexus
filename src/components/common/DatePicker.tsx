import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string; // yyyy-MM-dd
  onChange: (value?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

// Formats a Date to yyyy-MM-dd without timezone shifts
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  minDate,
  maxDate = new Date(),
  className,
}) => {
  const selected = value ? new Date(value) : undefined;
  const disabledRange = {
    before: minDate,
    after: maxDate,
  } as const;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/15 focus:border-yellow-400 focus:ring-yellow-400',
            !value && 'text-white/60',
            className
          )}
        >
          <span>{value || placeholder}</span>
          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-900/95 border-white/20 calendar-popover" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => onChange(d ? formatDate(d) : undefined)}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          disabled={disabledRange}
          showOutsideDays
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;

