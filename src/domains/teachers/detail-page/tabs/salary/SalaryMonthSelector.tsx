import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SalaryMonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SalaryMonthSelector({ year, month, onChange }: SalaryMonthSelectorProps) {
  const handlePrevious = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  const currentDate = new Date();
  const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;
  const isFutureMonth = 
    year > currentDate.getFullYear() || 
    (year === currentDate.getFullYear() && month > currentDate.getMonth() + 1);

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="text-white hover:bg-white/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1 text-center">
        <h3 className="text-2xl font-semibold text-white">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        {isCurrentMonth && (
          <p className="text-sm text-white/60 mt-1">Current Month</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={isFutureMonth}
        className="text-white hover:bg-white/10 disabled:opacity-40"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
