import React from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  disabled?: boolean;
  className?: string;
  showStatusText?: boolean;
  statusText?: string;
  clearable?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search... ',
  isSearching = false,
  disabled = false,
  className = '',
  showStatusText = true,
  statusText = 'Searching...',
  clearable = false,
}) => {
  const showClearButton = clearable && value && !isSearching;
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <div className="relative w-5 h-5">
          <Search
            className={`absolute inset-0 text-white/60 w-5 h-5 transition-opacity duration-200 ${
              isSearching ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Loader2
            className={`absolute inset-0 text-blue-400 w-5 h-5 animate-spin transition-opacity duration-200 ${
              isSearching ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`pl-10 ${showClearButton ? 'pr-10' : 'pr-4'} bg-white/10 border-white/20 text-white placeholder:text-white/60 transition-all duration-200 ${
          isSearching
            ? 'border-blue-400/50 bg-white/5'
            : 'hover:border-white/30 focus:border-white/40'
        } ${className}`}
      />

      {showClearButton && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isSearching && showStatusText && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
            <span>{statusText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;