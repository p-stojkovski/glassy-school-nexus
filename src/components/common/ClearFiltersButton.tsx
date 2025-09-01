import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({ onClick, className = '', disabled = false }) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      className={`w-full lg:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <X className="w-4 h-4 mr-2" />
      Clear Filters
    </Button>
  );
};

export default ClearFiltersButton;

