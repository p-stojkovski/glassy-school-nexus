import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS } from '@/data/subjects';

interface SubjectSelectProps {
  value: string; // SubjectId
  onChange: (id: string) => void;
  placeholder?: string;
}

const SubjectSelect: React.FC<SubjectSelectProps> = ({ value, onChange, placeholder = 'Select subject' }) => {
  const subjects = React.useMemo(() => SUBJECTS.slice().sort((a, b) => a.sortOrder - b.sortOrder), []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white/10 border-white/20 text-white">
        <SelectValue placeholder={placeholder} />
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

