/**
 * SheetShell - Internal wrapper for sheet components
 * Provides consistent sizing, controlled close behavior, and glass morphism styling.
 */

import * as React from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';

export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface SheetShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required size variant */
  size: SheetSize;
  children: React.ReactNode;
  /** Called before close to check for unsaved changes. Return true to allow close, false to block. */
  onInterceptClose?: () => boolean;
}

const sizeClasses: Record<SheetSize, string> = {
  sm: 'w-full sm:max-w-md',      // 448px
  md: 'w-full sm:max-w-lg',      // 512px
  lg: 'w-full sm:max-w-xl',      // 576px
  xl: 'w-full sm:max-w-2xl',     // 672px
  '2xl': 'w-full sm:max-w-3xl',  // 768px
};

export function SheetShell({
  open,
  onOpenChange,
  size,
  children,
  onInterceptClose,
}: SheetShellProps) {
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    // If closing and we have an intercept handler, check if we should block
    if (!newOpen && onInterceptClose) {
      const allowClose = onInterceptClose();
      if (!allowClose) {
        return; // Block the close
      }
    }
    onOpenChange(newOpen);
  }, [onOpenChange, onInterceptClose]);

  const handleInteractOutside = React.useCallback((e: Event) => {
    // Always prevent click outside from closing the sheet
    e.preventDefault();
  }, []);

  const handleEscapeKeyDown = React.useCallback((e: KeyboardEvent) => {
    // If we have an intercept handler, check before allowing escape close
    if (onInterceptClose) {
      const allowClose = onInterceptClose();
      if (!allowClose) {
        e.preventDefault();
        return;
      }
    }
  }, [onInterceptClose]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        hideCloseButton={true}
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
        className={`${sizeClasses[size]} p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden`}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
