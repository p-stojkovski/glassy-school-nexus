import React, { useState } from 'react';
import { LogOut, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync, selectLogoutLoading, selectAuthError } from '../authSlice';
import FormButtons from '@/components/common/FormButtons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutComplete?: () => void;
}

/**
 * Logout confirmation dialog with options for single device or all devices logout
 * Features glass morphism design consistent with project patterns
 * 
 * @example
 * ```tsx
 * const [showLogoutDialog, setShowLogoutDialog] = useState(false);
 * 
 * return (
 *   <>
 *     <Button onClick={() => setShowLogoutDialog(true)}>
 *       Logout
 *     </Button>
 *     
 *     <LogoutConfirmationDialog
 *       isOpen={showLogoutDialog}
 *       onClose={() => setShowLogoutDialog(false)}
 *       onLogoutComplete={() => {
 *         // Optional: Handle post-logout actions
 *         console.log('User logged out successfully');
 *       }}
 *     />
 *   </>
 * );
 * ```
 */
const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onLogoutComplete,
}) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectLogoutLoading);
  const authError = useAppSelector(selectAuthError);
  
  const [logoutType, setLogoutType] = useState<'current' | 'all'>('current');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      
      // Pass the logout type to determine single device vs all devices logout
      const logoutFromAllDevices = logoutType === 'all';
      await dispatch(logoutAsync(logoutFromAllDevices)).unwrap();
      
      toast({
        title: 'Logged out successfully',
        description: logoutType === 'all' 
          ? 'You have been logged out from all devices'
          : 'You have been logged out from this device',
        variant: 'default',
      });
      
      onLogoutComplete?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      toast({
        title: 'Logout failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading && !isProcessing) {
      onClose();
    }
  };

  const isButtonDisabled = isLoading || isProcessing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div 
        className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl"
        role="dialog"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 
              id="logout-dialog-title"
              className="text-lg font-semibold text-orange-300"
            >
              Confirm Logout
            </h3>
          </div>

          {/* Description */}
          <p 
            id="logout-dialog-description"
            className="text-white/70 text-sm mb-6 leading-relaxed"
          >
            Choose how you would like to log out of your account.
          </p>

          {/* Logout Options */}
          <div className="space-y-3 mb-6">
            {/* Current Device Option */}
            <button
              type="button"
              onClick={() => setLogoutType('current')}
              disabled={isButtonDisabled}
              className={cn(
                'w-full p-4 rounded-lg border transition-all duration-200 text-left',
                'hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-400/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                logoutType === 'current'
                  ? 'bg-white/10 border-orange-400/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/70'
              )}
              aria-pressed={logoutType === 'current'}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Logout from this device</div>
                  <div className="text-xs text-white/50 mt-1">
                    You'll remain logged in on other devices
                  </div>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 transition-colors',
                  logoutType === 'current'
                    ? 'border-orange-400 bg-orange-400'
                    : 'border-white/30'
                )}
                >
                  {logoutType === 'current' && (
                    <div className="w-full h-full rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>

            {/* All Devices Option */}
            <button
              type="button"
              onClick={() => setLogoutType('all')}
              disabled={isButtonDisabled}
              className={cn(
                'w-full p-4 rounded-lg border transition-all duration-200 text-left',
                'hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-400/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                logoutType === 'all'
                  ? 'bg-white/10 border-orange-400/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/70'
              )}
              aria-pressed={logoutType === 'all'}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Smartphone className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Logout from all devices</div>
                  <div className="text-xs text-white/50 mt-1">
                    You'll be logged out everywhere and need to sign in again
                  </div>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 transition-colors',
                  logoutType === 'all'
                    ? 'border-orange-400 bg-orange-400'
                    : 'border-white/30'
                )}
                >
                  {logoutType === 'all' && (
                    <div className="w-full h-full rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30">
              <p className="text-red-300 text-sm">{authError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleLogout}
              disabled={isButtonDisabled}
              className={cn(
                'flex-1 font-semibold px-4 py-2 rounded-lg transition-all duration-200',
                'bg-orange-500/20 text-orange-300 border border-orange-400/30',
                'hover:bg-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-400/50',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-describedby={isButtonDisabled ? 'logout-loading' : undefined}
            >
              {isButtonDisabled ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span id="logout-loading">Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
            
            <Button
              onClick={handleCancel}
              disabled={isButtonDisabled}
              variant="outline"
              className={cn(
                'flex-1 text-white/70 hover:text-white hover:bg-white/10',
                'border-white/20 hover:border-white/30',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationDialog;

