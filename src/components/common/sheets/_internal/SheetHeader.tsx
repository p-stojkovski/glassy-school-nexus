/**
 * SheetHeader - Internal header component for sheets
 * Displays icon, title, description, and optional unsaved changes indicator.
 */

import { LucideIcon } from 'lucide-react';
import {
  SheetHeader as ShadcnSheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { intentIconStyles, type SheetIntent } from './sheetIntents';

interface SheetHeaderProps {
  intent: SheetIntent;
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Shows unsaved changes indicator */
  hasUnsavedChanges?: boolean;
}

export function SheetHeader({
  intent,
  icon: Icon,
  title,
  description,
  hasUnsavedChanges = false,
}: SheetHeaderProps) {
  return (
    <ShadcnSheetHeader className="px-6 py-4 border-b border-white/10">
      <SheetTitle className="flex items-center gap-3 text-white text-lg font-semibold">
        {Icon && (
          <Icon className={`h-5 w-5 ${intentIconStyles[intent]}`} />
        )}
        {title}
      </SheetTitle>
      {description && (
        <SheetDescription className="text-white/70 mt-2">
          {description}
        </SheetDescription>
      )}
      {hasUnsavedChanges && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span>You have unsaved changes</span>
        </div>
      )}
    </ShadcnSheetHeader>
  );
}
