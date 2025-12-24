import React from 'react';
import { ListChecks, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const LEARNING_OBJECTIVES_PLACEHOLDER = 'Clarify 2-3 goals to guide instruction and communication';

interface ReadOnlyLearningObjectivesProps {
  objectives: string[] | null;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export const ReadOnlyLearningObjectives: React.FC<ReadOnlyLearningObjectivesProps> = ({
  objectives,
  isExpanded = true,
  onExpandedChange,
  className,
}) => {
  const hasObjectives = Array.isArray(objectives) && objectives.length > 0;

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
          <ListChecks className="h-5 w-5 text-white/60" />
          <div className="flex flex-col text-left">
            <span className="font-medium">Learning Objectives</span>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="flex-1 flex flex-col">
        <div className="px-4 pb-4 flex-1 flex flex-col">
          {hasObjectives ? (
            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3">
                  <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  <span className="text-sm text-white/90">{objective}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60 leading-relaxed">{LEARNING_OBJECTIVES_PLACEHOLDER}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ReadOnlyLearningObjectives;
