import React from 'react';
import { format, differenceInDays, differenceInMonths } from 'date-fns';

interface DateRangeDisplayProps {
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
  showDuration?: boolean;
  className?: string;
}

const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({
  startDate,
  endDate,
  showDuration = false,
  className = '',
}) => {
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const calculateDuration = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const months = differenceInMonths(end, start);
      const days = differenceInDays(end, start) + 1; // +1 to include both start and end dates

      if (months >= 1) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${days} day${days > 1 ? 's' : ''}`;
      }
    } catch {
      return '';
    }
  };

  return (
    <div className={`text-white/90 ${className}`}>
      <span className="font-medium">
        {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
      </span>
      {showDuration && (
        <span className="text-white/60 text-sm ml-2">
          ({calculateDuration()})
        </span>
      )}
    </div>
  );
};

export default DateRangeDisplay;

