import React from 'react';
import { Search, Filter, BookOpen, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GlassCard from '@/components/common/GlassCard';

interface TeacherFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  subjectFilter: string;
  setSubjectFilter: (filter: string) => void;
  clearFilters: () => void;
}

// Available subjects based on TeacherForm options
const SUBJECT_OPTIONS = [
  'Grammar & Writing',
  'Conversation & Speaking',
  'Reading & Comprehension',
  'Listening & Pronunciation',
  'Business English',
  'IELTS Preparation',
  'TOEFL Preparation',
];

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  subjectFilter,
  setSubjectFilter,
  clearFilters,
}) => {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search teachers by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>{' '}
        {/* Subject Filter */}
        <div className="w-full lg:w-56">
          <Select
            value={subjectFilter}
            onValueChange={(value: string) => setSubjectFilter(value)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECT_OPTIONS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Clear Filters Button */}
        <div className="w-full lg:w-auto">
          <Button
            onClick={clearFilters}
            variant="outline"
            className="w-full lg:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default TeacherFilters;
