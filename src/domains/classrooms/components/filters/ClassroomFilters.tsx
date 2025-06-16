import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GlassCard from '@/components/common/GlassCard';

interface ClassroomFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ClassroomFilters: React.FC<ClassroomFiltersProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search classrooms by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
      </div>
    </GlassCard>
  );
};

export default ClassroomFilters;
