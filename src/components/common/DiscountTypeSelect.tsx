import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useDiscountTypes } from '@/hooks/useDiscountTypes';

interface DiscountTypeSelectProps {
  value: string; // DiscountType ID as string
  onChange: (id: string) => void;
  placeholder?: string;
  includeNoneOption?: boolean;
  noneOptionLabel?: string;
  className?: string;
  disabled?: boolean;
}

const DiscountTypeSelect: React.FC<DiscountTypeSelectProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Select discount type',
  includeNoneOption = false,
  noneOptionLabel = 'No discount',
  className = '',
  disabled = false,
}) => {
  const { discountTypes, isLoading, error } = useDiscountTypes();
  
  // Sort discount types by sortOrder
  const sortedDiscountTypes = React.useMemo(() => {
    return discountTypes.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  }, [discountTypes]);

  const triggerClasses = `bg-white/10 border-white/20 text-white ${className}`;

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading || disabled}>
      <SelectTrigger className={triggerClasses}>
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading</span>
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
          sortedDiscountTypes.map((dt) => (
            <SelectItem key={dt.id} value={dt.id.toString()}>
              {dt.name}
              {dt.description && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({dt.description})
                </span>
              )}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default DiscountTypeSelect;

