import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';

interface AcademicYearSelectorProps {
  selectedYear: AcademicYear | null;
  years: AcademicYear[];
  onYearChange: (yearId: string) => void;
  isBetweenYears?: boolean;
  betweenYearsMessage?: string | null;
  isLoading?: boolean;
}

const AcademicYearSelector: React.FC<AcademicYearSelectorProps> = ({
  selectedYear,
  years,
  onYearChange,
  isBetweenYears = false,
  betweenYearsMessage = null,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-white/70 text-sm">
        Loading years...
      </div>
    );
  }

  if (!selectedYear || years.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-1.5 h-auto rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors"
          >
            <span className="font-medium">{selectedYear.name}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {years.map((year) => (
            <DropdownMenuItem
              key={year.id}
              onClick={() => onYearChange(year.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{year.name}</span>
              {year.isActive && (
                <Badge variant="default" className="ml-2 text-xs">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isBetweenYears && betweenYearsMessage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{betweenYearsMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default AcademicYearSelector;
