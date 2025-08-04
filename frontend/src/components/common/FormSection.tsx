import React, { useEffect, useState } from 'react';
import { ChevronDown, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hasErrors?: boolean;
  hasData?: boolean;
  className?: string;
}

/**
 * Reusable collapsible form section component with error handling and data indicators
 *
 * @example
 * ```tsx
 * <FormSection
 *   title="Student Information"
 *   defaultOpen={true}
 *   hasErrors={hasStudentErrors}
 *   hasData={hasStudentData}
 * >
 *   {studentFields}
 * </FormSection>
 * ```
 */
const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  hasErrors = false,
  hasData = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-expand sections when they contain validation errors
  useEffect(() => {
    if (hasErrors && !isOpen) {
      setIsOpen(true);
    }
  }, [hasErrors, isOpen]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('space-y-0', className)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-4 text-left transition-all hover:bg-white/5 rounded-lg group">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
            {title}
          </h3>
          {/* Visual indicator for sections with data when collapsed */}
          {!isOpen && hasData && (
            <Circle className="h-2 w-2 fill-yellow-400 text-yellow-400" />
          )}
          {/* Error indicator */}
          {hasErrors && (
            <Circle className="h-2 w-2 fill-red-400 text-red-400" />
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/60 transition-transform duration-200 group-hover:text-white/80',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-4 pb-4 space-y-6">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FormSection;