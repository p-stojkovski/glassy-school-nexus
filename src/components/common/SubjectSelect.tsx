import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { SUBJECTS } from '@/data/subjects';

interface SubjectSelectProps {
  value: string; // SubjectId
  onChange: (id: string) => void;
  placeholder?: string;
  useFallback?: boolean; // When true, use static data as fallback if API fails
}

const SubjectSelect: React.FC<SubjectSelectProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Select subject',
  useFallback = true 
}) => {
  const { subjects: apiSubjects, isLoading, error } = useSubjects();
  
  // Use API subjects if available, otherwise fallback to static data if enabled
  const subjects = React.useMemo(() => {
    if (apiSubjects.length > 0) {
      return apiSubjects.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    }
    
    if (useFallback && (error || apiSubjects.length === 0)) {
      return SUBJECTS.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    }
    
    return [];
  }, [apiSubjects, error, useFallback]);

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger className="bg-white/10 border-white/20 text-white">
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : error && !useFallback ? (
          <div className="flex items-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Error loading</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {subjects.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SubjectSelect;


