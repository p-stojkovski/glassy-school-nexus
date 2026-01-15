import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EmploymentTypeBadgeProps {
  calculationEmploymentType: 'full_time' | 'contract' | null;
  currentEmploymentType: 'full_time' | 'contract';
}

export function EmploymentTypeBadge({
  calculationEmploymentType,
  currentEmploymentType,
}: EmploymentTypeBadgeProps) {
  // No badge if types match or calculation type is NULL
  if (!calculationEmploymentType || calculationEmploymentType === currentEmploymentType) {
    return null;
  }

  const displayType = calculationEmploymentType === 'full_time' ? 'Full Time' : 'Contract';
  const Icon = calculationEmploymentType === 'full_time' ? Briefcase : FileText;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="gap-1.5 bg-orange-500/20 text-orange-300 border-orange-500/30 cursor-help"
          >
            <Icon className="h-3 w-3" />
            {displayType}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900/95 border-white/20 text-white max-w-xs">
          <p className="text-sm">
            This salary was calculated when the teacher was <strong>{displayType}</strong>.
            Current employment type is <strong>{currentEmploymentType === 'full_time' ? 'Full Time' : 'Contract'}</strong>.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
