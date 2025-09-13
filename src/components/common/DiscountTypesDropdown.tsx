import React from 'react';
import { Tag, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDiscountTypes } from '@/hooks/useDiscountTypes';

export interface DiscountTypesDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  includeNoneOption?: boolean;
  noneOptionLabel?: string;
  className?: string;
  disabled?: boolean;
}

const DiscountTypesDropdown: React.FC<DiscountTypesDropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select Discount Type',
  showIcon = false,
  includeNoneOption = false,
  noneOptionLabel = 'No Discount',
  className = '',
  disabled = false,
}) => {
  const { discountTypes, isLoading, error } = useDiscountTypes();

  // Sort discount types by sortOrder
  const sortedDiscountTypes = React.useMemo(
    () => [...discountTypes].sort((a, b) => a.sortOrder - b.sortOrder),
    [discountTypes]
  );

  const triggerClasses = `bg-white/5 border-white/10 text-white ${className}`;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={triggerClasses}>
        {showIcon && <Tag className="w-4 h-4 mr-2" />}
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading discount types...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading discount types</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {includeNoneOption && (
          <SelectItem value="">{noneOptionLabel}</SelectItem>
        )}
        {error ? (
          <SelectItem value="__error__" disabled>
            Failed to load discount types
          </SelectItem>
        ) : (
          sortedDiscountTypes.map((discountType) => (
            <SelectItem key={discountType.id} value={discountType.id.toString()}>
              {discountType.name}
              {discountType.description && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({discountType.description})
                </span>
              )}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default DiscountTypesDropdown;

