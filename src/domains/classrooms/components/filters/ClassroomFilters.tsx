import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassroomSearchParams } from '@/types/api/classroom';

interface ClassroomFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchMode: boolean;
  isLoading: boolean;
  onSearch: (params: ClassroomSearchParams) => void;
  onClear: () => void;
}

const ClassroomFilters: React.FC<ClassroomFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
}) => {
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    onSearch({ searchTerm: value });
  }, [setSearchTerm, onSearch]);

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Basic Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search classrooms by name or location..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ClassroomFilters;

