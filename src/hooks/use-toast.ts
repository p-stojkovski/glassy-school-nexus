import { toast as sonnerToast } from "sonner";
import React from "react";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode | (() => void);
  actionLabel?: string;
  cancel?: React.ReactNode | (() => void);
  cancelLabel?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
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
    icon 
  } = props;
  
  // Create the action component if both action function and label are provided
  const actionComponent = action && actionLabel ? {
    label: actionLabel,
    onClick: typeof action === 'function' ? action : undefined,
  } : action;
  
  // Create the cancel component if both cancel function and label are provided
  const cancelComponent = cancel && cancelLabel ? {
    label: cancelLabel,
    onClick: typeof cancel === 'function' ? cancel : undefined,
  } : cancel;
  
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
    case "destructive":
      return sonnerToast.error(title as string, options);
    case "success":
      return sonnerToast.success(title as string, options);
    case "warning":
      return sonnerToast.warning(title as string, options);
    case "info":
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

export { useToast, toast }
