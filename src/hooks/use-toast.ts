import { toast as sonnerToast } from 'sonner';
import React from 'react';

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode | (() => void);
  actionLabel?: string;
  cancel?: React.ReactNode | (() => void);
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  duration?: number;
  dismissible?: boolean;
  important?: boolean;
  icon?: React.ReactNode;
};

// Enhanced wrapper around Sonner toast to maintain compatibility with existing calls
// while providing more modern features
function toast(props: ToastProps) {
  const {
    title,
    description,
    variant,
    action,
    actionLabel,
    cancel,
    cancelLabel,
    position,
    duration = 5000,
    dismissible = true,
    important = false,
    icon,
  } = props;

  // Only pass action/cancel if they are valid types for Sonner
  let actionComponent:
    | React.ReactNode
    | { label: string; onClick: () => void }
    | undefined = undefined;
  if (action && actionLabel && typeof action === 'function') {
    actionComponent = { label: actionLabel, onClick: action };
  } else if (React.isValidElement(action)) {
    actionComponent = action;
  } else {
    actionComponent = undefined;
  }

  let cancelComponent:
    | React.ReactNode
    | { label: string; onClick: () => void }
    | undefined = undefined;
  if (cancel && cancelLabel && typeof cancel === 'function') {
    cancelComponent = { label: cancelLabel, onClick: cancel };
  } else if (React.isValidElement(cancel)) {
    cancelComponent = cancel;
  } else {
    cancelComponent = undefined;
  }

  const options = {
    description: description as string,
    action: actionComponent,
    cancel: cancelComponent,
    duration,
    dismissible,
    important,
    icon,
    position,
  };

  switch (variant) {
    case 'destructive':
      return sonnerToast.error(title as string, options);
    case 'success':
      return sonnerToast.success(title as string, options);
    case 'warning':
      return sonnerToast.warning(title as string, options);
    case 'info':
      return sonnerToast.info(title as string, options);
    default:
      return sonnerToast(title as string, options);
  }
}

// Keep the same API shape for backwards compatibility
function useToast() {
  return {
    toast,
    toasts: [], // For backward compatibility
  };
}

export { useToast, toast };

