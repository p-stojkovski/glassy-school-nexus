import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NativeDateInputProps {
  value?: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const NativeDateInput: React.FC<NativeDateInputProps> = ({
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
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-white text-sm font-medium mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <Calendar className="w-4 h-4 text-yellow-400" />
        </div>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full px-3 py-2 pl-10 rounded-lg text-left",
            "bg-white/10 border border-white/20 text-white text-sm",
            "hover:bg-white/15 hover:border-yellow-400/50",
            "focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400",
            "transition-all duration-200 h-10",
            "placeholder:text-white/60",
            // Style the date picker icon
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert",
            "[&::-webkit-calendar-picker-indicator]:opacity-60",
            "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
            error && "border-red-400 focus:ring-red-400/50",
            disabled && "opacity-50 cursor-not-allowed hover:bg-white/10 hover:border-white/20",
            className
          )}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default NativeDateInput;