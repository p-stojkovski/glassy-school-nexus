import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TeacherSalaryPreview } from '@/domains/teachers/_shared/types/salaryCalculation.types';
import SalaryPreviewCard from '../SalaryPreviewCard';

interface SalaryPreviewCollapsibleProps {
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  preview: TeacherSalaryPreview | null;
  loading: boolean;
  error: string | null;
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRetry: () => void;
}

export function SalaryPreviewCollapsible({
  isExpanded,
  onExpandedChange,
  preview,
  loading,
  error,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onRetry,
}: SalaryPreviewCollapsibleProps) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onExpandedChange}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium"
        >
          <ChevronDown
            className={`h-4 w-4 mr-2 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          {isExpanded ? 'Hide' : 'Show'} Salary Preview
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <SalaryPreviewCard
          preview={preview}
          loading={loading}
          error={error}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onRetry={onRetry}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
