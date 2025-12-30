import React from 'react';
import { FilterX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterChip {
  /** Unique identifier for the filter */
  key: string;
  /** Display label (e.g., "Status: Active") */
  label: string;
  /** Optional category for grouping (e.g., "status", "subject") */
  category?: string;
}

export interface ActiveFilterChipsProps {
  /** Array of active filter chips to display */
  chips: FilterChip[];
  /** Callback when a chip is removed */
  onRemove: (key: string) => void;
  /** Optional callback to clear all filters */
  onClearAll?: () => void;
  /** Show "Clear All" button */
  showClearAll?: boolean;
  /** Text to show when no filters are active */
  emptyText?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Minimum height for consistent layout (default: 44px) */
  minHeight?: string;
}

/**
 * ActiveFilterChips - Displays active filters as removable chips.
 *
 * Features:
 * - Removable filter chips with click-to-clear
 * - Optional "Clear All" button
 * - Consistent minimum height for layout stability
 * - Customizable empty state text
 *
 * @example
 * const [filters, setFilters] = useState<FilterChip[]>([
 *   { key: 'status', label: 'Status: Active' },
 *   { key: 'year', label: 'Year: 2024' },
 * ]);
 *
 * <ActiveFilterChips
 *   chips={filters}
 *   onRemove={(key) => setFilters(filters.filter(f => f.key !== key))}
 *   onClearAll={() => setFilters([])}
 *   showClearAll={filters.length > 1}
 * />
 */
export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  chips,
  onRemove,
  onClearAll,
  showClearAll = true,
  emptyText = 'No filters applied',
  className,
  minHeight = '44px',
}) => {
  const hasFilters = chips.length > 0;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      style={{ minHeight }}
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-cyan-400/15 border border-cyan-300/30',
            'text-sm text-white',
            'hover:bg-cyan-400/25 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400/40'
          )}
          aria-label={`Remove filter: ${chip.label}`}
        >
          <span>{chip.label}</span>
          <X className="w-3.5 h-3.5" />
        </button>
      ))}

      {!hasFilters && (
        <span className="text-sm text-white/50">{emptyText}</span>
      )}

      {hasFilters && showClearAll && onClearAll && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className={cn(
            'h-9 px-3 gap-1.5',
            'border-white/20 bg-white/5',
            'text-white/70 hover:text-white',
            'hover:bg-white/10 hover:border-white/30'
          )}
        >
          <FilterX className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};

/**
 * Helper function to build filter chips from filter state.
 *
 * @example
 * const chips = buildFilterChips([
 *   { key: 'status', value: 'active', label: 'Active', defaultValue: 'all' },
 *   { key: 'year', value: '2024', label: 'Year: 2024', defaultValue: 'all' },
 * ]);
 */
export interface FilterChipConfig {
  key: string;
  value: string;
  label: string;
  defaultValue: string;
  category?: string;
}

export const buildFilterChips = (configs: FilterChipConfig[]): FilterChip[] => {
  return configs
    .filter((config) => config.value !== config.defaultValue)
    .map((config) => ({
      key: config.key,
      label: config.label,
      category: config.category,
    }));
};

export default ActiveFilterChips;
