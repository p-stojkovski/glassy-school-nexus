/**
 * DialogHeader - Internal header component for dialogs
 * Displays icon, title, and optional description.
 */

import { LucideIcon } from 'lucide-react';
import {
  DialogHeader as ShadcnDialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { intentIconStyles, type DialogIntent } from './dialogIntents';

interface DialogHeaderProps {
  intent: DialogIntent;
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function DialogHeader({
  intent,
  icon: Icon,
  title,
  description,
}: DialogHeaderProps) {
  return (
    <ShadcnDialogHeader>
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className={`h-6 w-6 ${intentIconStyles[intent]}`} />
        )}
        <DialogTitle>{title}</DialogTitle>
      </div>
      {description && (
        <DialogDescription className="text-gray-300">
          {description}
        </DialogDescription>
      )}
    </ShadcnDialogHeader>
  );
}
