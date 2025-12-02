import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, AlertCircle, ChevronDown } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LessonActionButtonsProps {
  onCreateLesson: () => void;
  onGenerateLessons: () => void;
  /** @deprecated Use generateDisabled instead. This now only affects Smart Generate. */
  disabled?: boolean;
  /** Disable Smart Generate (e.g., when no schedule is defined) */
  generateDisabled?: boolean;
  /** Tooltip shown when Smart Generate is disabled */
  disabledTooltip?: string;
  hasLessons?: boolean; // When true, show compact dropdown
}

const LessonActionButtons: React.FC<LessonActionButtonsProps> = ({
  onCreateLesson,
  onGenerateLessons,
  disabled = false,
  generateDisabled,
  disabledTooltip,
  hasLessons = false,
}) => {
  // Smart Generate is disabled if either flag is set (backward compatibility)
  const isGenerateDisabled = generateDisabled ?? disabled;

  // Wrapper to conditionally show tooltip for Smart Generate
  const GenerateButtonWithTooltip = ({ children }: { children: React.ReactNode }) => {
    if (!isGenerateDisabled || !disabledTooltip) {
      return <>{children}</>;
    }

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          {children}
        </HoverCardTrigger>
        <HoverCardContent className="w-80 bg-slate-900 border-slate-700">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/80 leading-relaxed">{disabledTooltip}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  // Compact dropdown when lessons exist
  if (hasLessons) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Lesson
            <ChevronDown className="w-3 h-3 ml-1.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900/95 border-white/20">
          {isGenerateDisabled ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <DropdownMenuItem
                  disabled
                  className="text-white/50 cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-purple-400/50" />
                  Smart Generate
                </DropdownMenuItem>
              </HoverCardTrigger>
              {disabledTooltip && (
                <HoverCardContent side="left" className="w-72 bg-slate-900 border-slate-700">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/80">{disabledTooltip}</p>
                  </div>
                </HoverCardContent>
              )}
            </HoverCard>
          ) : (
            <DropdownMenuItem
              onClick={onGenerateLessons}
              className="text-white focus:bg-white/10 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              Smart Generate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onCreateLesson}
            className="text-white focus:bg-white/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2 text-yellow-400" />
            Add Single Lesson
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full buttons when no lessons (initial setup)
  return (
    <div className="flex flex-wrap gap-2">
      <GenerateButtonWithTooltip>
        <Button
          onClick={onGenerateLessons}
          disabled={isGenerateDisabled}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-9"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Smart Generate
        </Button>
      </GenerateButtonWithTooltip>
      <Button
        onClick={onCreateLesson}
        size="sm"
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-9"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Add Lesson
      </Button>
    </div>
  );
};

export default LessonActionButtons;
