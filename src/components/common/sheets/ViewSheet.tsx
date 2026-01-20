/**
 * ViewSheet - Read-only sheet for displaying information
 * Use for detail views or information panels without form actions.
 */

import * as React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SheetHeader as ShadcnSheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { SheetShell, type SheetSize } from './_internal/SheetShell';
import { intentIconStyles, type SheetIntent } from './_internal/sheetIntents';

export interface ViewSheetProps {
  /** Controls sheet open state */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Required size variant (sm | md | lg | xl | 2xl) */
  size: SheetSize;
  /** Optional semantic intent for icon color (default: 'primary') */
  intent?: SheetIntent;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Sheet title */
  title: string;
  /** Optional sheet description */
  description?: string;
  /** Display content */
  children: React.ReactNode;
}

export function ViewSheet({
  open,
  onOpenChange,
  size,
  intent = 'primary',
  icon: Icon,
  title,
  description,
  children,
}: ViewSheetProps) {
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <SheetShell
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      allowClickOutside={true}
    >
      <div className="flex flex-col h-full">
        {/* Header with close button */}
        <ShadcnSheetHeader className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-white text-lg font-semibold">
              {Icon && (
                <Icon className={`h-5 w-5 ${intentIconStyles[intent]}`} />
              )}
              {title}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          {description && (
            <SheetDescription className="text-white/70 mt-2">
              {description}
            </SheetDescription>
          )}
        </ShadcnSheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </div>
    </SheetShell>
  );
}
