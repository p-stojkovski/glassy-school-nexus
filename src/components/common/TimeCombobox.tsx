import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TimeComboboxProps {
  value?: string;
  onChange: (time: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  intervalMinutes?: number; // Time slot interval (default: 30)
  startHour?: number; // Start of available times (default: 7 = 7:00 AM)
  endHour?: number; // End of available times (default: 21 = 9:00 PM)
  showIcon?: boolean; // Show clock icon (default: true)
}

// Generate time slots at specified intervals
const generateTimeSlots = (
  intervalMinutes: number,
  startHour: number,
  endHour: number
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break; // Don't go past end hour
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

// Convert 24h time to 12h format with AM/PM
const formatTime12h = (time24: string): string => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  
  if (hour === 0) return `12:${minute} AM`;
  if (hour === 12) return `12:${minute} PM`;
  if (hour < 12) return `${hour}:${minute} AM`;
  return `${hour - 12}:${minute} PM`;
};

// Parse various time input formats to 24h format
const parseTimeInput = (input: string): string | null => {
  if (!input) return null;
  
  const cleaned = input.trim().toLowerCase();
  
  // Already in HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [h, m] = cleaned.split(':').map(Number);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }
  
  // Format: "9am", "9 am", "9:30am", "9:30 am"
  const amPmMatch = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (amPmMatch) {
    let hour = parseInt(amPmMatch[1], 10);
    const minute = amPmMatch[2] ? parseInt(amPmMatch[2], 10) : 0;
    const isPm = amPmMatch[3] === 'pm';
    
    if (hour < 1 || hour > 12) return null;
    if (minute < 0 || minute > 59) return null;
    
    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  
  // Just a number: "9" -> "09:00", "14" -> "14:00"
  if (/^\d{1,2}$/.test(cleaned)) {
    const hour = parseInt(cleaned, 10);
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  }
  
  // Format: "930" -> "09:30", "1430" -> "14:30"
  if (/^\d{3,4}$/.test(cleaned)) {
    const padded = cleaned.padStart(4, '0');
    const hour = parseInt(padded.slice(0, 2), 10);
    const minute = parseInt(padded.slice(2), 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }
  
  return null;
};

const TimeCombobox: React.FC<TimeComboboxProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Select time',
  className,
  label,
  required = false,
  error,
  disabled = false,
  intervalMinutes = 30,
  startHour = 7,
  endHour = 21,
  showIcon = true,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Generate all available time slots
  const allTimeSlots = useMemo(
    () => generateTimeSlots(intervalMinutes, startHour, endHour),
    [intervalMinutes, startHour, endHour]
  );
  
  // Filter time slots based on input and min/max constraints
  const filteredSlots = useMemo(() => {
    let slots = allTimeSlots;
    
    // Apply min constraint
    if (min) {
      slots = slots.filter(slot => slot >= min);
    }
    
    // Apply max constraint
    if (max) {
      slots = slots.filter(slot => slot <= max);
    }
    
    // Filter based on input
    if (inputValue) {
      const searchLower = inputValue.toLowerCase();
      slots = slots.filter(slot => {
        const formatted12h = formatTime12h(slot).toLowerCase();
        const formatted24h = slot;
        return (
          formatted12h.includes(searchLower) ||
          formatted24h.includes(searchLower) ||
          slot.replace(':', '').includes(searchLower.replace(':', ''))
        );
      });
    }
    
    return slots;
  }, [allTimeSlots, min, max, inputValue]);
  
  // Display value (convert 24h to 12h for display)
  const displayValue = useMemo(() => {
    if (open && inputValue) return inputValue;
    return value ? formatTime12h(value) : '';
  }, [value, open, inputValue]);
  
  // Handle input change (typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Try to parse and set value immediately if valid
    const parsed = parseTimeInput(newValue);
    if (parsed) {
      // Check constraints
      if (min && parsed < min) return;
      if (max && parsed > max) return;
      onChange(parsed);
    }
  };
  
  // Handle selecting a time from the dropdown
  const handleSelect = (time: string) => {
    onChange(time);
    setInputValue('');
    setOpen(false);
  };
  
  // Handle blur - try to parse whatever was typed
  const handleBlur = () => {
    if (inputValue) {
      const parsed = parseTimeInput(inputValue);
      if (parsed) {
        // Check constraints
        if (min && parsed < min) {
          onChange(min);
        } else if (max && parsed > max) {
          onChange(max);
        } else {
          onChange(parsed);
        }
      }
      setInputValue('');
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSlots.length > 0) {
        handleSelect(filteredSlots[0]);
      } else if (inputValue) {
        handleBlur();
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setInputValue('');
      setOpen(false);
    } else if (e.key === 'ArrowDown' && !open) {
      setOpen(true);
    }
  };
  
  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);
  
  // Reset input value when popover closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
    }
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-white text-sm font-medium mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div
            className={cn(
              "relative flex items-center w-full px-3 py-2 rounded-lg cursor-pointer",
              "bg-white/10 border border-white/20 text-white text-sm",
              "hover:bg-white/15 hover:border-yellow-400/50",
              "focus-within:ring-2 focus-within:ring-yellow-400/50 focus-within:border-yellow-400",
              "transition-all duration-200 h-10",
              error && "border-orange-400 focus-within:ring-orange-400/50",
              disabled && "opacity-50 cursor-not-allowed hover:bg-white/10 hover:border-white/20",
            )}
          >
            {showIcon && <Clock className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />}
            <input
              ref={inputRef}
              type="text"
              value={open ? inputValue || displayValue : displayValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "flex-1 bg-transparent border-none outline-none text-white text-sm",
                "placeholder:text-white/50",
                disabled && "cursor-not-allowed"
              )}
            />
            <ChevronDown className={cn(
              "w-4 h-4 text-white/60 transition-transform flex-shrink-0",
              open && "rotate-180"
            )} />
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[200px] p-0 bg-gray-900/95 border-white/20 backdrop-blur-xl"
          align="start"
          sideOffset={4}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.2) transparent' 
            }}
          >
            <div className="p-1">
              {filteredSlots.length === 0 ? (
                <div className="py-6 text-center text-white/50 text-sm">
                  No times available
                </div>
              ) : (
                filteredSlots.map((time) => {
                  const isSelected = time === value;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleSelect(time)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm",
                        "transition-colors cursor-pointer",
                        isSelected
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      <span>{formatTime12h(time)}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1 text-sm text-orange-400">{error}</p>
      )}
    </div>
  );
};

export default TimeCombobox;
