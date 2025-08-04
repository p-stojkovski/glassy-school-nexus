import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useUnsavedChangesWarning = (
  hasUnsavedChanges: boolean,
  message: string = 'You have unsaved changes. Are you sure you want to leave?'
) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  const navigateWithWarning = (to: string) => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm(message);
      if (shouldLeave) {
        navigate(to);
      }
    } else {
      navigate(to);
    }
  };

  return { navigateWithWarning };
};