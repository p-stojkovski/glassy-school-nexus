import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const OVERVIEW_PLACEHOLDER = 'Add a description to help families understand this class';

interface ReadOnlyClassOverviewProps {
  description: string | null;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export const ReadOnlyClassOverview: React.FC<ReadOnlyClassOverviewProps> = ({
  description,
  isExpanded = true,
  onExpandedChange,
  className,
}) => {
  const hasDescription = !!description?.trim();

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onExpandedChange}
      className={cn(
        'rounded-xl border transition-colors bg-white/[0.03] flex flex-col h-full border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <CollapsibleTrigger className="flex items-center gap-2 text-white hover:text-white/80 transition-colors flex-1">
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              !isExpanded && '-rotate-90'
            )}
          />
          <div className="flex flex-col text-left">
            <span className="font-medium">Class Overview</span>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="flex-1 flex flex-col">
        <div className="px-4 pb-4 flex-1 flex flex-col">
          {hasDescription ? (
            <p className="text-sm text-white leading-relaxed">{description}</p>
          ) : (
            <p className="text-sm text-white/60 leading-relaxed">{OVERVIEW_PLACEHOLDER}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ReadOnlyClassOverview;
