import React from 'react';
import { Package, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const MATERIALS_PLACEHOLDER = 'Attach resources, slide decks, or helpful links';

interface ReadOnlyMaterialsProps {
  materials: string[] | null;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export const ReadOnlyMaterials: React.FC<ReadOnlyMaterialsProps> = ({
  materials,
  isExpanded = true,
  onExpandedChange,
  className,
}) => {
  const hasMaterials = Array.isArray(materials) && materials.length > 0;

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
          <Package className="h-5 w-5 text-white/60" />
          <div className="flex flex-col text-left">
            <span className="font-medium">Materials</span>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="flex-1 flex flex-col">
        <div className="px-4 pb-4 flex-1 flex flex-col">
          {hasMaterials ? (
            <div className="flex flex-wrap gap-2">
              {materials.map((material, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm"
                >
                  {material}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm leading-relaxed">{MATERIALS_PLACEHOLDER}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ReadOnlyMaterials;
