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
}

const LessonActionButtons: React.FC<LessonActionButtonsProps> = ({
  onCreateLesson,
  onGenerateLessons,
  disabled = false,
  generateDisabled,
  disabledTooltip,
}) => {
  // Smart Generate is disabled if either flag is set (backward compatibility)
  const isGenerateDisabled = generateDisabled ?? disabled;

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
                Generate from schedule
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
            Generate from schedule
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={onCreateLesson}
          className="text-white focus:bg-white/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2 text-yellow-400" />
          Add Lesson
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LessonActionButtons;
