import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimeSlotSuggestion } from '@/types/api/scheduleSlot';

interface TimeSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: TimeSlotSuggestion[];
  loading: boolean;
  onApply: (suggestion: TimeSlotSuggestion) => void;
}

/**
 * Dialog showing available time slot suggestions.
 * Allows users to select and apply a suggested time slot.
 */
export function TimeSuggestionDialog({
  open,
  onOpenChange,
  suggestions,
  loading,
  onApply,
}: TimeSuggestionDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (open && suggestions.length > 0) {
      setSelectedIndex(0);
    } else if (!open) {
      setSelectedIndex(null);
    }
  }, [open, suggestions.length]);

  const handleClose = () => {
    setSelectedIndex(null);
    onOpenChange(false);
  };

  const handleApply = () => {
    if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      onApply(suggestions[selectedIndex]);
    }
  };

  const selectedSuggestion = selectedIndex !== null ? suggestions[selectedIndex] : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900/95 backdrop-blur-md border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Available Time Slots
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose a time that works for everyone.
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          role="radiogroup"
          aria-label="Available time slots"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-white/60">Loading suggestions...</div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-white/60">No available time slots found</div>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedIndex === index
                    ? 'border-yellow-400 bg-white/5'
                    : 'border-white/10 hover:bg-white/5 hover:border-yellow-400/50'
                }`}
                role="radio"
                aria-checked={selectedIndex === index}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-white/60">
                      {suggestion.dayOfWeek}
                    </div>
                    <div className="mt-1 text-sm font-medium text-white">
                      {suggestion.startTime} - {suggestion.endTime}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 text-xs text-white/60">
            {selectedSuggestion ? (
              <span>
                Selected{' '}
                <span className="font-medium text-white">
                  {selectedSuggestion.dayOfWeek}{' '}
                  {selectedSuggestion.startTime}–
                  {selectedSuggestion.endTime}
                </span>
              </span>
            ) : (
              <span>Select a time slot to apply it.</span>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={selectedIndex === null}
              onClick={handleApply}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm time
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
