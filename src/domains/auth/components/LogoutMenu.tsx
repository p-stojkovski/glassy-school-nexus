import React, { useState } from 'react';
import { LogOut, Monitor, Smartphone, ChevronDown, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync, selectLogoutLoading } from '../authSlice';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface LogoutMenuProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
  /**
   * Whether the menu is in a collapsed state (e.g., collapsed sidebar)
   * Affects the trigger button display
   */
  collapsed?: boolean;
  /**
   * Size variant of the trigger button
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Callback fired when logout process starts
   */
  onLogoutStart?: () => void;
  /**
   * Callback fired when logout process completes successfully
   */
  onLogoutComplete?: () => void;
}

/**
 * Glass morphism dropdown menu component for logout options
 * Provides immediate logout without confirmation for streamlined UX
 * 
 * Features:
 * - Two logout options: current device only or all devices
 * - Immediate logout execution without confirmation popup
 * - Loading states during logout operations
 * - Responsive design for collapsed/expanded states
 * - Glass morphism styling consistent with project patterns
 * - Full accessibility support with keyboard navigation
 * - Integration with Redux auth state
 * - Toast notifications for logout feedback
 * 
 * @example
 * ```tsx
 * // Basic usage in sidebar
 * <LogoutMenu />
 * 
 * // Collapsed state (e.g., in minimized sidebar)
 * <LogoutMenu collapsed size="sm" />
 * 
 * // With callbacks for custom handling
 * <LogoutMenu
 *   onLogoutStart={() => console.log('Logout started')}
 *   onLogoutComplete={() => navigate('/login')}
 * />
 * ```
 */
const LogoutMenu: React.FC<LogoutMenuProps> = ({
  className,
  collapsed = false,
  size = 'default',
  onLogoutStart,
  onLogoutComplete,
}) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectLogoutLoading);
  
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoutOptionSelect = async (type: 'current' | 'all') => {
    try {
      setIsOpen(false); // Close the dropdown
      onLogoutStart?.();
      
      // Pass the logout type to determine single device vs all devices logout
      const logoutFromAllDevices = type === 'all';
      await dispatch(logoutAsync(logoutFromAllDevices)).unwrap();
      
      toast({
        title: 'Logged out successfully',
        description: type === 'all' 
          ? 'You have been logged out from all devices'
          : 'You have been logged out from this device',
        variant: 'default',
      });
      
      onLogoutComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      toast({
        title: 'Logout failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            disabled={isLoading}
            className={cn(
              // Base glass morphism styles
              'bg-white/5 border border-white/10 backdrop-blur-sm',
              'hover:bg-white/10 hover:border-white/20',
              'focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-orange-400/50',
              'transition-all duration-200',
              'text-white/70 hover:text-white',
              'shadow-lg hover:shadow-xl',
              // Disabled state
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Size-specific styles
              size === 'sm' && 'h-8 px-2',
              size === 'lg' && 'h-12 px-4',
              // Collapsed state - just icon
              collapsed ? 'justify-center' : 'justify-between',
              className
            )}
            aria-label={collapsed ? 'Open logout menu' : undefined}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {!collapsed && <span className="ml-2">Logging out...</span>}
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <LogOut className="w-4 h-4" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )} />
                )}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={collapsed ? 'center' : 'end'}
          sideOffset={8}
          className={cn(
            // Glass morphism styling for dropdown
            'bg-white/10 backdrop-blur-md border border-white/20',
            'shadow-xl rounded-lg',
            'min-w-[220px]',
            // Animation and transitions
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
        >
          <DropdownMenuLabel className="text-white/90 font-medium px-3 py-2">
            Logout Options
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-white/20" />
          
          <DropdownMenuItem
            onClick={() => handleLogoutOptionSelect('current')}
            disabled={isLoading}
            className={cn(
              'text-white/70 hover:text-white hover:bg-white/10',
              'focus:bg-white/10 focus:text-white',
              'cursor-pointer transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'px-3 py-2'
            )}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="p-1.5 rounded-md bg-blue-500/20">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">This device only</div>
                <div className="text-xs text-white/50">
                  Stay logged in on other devices
                </div>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleLogoutOptionSelect('all')}
            disabled={isLoading}
            className={cn(
              'text-white/70 hover:text-white hover:bg-white/10',
              'focus:bg-white/10 focus:text-white',
              'cursor-pointer transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'px-3 py-2'
            )}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="p-1.5 rounded-md bg-red-500/20">
                <Smartphone className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">All devices</div>
                <div className="text-xs text-white/50">
                  Log out everywhere for security
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LogoutMenu;

