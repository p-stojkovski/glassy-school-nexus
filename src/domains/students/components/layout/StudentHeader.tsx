import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentHeaderProps {
  onAddStudent: () => void;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ onAddStudent }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Student Management
        </h1>
        <p className="text-white/70">Manage student profiles and information</p>
      </div>
      <Button
        onClick={onAddStudent}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Student
      </Button>
    </div>
  );
};

export default StudentHeader;
