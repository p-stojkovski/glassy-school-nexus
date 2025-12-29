import React from 'react';
import { AlertCircle, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CapacityValidationPanelProps {
  selectedCount: number;
  currentEnrolled: number;
  capacity: number;
  availableSlots: number;
}

export function CapacityValidationPanel({
  selectedCount,
  currentEnrolled,
  capacity,
  availableSlots,
}: CapacityValidationPanelProps) {
  const totalAfterAdd = currentEnrolled + selectedCount;
  const exceedsCapacity = totalAfterAdd > capacity;
  const willBeFull = totalAfterAdd === capacity;
  const remainingSlots = capacity - totalAfterAdd;

  return (
    <div
      className={cn(
        'mx-4 p-3 rounded-lg border transition-colors',
        exceedsCapacity
          ? 'bg-red-500/10 border-red-500/30'
          : willBeFull
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-green-500/10 border-green-500/30'
      )}
    >
      <div className="flex items-start gap-2">
        {exceedsCapacity ? (
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        ) : willBeFull ? (
          <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        ) : (
          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium',
              exceedsCapacity
                ? 'text-red-300'
                : willBeFull
                ? 'text-yellow-300'
                : 'text-green-300'
            )}
          >
            {exceedsCapacity &&
              `Exceeds capacity by ${totalAfterAdd - capacity} student${
                totalAfterAdd - capacity !== 1 ? 's' : ''
              }`}
            {willBeFull && 'Class will be at full capacity'}
            {!exceedsCapacity &&
              !willBeFull &&
              `${selectedCount} student${selectedCount !== 1 ? 's' : ''} will fit`}
          </p>
          <p className="text-xs text-white/50 mt-1">
            {currentEnrolled} currently enrolled • {capacity} capacity
            {!exceedsCapacity &&
              remainingSlots > 0 &&
              ` • ${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      </div>
    </div>
  );
}
