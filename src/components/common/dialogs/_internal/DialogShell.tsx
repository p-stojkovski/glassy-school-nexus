/**
 * DialogShell - Internal wrapper for dialog components
 * Provides consistent backdrop, sizing, and transitions.
 */

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export type DialogSize = 'sm' | 'md' | 'lg';

interface DialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: DialogSize;
  children: React.ReactNode;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function DialogShell({
  open,
  onOpenChange,
  size = 'md',
  children,
}: DialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
